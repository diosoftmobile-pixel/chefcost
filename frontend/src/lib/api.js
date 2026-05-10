const BASE = '/api';

function getToken() { return localStorage.getItem('cc_token'); }
export function setToken(t) { localStorage.setItem('cc_token', t); }
export function clearToken() { localStorage.removeItem('cc_token'); }

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (email, password) => req('POST', '/auth/login', { email, password }),
  register: (name, email, password) => req('POST', '/auth/register', { name, email, password }),

  getIngredients: () => req('GET', '/ingredients'),
  createIngredient: (d) => req('POST', '/ingredients', d),
  updateIngredient: (id, d) => req('PUT', `/ingredients/${id}`, d),
  deleteIngredient: (id) => req('DELETE', `/ingredients/${id}`),

  getRecipes: () => req('GET', '/recipes'),
  createRecipe: (d) => req('POST', '/recipes', d),
  updateRecipe: (id, d) => req('PUT', `/recipes/${id}`, d),
  deleteRecipe: (id) => req('DELETE', `/recipes/${id}`),

  getMenus: () => req('GET', '/menus'),
  createMenu: (d) => req('POST', '/menus', d),
  updateMenu: (id, d) => req('PUT', `/menus/${id}`, d),
  deleteMenu: (id) => req('DELETE', `/menus/${id}`),

  getEvents: () => req('GET', '/events'),
  createEvent: (d) => req('POST', '/events', d),
  updateEvent: (id, d) => req('PUT', `/events/${id}`, d),
  deleteEvent: (id) => req('DELETE', `/events/${id}`),
};
