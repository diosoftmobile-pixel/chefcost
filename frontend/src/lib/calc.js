const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£', RON: 'RON ', HUF: 'HUF ' };
export const fmt = n => {
  const c = localStorage.getItem('cc_currency') || 'EUR';
  return (CURRENCY_SYMBOLS[c] || c + ' ') + (Math.round(n * 100) / 100).toFixed(2);
};

/** Raw price per purchase unit (e.g. per kg, per liter) */
export function unitPrice(ing) {
  return ing.purchase_price / ing.purchase_qty;
}

/**
 * Yield-adjusted usable cost per unit.
 * If yield_pct is set (e.g. 80 for 80%), the real cost per usable unit is higher.
 * Formula: unitPrice / (yield_pct / 100)
 */
export function usableCost(ing) {
  const yieldPct = parseFloat(ing.yield_pct);
  const yield_ = (!yieldPct || yieldPct <= 0 || yieldPct > 100) ? 1 : yieldPct / 100;
  return unitPrice(ing) / yield_;
}

/** Tech loss percentage display (100 - yield_pct) */
export function techLossPct(ing) {
  const yieldPct = parseFloat(ing.yield_pct);
  if (!yieldPct || yieldPct <= 0 || yieldPct > 100) return 0;
  return 100 - yieldPct;
}

export function calcRecipeCost(recipe, ingredients) {
  if (!recipe.ingredients) return 0;
  return recipe.ingredients.reduce((sum, ri) => {
    const ing = ingredients.find(i => i.id === ri.ingredient_id);
    if (!ing) return sum;
    return sum + usableCost(ing) * ri.qty;
  }, 0);
}

export function calcCostPerPortion(recipe, ingredients) {
  const cost = calcRecipeCost(recipe, ingredients);
  return recipe.portions > 0 ? cost / recipe.portions : 0;
}

/** Calories per portion based on ingredient nutrition data */
export function calcCaloriesPerPortion(recipe, ingredients) {
  if (!recipe.ingredients) return 0;
  const totalCal = recipe.ingredients.reduce((sum, ri) => {
    const ing = ingredients.find(i => i.id === ri.ingredient_id);
    if (!ing) return sum;
    const cal = parseFloat(ing.cal_per_100g) || 0;
    // qty is in the recipe unit (kg/g/liter/ml/piece)
    // We convert to grams for calorie calculation
    let grams = ri.qty;
    if (ri.unit === 'kg') grams = ri.qty * 1000;
    else if (ri.unit === 'liter') grams = ri.qty * 1000;
    else if (ri.unit === 'ml') grams = ri.qty;
    return sum + (cal / 100) * grams;
  }, 0);
  return recipe.portions > 0 ? totalCal / recipe.portions : 0;
}

export function calcMenuCost(menu, recipes, ingredients) {
  if (!menu.recipes) return 0;
  return menu.recipes.reduce((sum, mr) => {
    const recipe = recipes.find(r => r.id === mr.recipe_id);
    if (!recipe) return sum;
    return sum + calcCostPerPortion(recipe, ingredients) * mr.portions;
  }, 0);
}

export function calcMenuFinalPrice(menu, recipes, ingredients) {
  const cost = calcMenuCost(menu, recipes, ingredients);
  const selling = cost * (1 + menu.markup / 100);
  const vat = selling * (menu.vat / 100);
  return { cost, selling, vat, final: selling + vat };
}

/** Food cost % = food cost / selling price × 100 */
export function foodCostPct(cost, selling) {
  if (!selling || selling === 0) return 0;
  return (cost / selling) * 100;
}

/** Profit per guest = selling price - food cost (excl. VAT) */
export function profitPerGuest(menu, recipes, ingredients) {
  const { cost, selling } = calcMenuFinalPrice(menu, recipes, ingredients);
  return selling - cost;
}

export function calcEventFoodRevenue(event, menus, recipes, ingredients) {
  if (!event.menus) return 0;
  const guests = event.guest_count || 1;
  return event.menus.reduce((sum, em) => {
    const menu = menus.find(m => m.id === em.menu_id);
    if (!menu) return sum;
    return sum + calcMenuFinalPrice(menu, recipes, ingredients).final * guests;
  }, 0);
}

/** Sum of operational costs on an event */
export function calcEventOpCosts(event) {
  return (parseFloat(event.staff_cost) || 0) +
    (parseFloat(event.transport_cost) || 0) +
    (parseFloat(event.rental_cost) || 0) +
    (parseFloat(event.packaging_cost) || 0) +
    (parseFloat(event.other_costs) || 0);
}

/** Food cost (ingredient costs) for the whole event */
export function calcEventFoodCost(event, menus, recipes, ingredients) {
  if (!event.menus) return 0;
  const guests = event.guest_count || 1;
  return event.menus.reduce((sum, em) => {
    const menu = menus.find(m => m.id === em.menu_id);
    if (!menu) return sum;
    return sum + calcMenuCost(menu, recipes, ingredients) * guests;
  }, 0);
}

/**
 * Full event profit breakdown:
 * - foodRevenue: menu selling prices × guests
 * - opCosts: staff + transport + rental + packaging + other
 * - totalRevenue: foodRevenue (the total charged to client)
 * - totalCost: foodCost + opCosts
 * - profit: totalRevenue - totalCost
 * - margin: profit / totalRevenue × 100
 */
export function calcEventProfitBreakdown(event, menus, recipes, ingredients) {
  const foodRevenue = calcEventFoodRevenue(event, menus, recipes, ingredients);
  const foodCost = calcEventFoodCost(event, menus, recipes, ingredients);
  const opCosts = calcEventOpCosts(event);
  const totalCost = foodCost + opCosts;
  const profit = foodRevenue - totalCost;
  const margin = foodRevenue > 0 ? (profit / foodRevenue) * 100 : 0;
  return { foodRevenue, foodCost, opCosts, totalCost, profit, margin };
}

/** Legacy alias used by older code */
export function calcEventTotal(event, menus, recipes, ingredients) {
  return calcEventFoodRevenue(event, menus, recipes, ingredients);
}

export function buildShoppingList(event, menus, recipes, ingredients) {
  const shopping = {};
  const guests = event.guest_count || 1;
  (event.menus || []).forEach(em => {
    const menu = menus.find(m => m.id === em.menu_id);
    if (!menu) return;
    (menu.recipes || []).forEach(mr => {
      const recipe = recipes.find(r => r.id === mr.recipe_id);
      if (!recipe) return;
      const scale = (mr.portions / (recipe.portions || 1)) * guests;
      (recipe.ingredients || []).forEach(ri => {
        const ing = ingredients.find(i => i.id === ri.ingredient_id);
        if (!ing) return;
        if (!shopping[ing.name]) shopping[ing.name] = { unit: ri.unit, qty: 0, cost: 0 };
        shopping[ing.name].qty += ri.qty * scale;
        shopping[ing.name].cost += usableCost(ing) * ri.qty * scale;
      });
    });
  });
  return shopping;
}

export const STATUS_BADGE = {
  'Draft': 'badge-gray', 'Sent Offer': 'badge-blue', 'Approved': 'badge-green',
  'Cancelled': 'badge-red', 'Completed': 'badge-amber',
};
