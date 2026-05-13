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

function NavItem({ to, icon, label, badge, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      <i className={`ti ${icon}`}></i>
      <span className="nav-label-text">{label}</span>
      {badge !== undefined && badge !== null && (
        <span className="nav-badge">{badge}</span>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout, ingredients, recipes, menus, events, isPaid } = useApp();
  const { t, i18n: i18nInst } = useTranslation();

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="app">
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon"><i className="ti ti-chef-hat"></i></div>
          <div>
            <div className="brand-name">App4Chef</div>
            <div className="brand-sub">{t('nav.brandSub')}</div>
          </div>
        </div>

        {/* Workspace card */}
        <div className="sidebar-workspace">
          <div className="workspace-avatar">{initials}</div>
          <div className="workspace-info">
            <div className="workspace-name">{user?.name}</div>
            <div className="workspace-plan">
              {user?.subscription_status === 'active' ? t('nav.planPro') :
               user?.subscription_status === 'trial' ? t('nav.planTrial') :
               t('nav.planFree')}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">{t('nav.overview')}</div>
            <NavItem to="/" end icon="ti-layout-dashboard" label={t('nav.dashboard')} />
          </div>

          <div className="nav-section">
            <div className="nav-section-label">{t('nav.costing')}</div>
            <NavItem to="/ingredients" icon="ti-basket" label={t('nav.ingredients')} badge={ingredients.length} />
            <NavItem to="/recipes" icon="ti-notebook" label={t('nav.recipes')} badge={recipes.length} />
            <NavItem to="/menus" icon="ti-list" label={t('nav.menus')} badge={menus.length} />
          </div>

          <div className="nav-section">
            <div className="nav-section-label">{t('nav.operations')}</div>
            <NavItem to="/events" icon="ti-calendar-event" label={t('nav.events')} badge={events.length} />
            <NavItem to="/quotes" icon="ti-file-invoice" label={t('nav.quotes')} />
          </div>

          <div className="nav-section">
            <div className="nav-section-label">{t('nav.insights')}</div>
            <NavItem to="/allergens" icon="ti-shield-check" label={t('nav.allergens')} />
            <NavItem to="/reports" icon="ti-chart-bar" label={t('nav.reports')} />
            <NavItem to="/ai-advisor" icon="ti-robot" label={t('nav.aiAdvisor')} />
          </div>

          <div className="nav-section">
            <div className="nav-section-label">{t('nav.account')}</div>
            <NavItem to="/settings" icon="ti-settings" label={t('nav.settings')} />
            <NavItem
              to="/billing"
              icon="ti-credit-card"
              label={t('nav.billing')}
              badge={!isPaid ? 'FREE' : null}
            />
          </div>

          {user?.role === 'admin' && (
            <div className="nav-section">
              <div className="nav-section-label">{t('nav.administration')}</div>
              <NavItem to="/admin" icon="ti-shield-lock" label={t('nav.admin')} />
            </div>
          )}
        </nav>

        {/* AI Promo card */}
        <div className="sidebar-ai-card">
          <div className="ai-card-icon">🤖</div>
          <div className="ai-card-text">
            <div className="ai-card-title">{t('nav.aiCardTitle')}</div>
            <div className="ai-card-desc">{t('nav.aiCardDesc')}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-langs">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => changeLang(l.code)}
                className={`lang-btn${i18nInst.language === l.code ? ' active' : ''}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost sidebar-logout" onClick={logout}>
            <i className="ti ti-logout"></i>
            <span className="nav-label-text">{t('nav.signOut')}</span>
          </button>
        </div>
      </aside>

      <div className="main">
        {/* Mobile bottom nav */}
        <nav className="mobile-bottom-nav">
          <NavLink to="/" end className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
            <i className="ti ti-layout-dashboard"></i>
            <span>{t('nav.dashboard')}</span>
          </NavLink>
          <NavLink to="/ingredients" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
            <i className="ti ti-basket"></i>
            <span>{t('nav.ingredients')}</span>
          </NavLink>
          <NavLink to="/menus" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
            <i className="ti ti-list"></i>
            <span>{t('nav.menus')}</span>
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
            <i className="ti ti-calendar-event"></i>
            <span>{t('nav.events')}</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
            <i className="ti ti-settings"></i>
            <span>{t('nav.settings')}</span>
          </NavLink>
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
