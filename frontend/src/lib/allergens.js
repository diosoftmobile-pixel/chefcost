// EU 14 mandatory allergens (Regulation EU 1169/2011)
export const ALLERGENS = [
  { key: 'gluten',      label: 'Gluten',      num: 1  },
  { key: 'crustaceans', label: 'Crustaceans', num: 2  },
  { key: 'eggs',        label: 'Eggs',        num: 3  },
  { key: 'fish',        label: 'Fish',        num: 4  },
  { key: 'peanuts',     label: 'Peanuts',     num: 5  },
  { key: 'soybeans',    label: 'Soybeans',    num: 6  },
  { key: 'milk',        label: 'Milk',        num: 7  },
  { key: 'nuts',        label: 'Tree Nuts',   num: 8  },
  { key: 'celery',      label: 'Celery',      num: 9  },
  { key: 'mustard',     label: 'Mustard',     num: 10 },
  { key: 'sesame',      label: 'Sesame',      num: 11 },
  { key: 'sulphites',   label: 'Sulphites',   num: 12 },
  { key: 'lupin',       label: 'Lupin',       num: 13 },
  { key: 'molluscs',    label: 'Molluscs',    num: 14 },
];

export function parseAllergens(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

/** Collect all allergens present in a recipe based on its ingredients. */
export function getRecipeAllergens(recipe, ingredients) {
  const set = new Set();
  (recipe.ingredients || []).forEach(ri => {
    const ing = ingredients.find(i => i.id === ri.ingredient_id);
    if (!ing) return;
    parseAllergens(ing.allergens).forEach(a => set.add(a));
  });
  return [...set];
}

/** Collect all allergens present across all recipes in a menu. */
export function getMenuAllergens(menu, recipes, ingredients) {
  const set = new Set();
  (menu.recipes || []).forEach(mr => {
    const rec = recipes.find(r => r.id === mr.recipe_id);
    if (!rec) return;
    getRecipeAllergens(rec, ingredients).forEach(a => set.add(a));
  });
  return [...set];
}

/** Collect all allergens across all menus of an event. */
export function getEventAllergens(event, menus, recipes, ingredients) {
  const set = new Set();
  (event.menus || []).forEach(em => {
    const menu = menus.find(m => m.id === em.menu_id);
    if (!menu) return;
    getMenuAllergens(menu, recipes, ingredients).forEach(a => set.add(a));
  });
  return [...set];
}

/** Return ALLERGENS entries for a given list of keys, sorted by EU number. */
export function resolveAllergens(keys) {
  return ALLERGENS.filter(a => keys.includes(a.key));
}
