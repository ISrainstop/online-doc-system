import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DocumentList from './pages/DocumentList';
import EditorPage from './pages/EditorPage';
import AdminPage from './pages/AdminPage';
function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  // 登录成功回调
  const handleLoginSuccess = (newToken: string, username: string, role: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role); // 🔥 保存角色到本地存储
    setToken(newToken);
  };

  // 退出登录回调
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role'); // 🔥 清除角色
    setToken(null);
  };

  return (
    // 这里保留唯一的 BrowserRouter
    <BrowserRouter>
      <Routes>
        {/* 登录页 */}
        <Route 
          path="/login" 
          element={
            !token ? 
            <AuthPage onLoginSuccess={handleLoginSuccess} /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/admin" 
          element={
            token ? 
            <AdminPage token={token} onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } 
        />
        {/* 文档列表页 (首页) */}
        <Route 
          path="/" 
          element={
            token ? 
            <DocumentList token={token} onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } 
        />

        {/* 编辑器页 */}
        <Route 
          path="/doc/:id" 
          element={
            token ? 
            <EditorPageWrapper token={token} /> : 
            <Navigate to="/login" replace />
          } 
        />

        {/* 捕获所有未知路径，重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// 辅助组件：因为 EditorPage 需要 props 传递，而 useParams 只能在 Router 内部使用
// 这个 Wrapper 负责从 URL 提取 id 并传给 EditorPage
const EditorPageWrapper = ({ token }: { token: string }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // onBackToList 负责处理点击"返回"按钮的逻辑
  return (
    <EditorPage 
      documentId={id!} 
      token={token} 
      onBackToList={() => navigate('/')} 
    />
  );
};

export default App;