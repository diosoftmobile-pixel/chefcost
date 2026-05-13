import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscription.js';

const router = Router();
router.use(auth);

function getRecipeWithIngredients(id) {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
  if (!recipe) return null;
  recipe.ingredients = db.prepare(`
    SELECT ri.*, i.name as ingredient_name, i.unit as ingredient_unit, i.purchase_price, i.purchase_qty
    FROM recipe_ingredients ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    WHERE ri.recipe_id = ?
  `).all(id);
  return recipe;
}

router.get('/', (req, res) => {
  const recipes = db.prepare('SELECT * FROM recipes WHERE user_id = ? ORDER BY category, name').all(req.user.id);
  const result = recipes.map(r => {
    r.ingredients = db.prepare(`
      SELECT ri.*, i.name as ingredient_name, i.unit as ingredient_unit, i.purchase_price, i.purchase_qty
      FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id WHERE ri.recipe_id = ?
    `).all(r.id);
    return r;
  });
  res.json(result);
});

router.post('/', requireSubscription, (req, res) => {
  const { name, category = 'Main Course', portions = 4, notes = '', ingredients = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuid();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO recipes (id,user_id,name,category,portions,notes) VALUES (?,?,?,?,?,?)').run(id, req.user.id, name, category, portions, notes);
    ingredients.forEach(i => {
      db.prepare('INSERT INTO recipe_ingredients (id,recipe_id,ingredient_id,qty,unit) VALUES (?,?,?,?,?)').run(uuid(), id, i.ingredient_id, i.qty, i.unit || 'kg');
    });
  });
  tx();
  res.status(201).json(getRecipeWithIngredients(id));
});

router.put('/:id', requireSubscription, (req, res) => {
  const rec = db.prepare('SELECT id FROM recipes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!rec) return res.status(404).json({ error: 'Not found' });
  const { name, category, portions, notes, ingredients = [] } = req.body;
  const tx = db.transaction(() => {
    db.prepare(`UPDATE recipes SET name=?,category=?,portions=?,notes=?,updated_at=datetime('now') WHERE id=?`).run(name, category, portions, notes, req.params.id);
    db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(req.params.id);
    ingredients.forEach(i => {
      db.prepare('INSERT INTO recipe_ingredients (id,recipe_id,ingredient_id,qty,unit) VALUES (?,?,?,?,?)').run(uuid(), req.params.id, i.ingredient_id, i.qty, i.unit || 'kg');
    });
  });
  tx();
  res.json(getRecipeWithIngredients(req.params.id));
});

router.delete('/:id', requireSubscription, (req, res) => {
  const rec = db.prepare('SELECT id FROM recipes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!rec) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM recipes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.post('/:id/duplicate', requireSubscription, (req, res) => {
  const original = getRecipeWithIngredients(req.params.id);
  if (!original || original.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' });
  const newId = uuid();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO recipes (id,user_id,name,category,portions,notes) VALUES (?,?,?,?,?,?)').run(
      newId, req.user.id, original.name + ' (copy)', original.category, original.portions, original.notes
    );
    (original.ingredients || []).forEach(i => {
      db.prepare('INSERT INTO recipe_ingredients (id,recipe_id,ingredient_id,qty,unit) VALUES (?,?,?,?,?)').run(
        uuid(), newId, i.ingredient_id, i.qty, i.unit || 'kg'
      );
    });
  });
  tx();
  res.status(201).json(getRecipeWithIngredients(newId));
});

export default router;
