/**
 * Generates a full SEO-optimised HTML page for a programmatic tools page.
 * Pure function — no I/O, no side-effects.
 */

export function buildToolPage(page, allPages) {
  const { slug, category, title, h1, metaDesc, intro, tips, faqs, calcTitle,
          calcPortions, calcIngredients, related } = page;

  const canonicalUrl = `https://app4chef.com/tools/${category}/${slug}`;
  const breadcrumbLabel = {
    recipe: 'Recipe Cost Calculators',
    allergen: 'Allergen Guides',
    event: 'Event Planning Calculators',
  }[category] || 'Tools';

  const relatedPages = (related || [])
    .map(r => allPages.find(p => p.slug === r))
    .filter(Boolean)
    .slice(0, 3);

  const ingredientsJson = JSON.stringify(calcIngredients);
  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://app4chef.com/' },
      { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: `https://app4chef.com/tools/${category}` },
      { '@type': 'ListItem', position: 3, name: title, item: canonicalUrl },
    ],
  });

  const howToSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: calcTitle,
    description: `Use this free calculator to find the exact food cost per portion for ${h1}.`,
    step: [
      { '@type': 'HowToStep', text: 'Enter the number of portions you need to produce.' },
      { '@type': 'HowToStep', text: 'Adjust ingredient quantities and unit prices to match your supplier costs.' },
      { '@type': 'HowToStep', text: 'Read the cost per portion and total batch cost instantly.' },
      { '@type': 'HowToStep', text: 'Download the CSV to use in your kitchen costing spreadsheet.' },
    ],
  });

  const tipsList = tips.map(t =>
    `<li class="tip-item"><span class="tip-icon">✓</span><span>${escHtml(t)}</span></li>`
  ).join('\n');

  const faqItems = faqs.map((f, i) =>
    `<div class="faq-item" id="faq-${i}">
      <button class="faq-q" onclick="toggleFaq(${i})" aria-expanded="false">
        ${escHtml(f.q)}
        <span class="faq-arrow">▾</span>
      </button>
      <div class="faq-a" id="faq-a-${i}" hidden>
        <p>${escHtml(f.a)}</p>
      </div>
    </div>`
  ).join('\n');

  const relatedCards = relatedPages.map(p =>
    `<a href="/tools/${p.category}/${p.slug}" class="related-card">
      <span class="related-cat">${p.category}</span>
      <span class="related-title">${escHtml(p.title)}</span>
      <span class="related-arrow">→</span>
    </a>`
  ).join('\n');

  const ingRows = calcIngredients.map((ing, i) =>
    `<tr>
      <td class="ing-name">${escHtml(ing.name)}</td>
      <td><input type="number" class="calc-input" data-idx="${i}" data-field="qty"
          value="${ing.qty}" min="0" step="0.001" aria-label="Quantity for ${escHtml(ing.name)}"></td>
      <td class="ing-unit">${escHtml(ing.unit)}</td>
      <td><input type="number" class="calc-input" data-idx="${i}" data-field="price"
          value="${ing.price}" min="0" step="0.01" aria-label="Price per unit for ${escHtml(ing.name)}"></td>
      <td class="ing-cost" id="cost-${i}">—</td>
    </tr>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escAttr(metaDesc)}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escAttr(title)}" />
  <meta property="og:description" content="${escAttr(metaDesc)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="https://app4chef.com/og-image.svg" />
  <meta property="og:site_name" content="App4Chef" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escAttr(title)}" />
  <meta name="twitter:description" content="${escAttr(metaDesc)}" />
  <meta name="twitter:image" content="https://app4chef.com/og-image.svg" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${faqSchema}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>
  <script type="application/ld+json">${howToSchema}</script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #F9F7F3;
      --surface: #FFFFFF;
      --dark: #1A1916;
      --accent: #D4A853;
      --accent-dark: #B8892E;
      --text: #2C2B28;
      --muted: #6B6860;
      --border: #E8E4DA;
      --radius: 10px;
      --shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 16px;
    }

    /* ── Nav ── */
    .top-nav {
      background: var(--dark);
      padding: 0 24px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
    }
    .nav-logo-mark {
      width: 30px;
      height: 30px;
      background: var(--accent);
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 800;
      color: var(--dark);
    }
    .nav-cta {
      background: var(--accent);
      color: var(--dark);
      font-weight: 700;
      font-size: 14px;
      padding: 8px 18px;
      border-radius: 7px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .nav-cta:hover { background: var(--accent-dark); }

    /* ── Breadcrumb ── */
    .breadcrumb {
      max-width: 900px;
      margin: 0 auto;
      padding: 16px 24px 0;
      font-size: 13px;
      color: var(--muted);
    }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb a:hover { color: var(--accent); }
    .breadcrumb span { margin: 0 6px; }

    /* ── Hero ── */
    .hero {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px 0;
    }
    .hero-cat {
      display: inline-block;
      background: rgba(212,168,83,0.15);
      color: var(--accent-dark);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 14px;
    }
    .hero h1 {
      font-size: clamp(26px, 4vw, 38px);
      font-weight: 800;
      color: var(--dark);
      line-height: 1.2;
      margin-bottom: 16px;
    }
    .hero-intro {
      font-size: 17px;
      color: var(--muted);
      max-width: 700px;
      margin-bottom: 0;
      line-height: 1.7;
    }

    /* ── Layout ── */
    .content-wrap {
      max-width: 900px;
      margin: 32px auto 0;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 32px;
      align-items: start;
    }
    @media (max-width: 720px) {
      .content-wrap { grid-template-columns: 1fr; }
    }

    /* ── Calculator ── */
    .calc-card {
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      overflow: hidden;
    }
    .calc-header {
      background: var(--dark);
      color: #fff;
      padding: 16px 20px;
      font-size: 15px;
      font-weight: 700;
    }
    .calc-body { padding: 20px; }
    .portions-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      background: rgba(212,168,83,0.08);
      border: 1px solid rgba(212,168,83,0.25);
      padding: 12px 14px;
      border-radius: 8px;
    }
    .portions-row label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      flex: 1;
    }
    .portions-input {
      width: 80px;
      padding: 7px 10px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      color: var(--dark);
      background: #fff;
    }
    .portions-input:focus { outline: 2px solid var(--accent); border-color: transparent; }

    .ing-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    .ing-table th {
      background: #f5f3ee;
      padding: 8px 10px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
    }
    .ing-table td {
      padding: 9px 10px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .ing-table tr:last-child td { border-bottom: none; }
    .ing-name { font-weight: 500; color: var(--text); }
    .ing-unit { color: var(--muted); font-size: 12px; }
    .ing-cost { font-weight: 700; color: var(--dark); text-align: right; }

    .calc-input {
      width: 80px;
      padding: 5px 7px;
      border: 1px solid var(--border);
      border-radius: 5px;
      font-size: 13px;
      color: var(--dark);
      background: #fff;
    }
    .calc-input:focus { outline: 2px solid var(--accent); border-color: transparent; }

    .calc-results {
      margin-top: 16px;
      background: var(--dark);
      border-radius: 8px;
      padding: 16px 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .result-item { text-align: center; }
    .result-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
      margin-bottom: 4px;
    }
    .result-value {
      font-size: 22px;
      font-weight: 800;
      color: var(--accent);
    }

    .calc-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }
    .btn-primary {
      flex: 1;
      background: var(--accent);
      color: var(--dark);
      font-weight: 700;
      font-size: 14px;
      padding: 10px;
      border: none;
      border-radius: 7px;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: background 0.15s;
    }
    .btn-primary:hover { background: var(--accent-dark); }
    .btn-secondary {
      flex: 1;
      background: #f5f3ee;
      color: var(--text);
      font-weight: 600;
      font-size: 13px;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 7px;
      cursor: pointer;
      text-align: center;
      transition: background 0.15s;
    }
    .btn-secondary:hover { background: #edeae2; }

    /* ── Sidebar ── */
    .sidebar {}
    .sidebar-cta {
      background: var(--dark);
      border-radius: var(--radius);
      padding: 24px;
      color: #fff;
      margin-bottom: 20px;
    }
    .sidebar-cta h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #fff;
    }
    .sidebar-cta p {
      font-size: 13px;
      color: rgba(255,255,255,0.65);
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .sidebar-cta .btn-primary { display: block; text-align: center; }
    .sidebar-widget {
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      padding: 20px;
      margin-bottom: 20px;
    }
    .sidebar-widget h4 {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
      margin-bottom: 14px;
    }

    /* ── Tips ── */
    .main-content { min-width: 0; }
    .section-card {
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      padding: 28px;
      margin-bottom: 24px;
    }
    .section-card h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .tips-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14.5px;
      color: var(--text);
      line-height: 1.6;
    }
    .tip-icon {
      width: 20px;
      height: 20px;
      background: rgba(212,168,83,0.15);
      color: var(--accent-dark);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 2px;
    }

    /* ── FAQ ── */
    .faq-item {
      border-bottom: 1px solid var(--border);
      padding: 4px 0;
    }
    .faq-item:last-child { border-bottom: none; }
    .faq-q {
      width: 100%;
      background: none;
      border: none;
      text-align: left;
      padding: 14px 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--dark);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .faq-q:hover { color: var(--accent-dark); }
    .faq-arrow { font-size: 18px; transition: transform 0.2s; flex-shrink: 0; }
    .faq-q[aria-expanded="true"] .faq-arrow { transform: rotate(180deg); }
    .faq-a { padding: 0 0 14px; }
    .faq-a p { font-size: 14.5px; color: var(--muted); line-height: 1.7; }

    /* ── Related ── */
    .related-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .related-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: #f9f7f3;
      border: 1px solid var(--border);
      border-radius: 8px;
      text-decoration: none;
      transition: border-color 0.15s, background 0.15s;
    }
    .related-card:hover {
      border-color: var(--accent);
      background: rgba(212,168,83,0.05);
    }
    .related-cat {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: var(--accent-dark);
      background: rgba(212,168,83,0.12);
      padding: 2px 7px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .related-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
      flex: 1;
      line-height: 1.4;
    }
    .related-arrow { color: var(--muted); font-size: 16px; }

    /* ── Footer Banner ── */
    .footer-banner {
      background: var(--dark);
      margin-top: 64px;
      padding: 48px 24px;
      text-align: center;
    }
    .footer-banner h2 {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 10px;
    }
    .footer-banner p {
      font-size: 16px;
      color: rgba(255,255,255,0.6);
      margin-bottom: 24px;
    }
    .footer-bottom {
      text-align: center;
      padding: 20px 24px;
      font-size: 13px;
      color: var(--muted);
      border-top: 1px solid var(--border);
    }
    .footer-bottom a { color: var(--muted); text-decoration: none; }
    .footer-bottom a:hover { color: var(--accent); }

    @media (max-width: 600px) {
      .content-wrap { padding: 0 16px; }
      .hero { padding: 24px 16px 0; }
      .breadcrumb { padding: 14px 16px 0; }
      .calc-results { grid-template-columns: 1fr; }
      .calc-actions { flex-direction: column; }
    }
  </style>
</head>
<body>

  <!-- Navigation -->
  <nav class="top-nav" role="navigation" aria-label="Main navigation">
    <a href="/" class="nav-logo">
      <div class="nav-logo-mark">4</div>
      App4Chef
    </a>
    <a href="/?signup=1" class="nav-cta">Try 14 Days — €6.99</a>
  </nav>

  <!-- Breadcrumb -->

  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span aria-hidden="true">›</span>
    <a href="/tools/${category}">${escHtml(breadcrumbLabel)}</a>
    <span aria-hidden="true">›</span>
    <span aria-current="page">${escHtml(h1)}</span>
  </nav>

  <!-- Hero -->
  <header class="hero">
    <div class="hero-cat">${escHtml(category)} calculator</div>
    <h1>${escHtml(h1)}</h1>
    <p class="hero-intro">${escHtml(intro)}</p>
  </header>

  <!-- Main Content -->
  <div class="content-wrap">

    <!-- Left: Calculator + Tips + FAQ -->
    <main class="main-content" id="main-content">

      <!-- Calculator -->
      <section class="calc-card" aria-labelledby="calc-heading">
        <div class="calc-header" id="calc-heading">${escHtml(calcTitle)}</div>
        <div class="calc-body">

          <div class="portions-row">
            <label for="portions-input">Number of portions</label>
            <input type="number" id="portions-input" class="portions-input"
              value="${calcPortions}" min="1" step="1" aria-label="Number of portions" />
          </div>

          <table class="ing-table" aria-label="Ingredient cost breakdown">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Qty / portion</th>
                <th>Unit</th>
                <th>Price / unit (€)</th>
                <th style="text-align:right">Cost (€)</th>
              </tr>
            </thead>
            <tbody id="ing-tbody">
              ${ingRows}
            </tbody>
          </table>

          <div class="calc-results" role="region" aria-label="Cost results">
            <div class="result-item">
              <div class="result-label">Cost per Portion</div>
              <div class="result-value" id="res-per-portion">€0.00</div>
            </div>
            <div class="result-item">
              <div class="result-label">Total Batch Cost</div>
              <div class="result-value" id="res-total">€0.00</div>
            </div>
          </div>

          <div class="calc-actions">
            <button class="btn-primary" onclick="downloadCsv()">⬇ Download CSV Template</button>
            <a href="/?signup=1" class="btn-secondary">Save in App4Chef →</a>
          </div>
        </div>
      </section>

      <!-- Tips -->
      <section class="section-card" aria-labelledby="tips-heading">
        <h2 id="tips-heading">Professional Tips for Accurate Costing</h2>
        <ul class="tips-list">
          ${tipsList}
        </ul>
      </section>

      <!-- FAQ -->
      <section class="section-card" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently Asked Questions</h2>
        <div role="list">
          ${faqItems}
        </div>
      </section>

    </main>

    <!-- Right: Sidebar -->
    <aside class="sidebar" aria-label="Sidebar">

      <div class="sidebar-cta">
        <h3>Tired of spreadsheets?</h3>
        <p>App4Chef automates all your food cost calculations, scales recipes instantly, and tracks margins across your full menu.</p>
        <a href="/?signup=1" class="btn-primary">Try 14 Days — €6.99</a>
      </div>

      ${relatedCards.length ? `
      <div class="sidebar-widget">
        <h4>Related Calculators</h4>
        <div class="related-grid">
          ${relatedCards}
        </div>
      </div>` : ''}

      <div class="sidebar-widget">
        <h4>What App4Chef Includes</h4>
        <ul class="tips-list" style="gap:8px">
          ${[
            'Recipe cost calculator',
            'Ingredient price tracking',
            'Menu margin analysis',
            'Event & catering planner',
            'AI food-cost advisor',
            'Allergen compliance tracker',
            'PDF reports & invoices',
          ].map(f => `<li class="tip-item"><span class="tip-icon">✓</span><span style="font-size:13px">${f}</span></li>`).join('\n')}
        </ul>
      </div>

    </aside>
  </div>

  <!-- Footer Banner CTA -->
  <section class="footer-banner" aria-labelledby="cta-heading">
    <h2 id="cta-heading">Start Costing Recipes the Professional Way</h2>
    <p>Join chefs and catering businesses who use App4Chef to control food costs and protect margins.</p>
    <a href="/?signup=1" class="btn-primary" style="display:inline-block; padding: 14px 32px; font-size:16px">
      Try App4Chef — 14 Days for €6.99
    </a>
  </section>

  <footer class="footer-bottom">
    <span>© 2026 App4Chef</span> &nbsp;·&nbsp;
    <a href="/">Home</a> &nbsp;·&nbsp;
    <a href="/tools/recipe">Recipe Calculators</a> &nbsp;·&nbsp;
    <a href="/tools/allergen">Allergen Guides</a> &nbsp;·&nbsp;
    <a href="/tools/event">Event Planners</a> &nbsp;·&nbsp;
    <a href="/privacy">Privacy Policy</a>
  </footer>

  <script>
    // ── Calculator engine ──────────────────────────────────────────
    const INGREDIENTS = ${ingredientsJson};

    function fmt(n) { return '€' + n.toFixed(2); }

    function recalc() {
      const portions = Math.max(1, parseFloat(document.getElementById('portions-input').value) || 1);
      let batchTotal = 0;

      INGREDIENTS.forEach((ing, i) => {
        const qtyInput = document.querySelector('[data-idx="' + i + '"][data-field="qty"]');
        const priceInput = document.querySelector('[data-idx="' + i + '"][data-field="price"]');
        const costEl = document.getElementById('cost-' + i);
        if (!qtyInput || !priceInput || !costEl) return;

        const qty = parseFloat(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const lineCost = qty * price * portions;
        batchTotal += lineCost;
        costEl.textContent = fmt(lineCost);
      });

      const perPortion = portions > 0 ? batchTotal / portions : 0;
      document.getElementById('res-per-portion').textContent = fmt(perPortion);
      document.getElementById('res-total').textContent = fmt(batchTotal);
    }

    // Wire up all inputs
    document.querySelectorAll('.calc-input').forEach(el => {
      el.addEventListener('input', recalc);
    });
    document.getElementById('portions-input').addEventListener('input', recalc);

    // Initial calculation
    recalc();

    // ── FAQ accordion ──────────────────────────────────────────────
    function toggleFaq(i) {
      const btn = document.querySelector('#faq-' + i + ' .faq-q');
      const body = document.getElementById('faq-a-' + i);
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      body.hidden = expanded;
    }

    // ── CSV Download ───────────────────────────────────────────────
    function downloadCsv() {
      const portions = Math.max(1, parseFloat(document.getElementById('portions-input').value) || 1);
      const rows = [['Ingredient', 'Qty per Portion', 'Unit', 'Price per Unit (EUR)', 'Line Cost (EUR)']];

      INGREDIENTS.forEach((ing, i) => {
        const qty = parseFloat(document.querySelector('[data-idx="' + i + '"][data-field="qty"]').value) || 0;
        const price = parseFloat(document.querySelector('[data-idx="' + i + '"][data-field="price"]').value) || 0;
        const lineCost = qty * price * portions;
        rows.push([ing.name, qty, ing.unit, price.toFixed(2), lineCost.toFixed(2)]);
      });

      const batchTotal = rows.slice(1).reduce((s, r) => s + parseFloat(r[4]), 0);
      rows.push(['', '', '', 'TOTAL', batchTotal.toFixed(2)]);
      rows.push(['', '', '', 'Per Portion', (batchTotal / portions).toFixed(2)]);
      rows.push(['Portions', portions, '', '', '']);

      const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${slug}.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  </script>

</body>
</html>`;
}

/**
 * Builds the index page for a category (listing of all pages in that category).
 */
export function buildCategoryPage(category, pages) {
  const labels = {
    recipe: { title: 'Free Recipe Food Cost Calculators', desc: 'Calculate the exact food cost per portion for popular restaurant dishes. Free online calculators for professional chefs.', h1: 'Recipe Food Cost Calculators' },
    allergen: { title: 'Allergen-Free Event Planning Guides & Calculators', desc: 'Plan catering for guests with dietary restrictions. Free allergen guides and cost calculators for professional caterers.', h1: 'Allergen & Dietary Event Planning Guides' },
    event: { title: 'Catering Event Cost Calculators — Free Online Tools', desc: 'Calculate food costs and per-head pricing for any catering event. Free tools for professional caterers and event chefs.', h1: 'Catering Event Cost Calculators' },
  };

  const meta = labels[category] || { title: category, desc: '', h1: category };
  const canonicalUrl = `https://app4chef.com/tools/${category}`;

  const cards = pages.map(p => `
    <a href="/tools/${category}/${p.slug}" class="page-card">
      <div class="page-card-body">
        <h2 class="page-card-title">${escHtml(p.h1)}</h2>
        <p class="page-card-desc">${escHtml(p.metaDesc)}</p>
      </div>
      <div class="page-card-arrow">→</div>
    </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(meta.title)} | App4Chef</title>
  <meta name="description" content="${escAttr(meta.desc)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:title" content="${escAttr(meta.title)}" />
  <meta property="og:description" content="${escAttr(meta.desc)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="https://app4chef.com/og-image.svg" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://app4chef.com/' },
      { '@type': 'ListItem', position: 2, name: meta.h1, item: canonicalUrl },
    ],
  })}</script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --bg:#F9F7F3; --surface:#fff; --dark:#1A1916; --accent:#D4A853; --accent-dark:#B8892E; --text:#2C2B28; --muted:#6B6860; --border:#E8E4DA; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); }
    .top-nav { background: var(--dark); padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #fff; font-size: 18px; font-weight: 700; }
    .nav-logo-mark { width: 30px; height: 30px; background: var(--accent); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: var(--dark); }
    .nav-cta { background: var(--accent); color: var(--dark); font-weight: 700; font-size: 14px; padding: 8px 18px; border-radius: 7px; text-decoration: none; }
    .breadcrumb { max-width: 860px; margin: 0 auto; padding: 16px 24px 0; font-size: 13px; color: var(--muted); }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .hero { max-width: 860px; margin: 0 auto; padding: 32px 24px; }
    .hero h1 { font-size: clamp(26px, 4vw, 38px); font-weight: 800; color: var(--dark); margin-bottom: 12px; }
    .hero p { font-size: 17px; color: var(--muted); max-width: 620px; }
    .pages-grid { max-width: 860px; margin: 0 auto; padding: 0 24px 64px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .page-card { display: flex; align-items: center; gap: 12px; padding: 18px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; text-decoration: none; transition: border-color 0.15s; }
    .page-card:hover { border-color: var(--accent); }
    .page-card-body { flex: 1; }
    .page-card-title { font-size: 14px; font-weight: 700; color: var(--dark); margin-bottom: 4px; line-height: 1.3; }
    .page-card-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }
    .page-card-arrow { color: var(--accent); font-size: 20px; flex-shrink: 0; }
    footer { text-align: center; padding: 20px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); }
    footer a { color: var(--muted); text-decoration: none; }
  </style>
</head>
<body>
  <nav class="top-nav">
    <a href="/" class="nav-logo"><div class="nav-logo-mark">4</div>App4Chef</a>
    <a href="/?signup=1" class="nav-cta">Try 14 Days — €6.99</a>
  </nav>
  <nav class="breadcrumb">
    <a href="/">Home</a> › <span aria-current="page">${escHtml(meta.h1)}</span>
  </nav>
  <header class="hero">
    <h1>${escHtml(meta.h1)}</h1>
    <p>${escHtml(meta.desc)}</p>
  </header>
  <div class="pages-grid">
    ${cards}
  </div>
  <footer>
    © 2026 App4Chef &nbsp;·&nbsp; <a href="/">Home</a> &nbsp;·&nbsp;
    <a href="/tools/recipe">Recipes</a> &nbsp;·&nbsp;
    <a href="/tools/allergen">Allergens</a> &nbsp;·&nbsp;
    <a href="/tools/event">Events</a>
  </footer>
</body>
</html>`;
}

/**
 * Builds the top-level /tools index page.
 */
export function buildToolsIndex(allPages) {
  const categories = ['recipe', 'allergen', 'event'];
  const catMeta = {
    recipe: { label: 'Recipe Calculators', desc: 'Per-portion food cost for classic restaurant dishes.', icon: '🍽️' },
    allergen: { label: 'Allergen & Dietary Guides', desc: 'Event menus for guests with dietary restrictions.', icon: '🌿' },
    event: { label: 'Event & Catering Planners', desc: 'Per-head pricing and batch costing for any event.', icon: '📋' },
  };

  const catCards = categories.map(cat => {
    const count = allPages.filter(p => p.category === cat).length;
    const m = catMeta[cat];
    return `<a href="/tools/${cat}" class="cat-card">
      <div class="cat-icon">${m.icon}</div>
      <div class="cat-body">
        <div class="cat-label">${escHtml(m.label)}</div>
        <div class="cat-desc">${escHtml(m.desc)}</div>
        <div class="cat-count">${count} free tools →</div>
      </div>
    </a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Free Food Cost Calculators for Professional Chefs | App4Chef Tools</title>
  <meta name="description" content="Free online food cost calculators for professional chefs and caterers. Recipe costing, allergen guides, and event planning tools." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://app4chef.com/tools" />
  <meta property="og:title" content="Free Food Cost Calculators | App4Chef" />
  <meta property="og:description" content="Free online food cost calculators for professional chefs and caterers." />
  <meta property="og:url" content="https://app4chef.com/tools" />
  <meta property="og:image" content="https://app4chef.com/og-image.svg" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --bg:#F9F7F3; --surface:#fff; --dark:#1A1916; --accent:#D4A853; --text:#2C2B28; --muted:#6B6860; --border:#E8E4DA; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); }
    .top-nav { background: var(--dark); padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #fff; font-size: 18px; font-weight: 700; }
    .nav-logo-mark { width: 30px; height: 30px; background: var(--accent); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: var(--dark); }
    .nav-cta { background: var(--accent); color: var(--dark); font-weight: 700; font-size: 14px; padding: 8px 18px; border-radius: 7px; text-decoration: none; }
    .hero { max-width: 800px; margin: 0 auto; padding: 48px 24px 32px; text-align: center; }
    .hero h1 { font-size: clamp(28px, 4vw, 42px); font-weight: 800; color: var(--dark); margin-bottom: 12px; }
    .hero p { font-size: 17px; color: var(--muted); }
    .cats { max-width: 800px; margin: 0 auto; padding: 0 24px 64px; display: flex; flex-direction: column; gap: 16px; }
    .cat-card { display: flex; align-items: center; gap: 20px; padding: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; text-decoration: none; transition: border-color 0.15s; }
    .cat-card:hover { border-color: var(--accent); }
    .cat-icon { font-size: 36px; flex-shrink: 0; }
    .cat-label { font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
    .cat-desc { font-size: 14px; color: var(--muted); margin-bottom: 8px; }
    .cat-count { font-size: 13px; font-weight: 700; color: var(--accent); }
    footer { text-align: center; padding: 20px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); }
    footer a { color: var(--muted); text-decoration: none; }
  </style>
</head>
<body>
  <nav class="top-nav">
    <a href="/" class="nav-logo"><div class="nav-logo-mark">4</div>App4Chef</a>
    <a href="/?signup=1" class="nav-cta">Try 14 Days — €6.99</a>
  </nav>
  <header class="hero">
    <h1>Free Food Cost Calculators</h1>
    <p>Professional tools for chefs and caterers — no sign-up required.</p>
  </header>
  <div class="cats">
    ${catCards}
  </div>
  <footer>
    © 2026 App4Chef &nbsp;·&nbsp; <a href="/">Home</a> &nbsp;·&nbsp;
    <a href="/tools/recipe">Recipes</a> &nbsp;·&nbsp;
    <a href="/tools/allergen">Allergens</a> &nbsp;·&nbsp;
    <a href="/tools/event">Events</a>
  </footer>
</body>
</html>`;
}

/**
 * Builds the dynamic sitemap XML including all tool pages.
 */
export function buildSitemap(allPages) {
  const today = new Date().toISOString().slice(0, 10);
  const urlTags = allPages.map(p => `
  <url>
    <loc>https://app4chef.com/tools/${p.category}/${p.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  const catTags = ['recipe', 'allergen', 'event'].map(cat => `
  <url>
    <loc>https://app4chef.com/tools/${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Landing page -->
  <url>
    <loc>https://app4chef.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://app4chef.com/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://app4chef.com/"/>
    <xhtml:link rel="alternate" hreflang="ro" href="https://app4chef.com/"/>
    <xhtml:link rel="alternate" hreflang="hu" href="https://app4chef.com/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://app4chef.com/"/>
  </url>

  <!-- Tools index -->
  <url>
    <loc>https://app4chef.com/tools</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Category index pages -->
  ${catTags}

  <!-- Individual tool pages -->
  ${urlTags}

</urlset>`;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
