import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api.js';

const SUB_BADGE = {
  active: 'badge-green',
  trial: 'badge-blue',
  free: 'badge-gray',
};

export default function Admin() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const del = async (id) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    await api.deleteAdminUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const setSub = async (id, status) => {
    await api.setAdminSubscription(id, status);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, subscription_status: status } : u));
  };

  const chefs = users.filter(u => u.role !== 'admin').length;
  const admins = users.filter(u => u.role === 'admin').length;
  const paid = users.filter(u => u.subscription_status === 'active' || u.subscription_status === 'trial').length;

  return (
    <>
      <div className="topbar"><div className="topbar-title">{t('admin.title')}</div></div>
      <div className="page-content">
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-card"><div className="stat-label">{t('admin.totalUsers')}</div><div className="stat-value">{users.length}</div></div>
          <div className="stat-card"><div className="stat-label">{t('admin.chefs')}</div><div className="stat-value">{chefs}</div></div>
          <div className="stat-card"><div className="stat-label">{t('admin.admins')}</div><div className="stat-value accent">{admins}</div></div>
          <div className="stat-card"><div className="stat-label">Paid / Trial</div><div className="stat-value" style={{ color: 'var(--green)' }}>{paid}</div></div>
        </div>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>{t('admin.colName')}</th>
                <th>{t('admin.colEmail')}</th>
                <th>{t('admin.colRole')}</th>
                <th>{t('admin.colSubscription')}</th>
                <th>{t('admin.colRegistered')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6}><div className="empty-state"><i className="ti ti-loader"></i><p>Loading…</p></div></td></tr>}
              {!loading && users.length === 0 && <tr><td colSpan={6}><div className="empty-state"><i className="ti ti-users"></i><p>{t('admin.none')}</p></div></td></tr>}
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>{u.role}</span></td>
                  <td>
                    <span className={`badge ${SUB_BADGE[u.subscription_status] || 'badge-gray'}`}>
                      {u.subscription_status || 'free'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <div className="action-btns">
                        {u.subscription_status !== 'active' && (
                          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setSub(u.id, 'active')}>{t('admin.setActive')}</button>
                        )}
                        {u.subscription_status !== 'trial' && (
                          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setSub(u.id, 'trial')}>{t('admin.setTrial')}</button>
                        )}
                        {u.subscription_status !== 'free' && (
                          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setSub(u.id, 'free')}>{t('admin.setFree')}</button>
                        )}
                        <button className="icon-btn danger" title={t('admin.deleteBtn')} onClick={() => del(u.id)}><i className="ti ti-trash"></i></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
