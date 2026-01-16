import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css'; // 复用全局样式

interface Stats {
  users: number;
  documents: number;
  versions: number;
}

interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  _count: {
    documents: number;
  };
}

interface Document {
  id: string;
  title: string;
  updatedAt: string;
  createdBy: {
    username: string;
  };
}

interface Props {
  token: string;
  onLogout: () => void;
}

const AdminPage: React.FC<Props> = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'documents'>('stats');
  
  // 数据状态
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  // 检查权限（防止非管理员直接通过 URL 访问）
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN') {
      alert('权限不足');
      navigate('/');
    }
  }, [navigate]);

  // 根据当前 Tab 加载数据
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      if (activeTab === 'stats') endpoint = '/admin/stats';
      else if (activeTab === 'users') endpoint = '/admin/users';
      else if (activeTab === 'documents') endpoint = '/admin/documents';

      const res = await fetch(`${apiUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('加载数据失败');
      
      const data = await res.json();
      
      if (activeTab === 'stats') setStats(data);
      else if (activeTab === 'users') setUsers(data);
      else if (activeTab === 'documents') setDocuments(data);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('确定要删除该用户吗？此操作不可逆！')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除失败');
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 删除文档 (管理员使用通用删除接口或管理员专用接口)
  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('确定要强制删除此文档吗？')) return;
    try {
      // 注意：根据你的后端路由注释，这里复用常规文档删除接口
      // 前提是后端 DELETE /documents/:id 中间件需要允许 ADMIN 删除任意文档
      // 或者你需要去后端 admin.routes.ts 开启那个被注释的删除接口
      const res = await fetch(`${apiUrl}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('删除失败');
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err: any) {
      alert('删除失败，可能后端未开放管理员删除任意文档的权限');
    }
  };

  return (
    <div className="doc-list-container">
      {/* 顶部导航 */}
      <header className="doc-list-header" style={{ background: '#1e293b', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/')} className="btn-outline" style={{ color: 'white', borderColor: 'white' }}>
            ← 返回首页
          </button>
          <h3>🛡️ 管理员控制台</h3>
        </div>
        <button onClick={onLogout} className="btn-outline" style={{ color: '#f87171', borderColor: '#f87171' }}>
          退出登录
        </button>
      </header>

      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className={`btn-primary ${activeTab === 'stats' ? '' : 'btn-outline'}`}
            style={activeTab !== 'stats' ? { background: 'transparent', color: '#333' } : {}}
            onClick={() => setActiveTab('stats')}
          >
            📊 系统统计
          </button>
          <button 
            className={`btn-primary ${activeTab === 'users' ? '' : 'btn-outline'}`}
            style={activeTab !== 'users' ? { background: 'transparent', color: '#333' } : {}}
            onClick={() => setActiveTab('users')}
          >
            👥 用户管理
          </button>
          <button 
            className={`btn-primary ${activeTab === 'documents' ? '' : 'btn-outline'}`}
            style={activeTab !== 'documents' ? { background: 'transparent', color: '#333' } : {}}
            onClick={() => setActiveTab('documents')}
          >
            📄 文档管理
          </button>
        </div>

        {/* 内容区域 */}
        <div className="card">
          {loading && <div className="loading">加载中...</div>}
          {error && <div className="error-text">{error}</div>}

          {/* 1. 统计面板 */}
          {!loading && activeTab === 'stats' && stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#2563eb' }}>{stats.users}</div>
                <div className="muted">注册用户</div>
              </div>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#10b981' }}>{stats.documents}</div>
                <div className="muted">总文档数</div>
              </div>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.versions}</div>
                <div className="muted">历史版本记录</div>
              </div>
            </div>
          )}

          {/* 2. 用户列表 */}
          {!loading && activeTab === 'users' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>用户名</th>
                  <th style={{ padding: '10px' }}>角色</th>
                  <th style={{ padding: '10px' }}>文档数</th>
                  <th style={{ padding: '10px' }}>注册时间</th>
                  <th style={{ padding: '10px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>
                      <strong>{u.username}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontSize: '12px',
                        background: u.role === 'ADMIN' ? '#fee2e2' : '#dbeafe',
                        color: u.role === 'ADMIN' ? '#991b1b' : '#1e40af'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>{u._count.documents}</td>
                    <td style={{ padding: '10px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '10px' }}>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="delete-btn"
                        style={{ position: 'static', width: 'auto', padding: '5px 10px', fontSize: '14px' }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 3. 文档列表 */}
          {!loading && activeTab === 'documents' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>标题</th>
                  <th style={{ padding: '10px' }}>创建者</th>
                  <th style={{ padding: '10px' }}>最后更新</th>
                  <th style={{ padding: '10px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>
                      <a href={`/doc/${d.id}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                        {d.title} ↗
                      </a>
                    </td>
                    <td style={{ padding: '10px' }}>{d.createdBy?.username || '未知'}</td>
                    <td style={{ padding: '10px' }}>{new Date(d.updatedAt).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <button 
                        onClick={() => handleDeleteDocument(d.id)}
                        className="delete-btn"
                        style={{ position: 'static', width: 'auto', padding: '5px 10px', fontSize: '14px' }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;