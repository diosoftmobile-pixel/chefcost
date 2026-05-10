import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken } from '../lib/api.js';

const AppContext = createContext(null);

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

  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    const savedUser = localStorage.getItem('cc_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadAll().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
    await loadAll();
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    setToken(data.token);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
    await loadAll();
  };

  const logout = () => {
    clearToken(); localStorage.removeItem('cc_user');
    setUser(null); setIngredients([]); setRecipes([]); setMenus([]); setEvents([]);
  };

  return (
    <AppContext.Provider value={{ user, login, register, logout, loading, ingredients, setIngredients, recipes, setRecipes, menus, setMenus, events, setEvents, loadAll }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
