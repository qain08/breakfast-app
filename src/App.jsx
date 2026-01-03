// src/App.jsx 
import React from 'react'; 
import { Outlet } from 'react-router-dom'; // 匯入 Outlet 
import Header from './components/layout/Header'; 
import Footer from './components/layout/Footer'; 
 
function App() { 
  return ( 
    <div className="min-h-screen flex flex-col bg-base-100"> 
      <Header /> 
      <main className="flex-1 container mx-auto px-4 py-8"> 
        {/* Outlet 是 react-router 的一個特殊元件， 
            它會根據當前的 URL，將對應的子路由頁面元件渲染到這裡 */} 
        <Outlet /> 
      </main> 
      <Footer /> 
    </div> 
  ); 
} 
 
export default App;


/*
// src/App.jsx 
function App() { 
  return ( 
    <div className="p-8"> 
      <h1 className="text-3xl font-bold text-primary mb-4">早餐時光</h1> 
      <p className="mb-4">我們的專案已經採用了最新的樣式設定！</p> 
      <button className="btn btn-primary">這是一個 DaisyUI 按鈕</button> 
      <button className="btn btn-secondary ml-2">這是第二個按鈕</button> 
    </div> 
  ) 
} 
 
export default App 

// src/App.jsx 
function App() { 
  return ( 
    <div> 
      <h1 className="text-3xl font-bold underline"> 
        Hello World! 
      </h1> 
    </div> 
  ) 
} 
 
export default App 
*/