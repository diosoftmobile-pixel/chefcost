import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import i18n from '../i18n/index.js';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ro', label: 'RO' },
  { code: 'hu', label: 'HU' },
];

function changeLang(code) {
  i18n.changeLanguage(code);
  localStorage.setItem('cc_lang', code);
}

export default function Layout() {
  const { user, logout, ingredients, recipes, menus, events } = useApp();
  const { t, i18n: i18nInst } = useTranslation();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><i className="ti ti-chef-hat"></i></div>
          <div className="brand-name">ChefCost</div>
          <div className="brand-sub">{t('nav.brandSub')}</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">{t('nav.overview')}</div>
            <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-layout-dashboard"></i> {t('nav.dashboard')}
            </NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.costing')}</div>
            <NavLink to="/ingredients" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-basket"></i> {t('nav.ingredients')}
              <span className="nav-badge">{ingredients.length}</span>
            </NavLink>
            <NavLink to="/recipes" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-notebook"></i> {t('nav.recipes')}
              <span className="nav-badge">{recipes.length}</span>
            </NavLink>
            <NavLink to="/menus" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-list"></i> {t('nav.menus')}
              <span className="nav-badge">{menus.length}</span>
            </NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.operations')}</div>
            <NavLink to="/events" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-calendar-event"></i> {t('nav.events')}
              <span className="nav-badge">{events.length}</span>
            </NavLink>
          </div>
          {user?.role === 'admin' && (
            <div className="nav-section">
              <div className="nav-label">{t('nav.administration')}</div>
              <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <i className="ti ti-shield-lock"></i> {t('nav.admin')}
              </NavLink>
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => changeLang(l.code)}
                style={{
                  flex: 1, fontSize: 11, padding: '3px 0', border: '1px solid var(--border)',
                  borderRadius: 4, cursor: 'pointer', fontWeight: i18nInst.language === l.code ? 700 : 400,
                  background: i18nInst.language === l.code ? 'var(--accent)' : 'transparent',
                  color: i18nInst.language === l.code ? '#fff' : 'var(--text3)',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
            <i className="ti ti-user" style={{ marginRight: 6 }}></i>
            {user?.name} <span className="badge badge-gray" style={{ marginLeft: 4 }}>{user?.role}</span>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={logout}>
            <i className="ti ti-logout"></i> {t('nav.signOut')}
          </button>
        </div>
      </aside>
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}
