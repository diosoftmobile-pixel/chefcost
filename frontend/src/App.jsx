import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp.jsx';
import Layout from './components/Layout.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Ingredients from './pages/Ingredients.jsx';
import Recipes from './pages/Recipes.jsx';
import Menus from './pages/Menus.jsx';
import Events from './pages/Events.jsx';
import Admin from './pages/Admin.jsx';
import Settings from './pages/Settings.jsx';
import Billing from './pages/Billing.jsx';

function ProtectedRoutes() {
  const { user, loading } = useApp();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text3)' }}>Loading…</div>;
  if (!user) return <AuthPage />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/menus" element={<Menus />} />
        <Route path="/events" element={<Events />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/billing" element={<Billing />} />
        {user.role === 'admin' && <Route path="/admin" element={<Admin />} />}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ProtectedRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
