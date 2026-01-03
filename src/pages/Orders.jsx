import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { fetchOrders } from "../services/api";

// 訂單狀態中文顯示
const STATUS_TEXT = {
  pending: "處理中",
  paid: "已付款",
  completed: "已完成",
  cancelled: "已取消",
};

export default function Orders() {
  const { user, isLoaded } = useUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    const loadOrders = async () => {
      try {
        const data = await fetchOrders(user.id);
        setOrders(data);
      } catch (err) {
        setError(err.message || "載入訂單失敗");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isLoaded, user]);

  // 尚未載入完成
  if (!isLoaded || loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        載入訂單中…
      </div>
    );
  }

  // 發生錯誤
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">歷史訂單</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">目前尚無任何訂單。</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              {/* 訂單資訊 */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">
                  訂單編號：{order.id}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">
                    {STATUS_TEXT[order.status] || order.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-3">
                下單時間：
                {new Date(order.createdAt).toLocaleString()}
              </div>

              {/* 商品列表 */}
              <ul className="divide-y">
                {order.items.map((item) => (
                  <li
                    key={item.menuItemId}
                    className="py-2 flex justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        單價 ${item.price} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold">
                      ${item.price * item.quantity}
                    </div>
                  </li>
                ))}
              </ul>

              {/* 總金額 */}
              <div className="text-right font-bold text-lg mt-4">
                總金額：${order.totalAmount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
