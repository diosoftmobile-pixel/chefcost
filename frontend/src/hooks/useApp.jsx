import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken } from '../lib/api.js';
import i18n from '../i18n/index.js';

const AppContext = createContext(null);

function applyUserPrefs(user) {
  if (user?.currency) localStorage.setItem('cc_currency', user.currency);
  if (user?.language) {
    localStorage.setItem('cc_lang', user.language);
    i18n.changeLanguage(user.language);
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [ings, recs, mens, evts] = await Promise.all([
        api.getIngredients(), api.getRecipes(), api.getMenus(), api.getEvents()
      ]);
      setIngredients(ings); setRecipes(recs); setMenus(mens); setEvents(evts);
    } catch {}
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setUser(data);
      applyUserPrefs(data);
      localStorage.setItem('cc_user', JSON.stringify(data));
    } catch {}
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    const savedUser = localStorage.getItem('cc_user');
    if (token && savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      applyUserPrefs(u);
      Promise.all([refreshUser(), loadAll()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
    applyUserPrefs(data.user);
    await loadAll();
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    setToken(data.token);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
    applyUserPrefs(data.user);
    await loadAll();
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem('cc_user');
    setUser(null); setIngredients([]); setRecipes([]); setMenus([]); setEvents([]);
  };

  const isPaid = user?.role === 'admin'
    || user?.subscription_status === 'active'
    || (user?.subscription_status === 'trial' && user?.trial_end && new Date(user.trial_end) > new Date());

  return (
    <AppContext.Provider value={{
      user, login, register, logout, loading, isPaid, refreshUser,
      ingredients, setIngredients, recipes, setRecipes,
      menus, setMenus, events, setEvents, loadAll
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
