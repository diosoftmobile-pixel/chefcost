import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import ingredientRoutes from './routes/ingredients.js';
import recipeRoutes from './routes/recipes.js';
import menuRoutes from './routes/menus.js';
import eventRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js';
import billingRoutes from './routes/billing.js';
import reportsRoutes from './routes/reports.js';
import toolsRouter from './routes/tools.js';
import researchRouter from './routes/research.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json());

  app.get('/health', (_, res) => res.json({ ok: true }));

  // Programmatic SEO pages + dynamic sitemap — registered before static middleware
  // so these routes take priority over the SPA catch-all in index.js
  app.use(toolsRouter);
  app.use(researchRouter);

  app.use('/api/auth', authRoutes);
  app.use('/api/ingredients', ingredientRoutes);
  app.use('/api/recipes', recipeRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/reports', reportsRoutes);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
