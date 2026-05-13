import { Router } from 'express';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// Helper — compute menu cost per person given its recipe list
function menuCostPerGuest(menuId) {
  const recipes = db.prepare(`
    SELECT mr.portions, r.portions as recipe_portions,
      (SELECT COALESCE(SUM(ri.qty * (i.purchase_price/i.purchase_qty)), 0)
       FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
       WHERE ri.recipe_id = r.id) as recipe_cost
    FROM menu_recipes mr JOIN recipes r ON r.id = mr.recipe_id WHERE mr.menu_id = ?
  `).all(menuId);
  return recipes.reduce((s, r) => s + (r.recipe_portions > 0 ? (r.recipe_cost / r.recipe_portions) * r.portions : 0), 0);
}

// GET /api/reports/menus — Menu Profitability
router.get('/menus', (req, res) => {
  const menus = db.prepare('SELECT * FROM menus WHERE user_id = ?').all(req.user.id);
  const rows = menus.map(m => {
    const cost = menuCostPerGuest(m.id);
    const selling = cost * (1 + m.markup / 100);
    const vatAmt = selling * (m.vat / 100);
    const final = selling + vatAmt;
    const foodCostPct = final > 0 ? (cost / final) * 100 : 0;
    const profitPerGuest = final - cost;
    return {
      id: m.id, name: m.name, description: m.description,
      markup: m.markup, vat: m.vat,
      cost: Math.round(cost * 100) / 100,
      selling: Math.round(selling * 100) / 100,
      final: Math.round(final * 100) / 100,
      foodCostPct: Math.round(foodCostPct * 10) / 10,
      profitPerGuest: Math.round(profitPerGuest * 100) / 100,
      risk: foodCostPct > 40 ? 'risky' : foodCostPct > 35 ? 'warning' : 'healthy',
    };
  });
  res.json(rows);
});

// GET /api/reports/events — Event Profitability
router.get('/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY event_date DESC').all(req.user.id);
  const rows = events.map(ev => {
    const evMenus = db.prepare('SELECT * FROM event_menus WHERE event_id = ?').all(ev.id);
    let foodCost = 0;
    evMenus.forEach(em => {
      const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(em.menu_id);
      if (!menu) return;
      const mCost = menuCostPerGuest(menu.id);
      const mSelling = mCost * (1 + menu.markup / 100);
      const mFinal = mSelling * (1 + menu.vat / 100);
      foodCost += mFinal * ev.guest_count;
    });
    const opCosts = (ev.staff_cost || 0) + (ev.transport_cost || 0) + (ev.rental_cost || 0) + (ev.packaging_cost || 0) + (ev.other_costs || 0);
    const totalRevenue = foodCost;
    const totalCost = foodCost + opCosts;
    const profit = totalRevenue - opCosts;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    return {
      id: ev.id, name: ev.name, client_name: ev.client_name, event_date: ev.event_date,
      guest_count: ev.guest_count, status: ev.status, quote_number: ev.quote_number,
      foodRevenue: Math.round(foodCost * 100) / 100,
      opCosts: Math.round(opCosts * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      margin: Math.round(margin * 10) / 10,
    };
  });
  res.json(rows);
});

// GET /api/reports/ingredients — Ingredient Cost Report
router.get('/ingredients', (req, res) => {
  const ings = db.prepare('SELECT * FROM ingredients WHERE user_id = ? ORDER BY category, name').all(req.user.id);
  const rows = ings.map(i => {
    const unitCost = i.purchase_qty > 0 ? i.purchase_price / i.purchase_qty : 0;
    const usableCost = i.yield_pct > 0 ? unitCost / (i.yield_pct / 100) : unitCost;
    const usedIn = db.prepare('SELECT COUNT(*) as n FROM recipe_ingredients WHERE ingredient_id = ?').get(i.id).n;
    return {
      id: i.id, name: i.name, category: i.category, unit: i.unit,
      purchase_qty: i.purchase_qty, purchase_price: i.purchase_price,
      yield_pct: i.yield_pct, supplier: i.supplier,
      unitCost: Math.round(unitCost * 1000) / 1000,
      usableCost: Math.round(usableCost * 1000) / 1000,
      usedInRecipes: usedIn,
      updated_at: i.updated_at,
    };
  });
  res.json(rows);
});

// GET /api/reports/allergens — Allergen compliance summary
router.get('/allergens', (req, res) => {
  const ALLERGENS = ['gluten','crustaceans','eggs','fish','peanuts','soybeans','milk','nuts','celery','mustard','sesame','sulphites','lupin','molluscs'];
  const ings = db.prepare('SELECT id, name, allergens FROM ingredients WHERE user_id = ?').all(req.user.id);
  const recipes = db.prepare('SELECT r.id, r.name FROM recipes r WHERE r.user_id = ?').all(req.user.id);
  const menus = db.prepare('SELECT m.id, m.name FROM menus m WHERE m.user_id = ?').all(req.user.id);

  const result = ALLERGENS.map(key => {
    const ingIds = ings.filter(i => {
      try { return JSON.parse(i.allergens || '[]').includes(key); } catch { return false; }
    }).map(i => i.id);
    const recipeIds = new Set();
    ingIds.forEach(iid => {
      db.prepare('SELECT recipe_id FROM recipe_ingredients WHERE ingredient_id = ?').all(iid)
        .forEach(r => recipeIds.add(r.recipe_id));
    });
    const menuIds = new Set();
    [...recipeIds].forEach(rid => {
      db.prepare('SELECT menu_id FROM menu_recipes WHERE recipe_id = ?').all(rid)
        .forEach(m => menuIds.add(m.menu_id));
    });
    return {
      key, ingredientCount: ingIds.length, recipeCount: recipeIds.size, menuCount: menuIds.size,
      ingredients: ings.filter(i => ingIds.includes(i.id)).map(i => i.name),
    };
  });
  res.json(result);
});

// GET /api/reports/monthly — Monthly revenue from events
router.get('/monthly', (req, res) => {
  const events = db.prepare("SELECT event_date, guest_count, id FROM events WHERE user_id = ? AND status != 'Cancelled'").all(req.user.id);
  const evMenus = {};
  events.forEach(ev => {
    const ms = db.prepare('SELECT * FROM event_menus WHERE event_id = ?').all(ev.id);
    let rev = 0;
    ms.forEach(em => {
      const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(em.menu_id);
      if (!menu) return;
      const cost = menuCostPerGuest(menu.id);
      const final = cost * (1 + menu.markup / 100) * (1 + menu.vat / 100);
      rev += final * ev.guest_count;
    });
    const month = (ev.event_date || '').slice(0, 7);
    if (!month) return;
    if (!evMenus[month]) evMenus[month] = { month, revenue: 0, events: 0 };
    evMenus[month].revenue += rev;
    evMenus[month].events += 1;
  });
  const rows = Object.values(evMenus)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(r => ({ ...r, revenue: Math.round(r.revenue * 100) / 100 }));
  res.json(rows);
});

export default router;
