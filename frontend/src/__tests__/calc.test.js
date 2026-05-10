import { describe, it, expect } from 'vitest';
import {
  unitPrice,
  calcRecipeCost,
  calcCostPerPortion,
  calcMenuCost,
  calcMenuFinalPrice,
  calcEventTotal,
  buildShoppingList,
} from '../lib/calc.js';

const ing1 = { id: 'i1', name: 'Beef', purchase_price: 38, purchase_qty: 1, unit: 'kg' };
const ing2 = { id: 'i2', name: 'Cream', purchase_price: 3.8, purchase_qty: 1, unit: 'liter' };
const ingredients = [ing1, ing2];

const recipe = {
  id: 'r1',
  portions: 10,
  ingredients: [
    { ingredient_id: 'i1', qty: 2 },
    { ingredient_id: 'i2', qty: 0.5 },
  ],
};

const menu = {
  id: 'm1',
  guest_count: 10,
  markup: 30,
  vat: 19,
  recipes: [{ recipe_id: 'r1', portions: 10 }],
};

const recipes = [recipe];
const menus = [menu];

const event = {
  id: 'e1',
  menus: [{ menu_id: 'm1', quantity: 1 }],
};

describe('unitPrice', () => {
  it('calculates price per unit', () => {
    expect(unitPrice(ing1)).toBe(38);
  });

  it('handles purchase_qty > 1', () => {
    expect(unitPrice({ purchase_price: 10, purchase_qty: 2 })).toBe(5);
  });
});

describe('calcRecipeCost', () => {
  it('sums ingredient costs', () => {
    // 2kg beef @ 38 + 0.5L cream @ 3.8 = 76 + 1.9 = 77.9
    expect(calcRecipeCost(recipe, ingredients)).toBeCloseTo(77.9);
  });

  it('returns 0 for recipe with no ingredients', () => {
    expect(calcRecipeCost({ ingredients: [] }, ingredients)).toBe(0);
  });

  it('skips missing ingredients', () => {
    const r = { ingredients: [{ ingredient_id: 'missing', qty: 1 }] };
    expect(calcRecipeCost(r, ingredients)).toBe(0);
  });
});

describe('calcCostPerPortion', () => {
  it('divides total cost by portions', () => {
    // 77.9 / 10 = 7.79
    expect(calcCostPerPortion(recipe, ingredients)).toBeCloseTo(7.79);
  });

  it('returns 0 when portions is 0', () => {
    expect(calcCostPerPortion({ ...recipe, portions: 0 }, ingredients)).toBe(0);
  });
});

describe('calcMenuFinalPrice', () => {
  it('calculates cost, markup, vat and final price', () => {
    // cost per portion = 7.79, 10 portions = 77.9
    // selling = 77.9 * 1.30 = 101.27
    // vat = 101.27 * 0.19 = 19.2413
    // final = 101.27 + 19.24 = 120.51
    const result = calcMenuFinalPrice(menu, recipes, ingredients);
    expect(result.cost).toBeCloseTo(77.9);
    expect(result.selling).toBeCloseTo(101.27);
    expect(result.final).toBeCloseTo(120.51);
    expect(result.costPerGuest).toBeCloseTo(7.79);
  });

  it('returns zeros for empty menu', () => {
    const result = calcMenuFinalPrice({ ...menu, recipes: [] }, recipes, ingredients);
    expect(result.cost).toBe(0);
    expect(result.final).toBe(0);
  });
});

describe('calcEventTotal', () => {
  it('sums final prices of all menus', () => {
    const result = calcEventTotal(event, menus, recipes, ingredients);
    expect(result).toBeCloseTo(120.51);
  });

  it('returns 0 for event with no menus', () => {
    expect(calcEventTotal({ menus: [] }, menus, recipes, ingredients)).toBe(0);
  });
});

describe('buildShoppingList', () => {
  it('aggregates ingredient quantities', () => {
    const list = buildShoppingList(event, menus, recipes, ingredients);
    expect(list['Beef']).toBeDefined();
    expect(list['Beef'].qty).toBeCloseTo(2);
    expect(list['Cream']).toBeDefined();
    expect(list['Cream'].qty).toBeCloseTo(0.5);
  });

  it('returns empty object for event with no menus', () => {
    const list = buildShoppingList({ menus: [] }, menus, recipes, ingredients);
    expect(Object.keys(list)).toHaveLength(0);
  });
});
