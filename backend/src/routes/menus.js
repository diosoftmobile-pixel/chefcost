import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscription.js';

const router = Router();
router.use(auth);

function getMenuFull(id) {
  const menu = db.prepare('SELECT * FROM menus WHERE id = ?').get(id);
  if (!menu) return null;
  menu.recipes = db.prepare(`
    SELECT mr.*, r.name as recipe_name, r.category, r.portions as recipe_portions
    FROM menu_recipes mr JOIN recipes r ON r.id = mr.recipe_id WHERE mr.menu_id = ?
  `).all(id);
  return menu;
}

router.get('/', (req, res) => {
  const menus = db.prepare('SELECT * FROM menus WHERE user_id = ? ORDER BY name').all(req.user.id);
  res.json(menus.map(m => getMenuFull(m.id)));
});

router.post('/', requireSubscription, (req, res) => {
  const { name, description = '', guest_count = 1, markup = 30, vat = 19, recipes = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO menus (id,user_id,name,description,guest_count,markup,vat) VALUES (?,?,?,?,?,?,?)').run(id, req.user.id, name, description, guest_count, markup, vat);
    recipes.forEach(r => db.prepare('INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)').run(uuid(), id, r.recipe_id, r.portions));
  });
  tx();
  res.status(201).json(getMenuFull(id));
});

router.put('/:id', requireSubscription, (req, res) => {
  const menu = db.prepare('SELECT id FROM menus WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!menu) return res.status(404).json({ error: 'Not found' });
  const { name, description, guest_count, markup, vat, recipes = [] } = req.body;
  const tx = db.transaction(() => {
    db.prepare(`UPDATE menus SET name=?,description=?,guest_count=?,markup=?,vat=?,updated_at=datetime('now') WHERE id=?`).run(name, description, guest_count, markup, vat, req.params.id);
    db.prepare('DELETE FROM menu_recipes WHERE menu_id = ?').run(req.params.id);
    recipes.forEach(r => db.prepare('INSERT INTO menu_recipes (id,menu_id,recipe_id,portions) VALUES (?,?,?,?)').run(uuid(), req.params.id, r.recipe_id, r.portions));
  });
  tx();
  res.json(getMenuFull(req.params.id));
});

router.delete('/:id', requireSubscription, (req, res) => {
  const menu = db.prepare('SELECT id FROM menus WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!menu) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM menus WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Chef's AI Advisor ──
router.post('/:id/analyze', requireSubscription, async (req, res) => {
  const menu = db.prepare('SELECT * FROM menus WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!menu) return res.status(404).json({ error: 'Not found' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI Advisor is not configured. Add ANTHROPIC_API_KEY to your environment.' });

  // Build full menu context
  const menuRecipes = db.prepare(`
    SELECT mr.portions, r.name, r.category, r.portions AS recipe_portions,
           r.notes
    FROM menu_recipes mr
    JOIN recipes r ON r.id = mr.recipe_id
    WHERE mr.menu_id = ?
    ORDER BY r.category
  `).all(req.params.id);

  // Get ingredients + allergens for each recipe
  const recipeDetails = menuRecipes.map(mr => {
    const ings = db.prepare(`
      SELECT i.name, i.category, ri.qty, ri.unit, i.allergens,
             ROUND(i.purchase_price / NULLIF(i.purchase_qty, 0) * ri.qty, 3) AS cost
      FROM recipe_ingredients ri
      JOIN ingredients i ON i.id = ri.ingredient_id
      JOIN recipes r ON r.id = ri.recipe_id
      WHERE r.name = ? AND ri.recipe_id IN (
        SELECT recipe_id FROM menu_recipes WHERE menu_id = ?
      )
    `).all(mr.name, req.params.id);
    return { ...mr, ingredients: ings };
  });

  const totalFoodCost = recipeDetails.reduce((s, r) => s + r.ingredients.reduce((ss, i) => ss + (i.cost || 0), 0), 0);
  const selling = totalFoodCost * (1 + menu.markup / 100);
  const finalPrice = selling * (1 + menu.vat / 100);
  const foodCostPct = finalPrice > 0 ? (totalFoodCost / finalPrice * 100).toFixed(1) : '—';

  // Collect all allergens across all recipes
  const allergenKeys = new Set();
  recipeDetails.forEach(r => r.ingredients.forEach(i => {
    try { JSON.parse(i.allergens || '[]').forEach(a => allergenKeys.add(a)); } catch {}
  }));
  const EU_ALLERGENS = { gluten:'Gluten', crustaceans:'Crustaceans', eggs:'Eggs', fish:'Fish', peanuts:'Peanuts', soybeans:'Soybeans', milk:'Milk', nuts:'Tree Nuts', celery:'Celery', mustard:'Mustard', sesame:'Sesame', sulphites:'Sulphites', lupin:'Lupin', molluscs:'Molluscs' };
  const allergenList = [...allergenKeys].map(k => EU_ALLERGENS[k] || k).join(', ') || 'None declared';

  const prompt = `You are a professional culinary consultant and food cost expert advising a chef.

Analyze this menu and provide a concise, practical Chef's Advisory Report. Be direct, professional, and specific.

MENU: "${menu.name}"
Description: ${menu.description || 'None'}
Markup: ${menu.markup}% | VAT: ${menu.vat}% | Price per person: €${finalPrice.toFixed(2)}
Food cost: €${totalFoodCost.toFixed(2)} (${foodCostPct}% of price)

COURSES (${recipeDetails.length} recipes):
${recipeDetails.map(r => `- ${r.name} [${r.category}] — ${r.portions} portion/person | Ingredients: ${r.ingredients.map(i => i.name).join(', ')}`).join('\n')}

ALLERGENS PRESENT: ${allergenList}

Write a Chef's Advisory Report with these sections (keep each section to 1-3 sentences max, be specific):

**Menu Balance** — Comment on course variety, flow, and overall composition.
**Food Cost Analysis** — Is the ${foodCostPct}% food cost ratio healthy? Industry standard is 28-35%. Recommend adjustments if needed.
**Pricing Recommendation** — Is €${finalPrice.toFixed(2)}/person competitive? Suggest a range if off.
**Allergen Alert** — Highlight EU compliance concerns and dishes guests should be warned about.
**Chef's Tip** — One specific improvement: a substitution, technique, or addition that would elevate this menu.

Keep the full report under 200 words. Use clear professional language suitable for a chef.`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const analysis = message.content[0].text;
    db.prepare("UPDATE menus SET ai_analysis=?, ai_analyzed_at=datetime('now') WHERE id=?").run(analysis, req.params.id);
    res.json({ analysis, analyzed_at: new Date().toISOString() });
  } catch (err) {
    console.error('AI Advisor error:', err.message);
    res.status(500).json({ error: 'AI analysis failed: ' + err.message });
  }
});

export default router;
