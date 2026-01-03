// src/main.jsx 
import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; 
import { ClerkProvider } from '@clerk/clerk-react'; // 1. 匯入 ClerkProvider 
 
// ... 引入其他元件 ... 
import './index.css'; 
import App from './App.jsx'; 

// 頁面元件
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import Cart from "./pages/Cart.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import About from "./pages/About.jsx";

import Orders from "./pages/Orders.jsx";

import { CartProvider } from './contexts/CartProvider'; // 1. 匯入 CartProvider

// 2. 獲取環境變數中的 Publishable Key 
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY; 
 
if (!clerkPublishableKey) { 
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY. Please add it to your .env.local file."); 
} 
 
const router = createBrowserRouter([ 
  { 
    path: "/", 
    element: <App />, 
    children: [    
      {
        index: true,
        element: <Home />,
      },
      {
        path: "menu",
        element: <Menu />,
      },
      {
        path: "about",
        element: <About />,
      },
      { 
        path: "orders",  
        element: <Orders />,
      },
      { 
        path: "cart", 
        element: <Cart />, 
      }, 
      // 加入以下兩個新路由 
      { 
        path: "login", 
        element: <LoginPage />, 
      }, 
      {
        path: "login/sso-callback",
        element: <LoginPage />,
      },
      { 
        path: "register", 
        element: <RegisterPage />, 
      }, 
    ], 
  }, 
]); 

ReactDOM.createRoot(document.getElementById('root')).render( 
  <React.StrictMode> 
    <ClerkProvider publishableKey={clerkPublishableKey}> 
      {/* 2. 用 CartProvider 包裹 RouterProvider */} 
      <CartProvider> 
        <RouterProvider router={router} /> 
      </CartProvider> 
    </ClerkProvider> 
  </React.StrictMode> 
); 

