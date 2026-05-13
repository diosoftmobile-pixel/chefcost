import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Ingredients from './pages/Ingredients.jsx';
import Recipes from './pages/Recipes.jsx';
import Menus from './pages/Menus.jsx';
import Events from './pages/Events.jsx';
import Admin from './pages/Admin.jsx';
import AdminResearch from './pages/AdminResearch.jsx';
import Redeem from './pages/Redeem.jsx';
import Settings from './pages/Settings.jsx';
import Billing from './pages/Billing.jsx';
import Allergens from './pages/Allergens.jsx';
import Reports from './pages/Reports.jsx';
import Quotes from './pages/Quotes.jsx';
import AIAdvisor from './pages/AIAdvisor.jsx';

function ProtectedRoutes() {
  const { user, loading } = useApp();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text3)' }}>Loading…</div>;

  // /redeem must work for both logged-out and free users — handle before other gates
  if (window.location.pathname === '/redeem') return <Redeem />;

  if (!user) return <Landing />;

  // Free accounts must choose a plan before accessing the app
  const isFree = user.subscription_status === 'free';
  if (isFree) {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/billing" element={<Billing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/billing" />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/menus" element={<Menus />} />
        <Route path="/events" element={<Events />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/allergens" element={<Allergens />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/billing" element={<Billing />} />
        {user.role === 'admin' && <Route path="/admin" element={<Admin />} />}
        {user.role === 'admin' && <Route path="/admin/research" element={<AdminResearch />} />}
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
