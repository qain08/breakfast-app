// src/contexts/CartProvider.jsx 
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useOptimistic,
  startTransition,
} from 'react';
import { useUser } from '@clerk/clerk-react';
import CartContext from './cartContext';
import * as api from '../services/api';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id;

  /**
   *  Optimistic Cart
   */
  const [optimisticCartItems, optimisticDispatch] = useOptimistic(
    cartItems,
    (state, action) => {
      switch (action.type) {
        case 'ADD_ITEM': {
          const existing = state.find(
            (i) => i.menuItemId === action.payload.menuItemId
          );

          if (existing) {
            return state.map((i) =>
              i.menuItemId === action.payload.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          }

          return [...state, action.payload];
        }

        case 'ROLLBACK':
          return action.payload;

        default:
          return state;
      }
    }
  );

  //  初始載入購物車   
  useEffect(() => {
    if (!isUserLoaded) return;

    if (!userId) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    const loadCart = async () => {
      setIsLoading(true);
      try {
        const items = await api.fetchCart(userId);
        setCartItems(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [userId, isUserLoaded]);

   //重新獲取購物車
  const refreshCart = useCallback(async () => {
    if (!userId) return;
    try {
      const items = await api.fetchCart(userId);
      setCartItems(items);
    } catch (err) {
      console.error('刷新購物車失敗:', err);
    }
  }, [userId]);

  // Optimistic addToCart
  const addToCart = useCallback(
    async (menuItem) => {
      if (!userId) throw new Error('請先登入');
      const snapshot = cartItems;
      // 立即更新 UI
      startTransition(() => {
        optimisticDispatch({
          type: 'ADD_ITEM',
          payload: {
            id: `optimistic-${menuItem.id}`,
            userId,
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        });
      });
      try {
        const existingItem = await api.findCartItemByMenuId(
          menuItem.id,
          userId
        );

        if (existingItem) {
          await api.updateCartItem(existingItem.id, {
            quantity: existingItem.quantity + 1,
          });
        } else {
          await api.addCartItem({
            ...menuItem,
            menuItemId: menuItem.id,
            id: undefined,
            userId,
            quantity: 1,
          });
        }

        //  同步 server 狀態
        await refreshCart();
      } catch (err) {
        //  失敗 rollback
        startTransition(() => {
          optimisticDispatch({
            type: 'ROLLBACK',
            payload: snapshot,
          });
        });

        setError(err.message);
        throw err;
      }
    },
    [userId, cartItems, refreshCart]
  );


  const updateQuantity = useCallback(
    async (itemId, newQuantity) => {
      const quantity = Math.max(0, newQuantity);
      if (quantity === 0) {
        await removeFromCart(itemId);
      } else {
        await api.updateCartItem(itemId, { quantity });
        await refreshCart();
      }
    },
    [refreshCart]
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      await api.removeCartItem(itemId);
      await refreshCart();
    },
    [refreshCart]
  );

  const cartCount = useMemo(
    () =>
      optimisticCartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [optimisticCartItems]
  );

  const totalAmount = useMemo(
    () =>
      optimisticCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [optimisticCartItems]
  );

  const clearCart = useCallback(async () => {
    if (!userId) return;
    try {
      const userCartItems = await api.fetchCart(userId);
      for (const item of userCartItems) {
        await api.removeCartItem(item.id);
      }
      await refreshCart();
    } catch (err) {
      console.error('清空購物車失敗:', err);
      setError(err.message);
    }
  }, [userId, refreshCart]);

  const checkout = useCallback(async () => {
    if (!userId || cartItems.length === 0) {
      throw new Error('購物車是空的或使用者未登入');
    }

    const orderPayload = {
      userId,
      items: cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await api.createOrder(orderPayload);
      await clearCart();
    } catch (err) {
      console.error('結帳失敗:', err);
      setError(err.message);
      throw err;
    }
  }, [userId, cartItems, totalAmount, clearCart]);

  const value = useMemo(
    () => ({
      cartItems: optimisticCartItems, //  對外一律使用 optimistic
      cartCount,
      totalAmount,
      isLoading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      checkout,
      clearCart,
    }),
    [
      optimisticCartItems,
      cartCount,
      totalAmount,
      isLoading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      checkout,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}