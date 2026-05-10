import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../hooks/useApp.jsx';

export default function Layout() {
  const { user, logout, ingredients, recipes, menus, events } = useApp();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><i className="ti ti-chef-hat"></i></div>
          <div className="brand-name">ChefCost</div>
          <div className="brand-sub">Event Cost Calculator</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Overview</div>
            <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-layout-dashboard"></i> Dashboard
            </NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-label">Costing</div>
            <NavLink to="/ingredients" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-basket"></i> Ingredients
              <span className="nav-badge">{ingredients.length}</span>
            </NavLink>
            <NavLink to="/recipes" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-notebook"></i> Recipes
              <span className="nav-badge">{recipes.length}</span>
            </NavLink>
            <NavLink to="/menus" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-list"></i> Menus
              <span className="nav-badge">{menus.length}</span>
            </NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-label">Operations</div>
            <NavLink to="/events" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className="ti ti-calendar-event"></i> Events
              <span className="nav-badge">{events.length}</span>
            </NavLink>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
            <i className="ti ti-user" style={{ marginRight: 6 }}></i>
            {user?.name} <span className="badge badge-gray" style={{ marginLeft: 4 }}>{user?.role}</span>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={logout}>
            <i className="ti ti-logout"></i> Sign out
          </button>
        </div>
      </aside>
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}
