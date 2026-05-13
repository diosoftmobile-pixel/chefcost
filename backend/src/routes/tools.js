import { Router } from 'express';
import { PAGES, PAGE_MAP } from '../data/tools-pages.js';
import {
  buildToolPage,
  buildCategoryPage,
  buildToolsIndex,
  buildSitemap,
} from '../lib/tools-template.js';

const router = Router();

// ── Dynamic sitemap (replaces the static frontend one) ────────────────────────
router.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buildSitemap(PAGES));
});

// ── Tools index ───────────────────────────────────────────────────────────────
router.get('/tools', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buildToolsIndex(PAGES));
});

// ── Category index ────────────────────────────────────────────────────────────
router.get('/tools/:category', (req, res) => {
  const { category } = req.params;
  const validCategories = ['recipe', 'allergen', 'event'];
  if (!validCategories.includes(category)) return res.status(404).send('Not found');

  const pages = PAGES.filter(p => p.category === category);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buildCategoryPage(category, pages));
});

// ── Individual tool page ──────────────────────────────────────────────────────
router.get('/tools/:category/:slug', (req, res) => {
  const { category, slug } = req.params;
  const page = PAGE_MAP[slug];

  if (!page || page.category !== category) {
    return res.status(404).send('Not found');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buildToolPage(page, PAGES));
});

export default router;
