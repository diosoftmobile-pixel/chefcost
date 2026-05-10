const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£', RON: 'RON ', HUF: 'HUF ' };
export const fmt = n => {
  const c = localStorage.getItem('cc_currency') || 'EUR';
  return (CURRENCY_SYMBOLS[c] || c + ' ') + (Math.round(n * 1000) / 1000).toFixed(3);
};

export function unitPrice(ing) {
  return ing.purchase_price / ing.purchase_qty;
}

export function calcRecipeCost(recipe, ingredients) {
  if (!recipe.ingredients) return 0;
  return recipe.ingredients.reduce((sum, ri) => {
    const ing = ingredients.find(i => i.id === ri.ingredient_id);
    if (!ing) return sum;
    return sum + unitPrice(ing) * ri.qty;
  }, 0);
}

export function calcCostPerPortion(recipe, ingredients) {
  const cost = calcRecipeCost(recipe, ingredients);
  return recipe.portions > 0 ? cost / recipe.portions : 0;
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

export function calcEventTotal(event, menus, recipes, ingredients) {
  if (!event.menus) return 0;
  const guests = event.guest_count || 1;
  return event.menus.reduce((sum, em) => {
    const menu = menus.find(m => m.id === em.menu_id);
    if (!menu) return sum;
    return sum + calcMenuFinalPrice(menu, recipes, ingredients).final * guests;
  }, 0);
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
        shopping[ing.name].cost += unitPrice(ing) * ri.qty * scale;
      });
    });
  });
  return shopping;
}

export const STATUS_BADGE = {
  'Draft': 'badge-gray', 'Sent Offer': 'badge-blue', 'Approved': 'badge-green',
  'Cancelled': 'badge-red', 'Completed': 'badge-amber',
};
