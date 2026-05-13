import { useState } from 'react';
import AuthPage from './AuthPage.jsx';

const GOLD = '#d4a853';
const DARK = '#1a1916';
const CARD_BG = '#242220';
const BORDER = '#2e2c29';
const TEXT2 = '#a09a90';

const features = [
  {
    icon: 'ti-plant-2',
    title: 'Ingredients',
    desc: 'Track every ingredient with purchase prices, unit costs and suppliers. Always know what you pay per kg, liter or piece.',
  },
  {
    icon: 'ti-book',
    title: 'Recipes',
    desc: 'Build recipes from your ingredient list and see the exact food cost per portion — automatically recalculated when prices change.',
  },
  {
    icon: 'ti-list',
    title: 'Menus',
    desc: 'Assemble menus from your recipes and get the price per person instantly — markup, VAT and profit margin all included.',
  },
  {
    icon: 'ti-calendar-event',
    title: 'Events',
    desc: 'Plan events for any guest count. One click generates a professional PDF quote with shopping list and full cost breakdown.',
  },
];

const plans = [
  {
    name: '14-Day Trial',
    price: '€6.99',
    period: 'one time',
    features: ['Full access to all features', 'Then €49.99/month'],
    cta: 'Start Trial',
    mode: 'register',
  },
  {
    name: 'Monthly',
    price: '€49.99',
    period: '/month',
    features: ['Full access to all features', 'Cancel anytime'],
    cta: 'Subscribe Monthly',
    mode: 'register',
    highlight: true,
  },
  {
    name: 'Yearly',
    price: '€499',
    period: '/year',
    badge: 'Save 17%',
    features: ['Full access to all features', '2 months free vs monthly'],
    cta: 'Subscribe Yearly',
    mode: 'register',
  },
];

export default function Landing({ onAuth }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const open = (mode) => { setAuthMode(mode); setShowAuth(true); };

  if (showAuth) return <AuthPage initialMode={authMode} />;

  return (
    <div style={{ background: DARK, color: '#f0ece4', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* ── Navbar ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, background: DARK, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: GOLD, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-chef-hat" style={{ color: '#fff', fontSize: 17 }}></i>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>App4Chef</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => open('login')} style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: '#f0ece4', padding: '7px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Sign in
          </button>
          <button onClick={() => open('register')} style={{ background: GOLD, border: 'none', color: '#fff', padding: '7px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Get started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#2a2720', border: `1px solid ${BORDER}`, borderRadius: 99, padding: '5px 14px', fontSize: 12, color: GOLD, fontWeight: 600, marginBottom: 24, letterSpacing: '0.5px' }}>
          THE COST MANAGEMENT APP FOR PROFESSIONAL CHEFS
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-1px' }}>
          Know your food cost.<br />
          <span style={{ color: GOLD }}>Price with confidence.</span>
        </h1>
        <p style={{ fontSize: 17, color: TEXT2, lineHeight: 1.6, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
          App4Chef helps chefs calculate ingredient costs, build priced menus and generate professional event quotes — in minutes, not hours.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => open('register')} style={{ background: GOLD, border: 'none', color: '#fff', padding: '13px 28px', borderRadius: 9, cursor: 'pointer', fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>
            Start 14-day trial — €6.99
          </button>
          <button onClick={() => open('login')} style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: '#f0ece4', padding: '13px 28px', borderRadius: 9, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
            Sign in
          </button>
        </div>
        <p style={{ fontSize: 12, color: TEXT2, marginTop: 14 }}>
          Try the demo — <span style={{ color: '#f0ece4', fontWeight: 500 }}>demo@chefcost.app</span> / <span style={{ color: '#f0ece4', fontWeight: 500 }}>demo1234</span>
        </p>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'center', gap: 0 }}>
        {[['Ingredients', 'Track every cost'], ['Recipes', 'Cost per portion'], ['Menus', 'Price per person'], ['Events', 'PDF quotes']].map(([title, sub], i, arr) => (
          <div key={title} style={{ padding: '20px 40px', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
            <div style={{ fontSize: 12, color: TEXT2, marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Everything a chef needs</h2>
        <p style={{ textAlign: 'center', color: TEXT2, marginBottom: 48, fontSize: 15 }}>One app to manage your kitchen economics from ingredient to invoice.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28 }}>
              <div style={{ width: 44, height: 44, background: '#2e2b26', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <i className={`ti ${f.icon}`} style={{ color: GOLD, fontSize: 22 }}></i>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '72px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 48, letterSpacing: '-0.5px' }}>From ingredient to quote in 4 steps</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['1', 'Add your ingredients', 'Enter your ingredients with purchase price and quantity. App4Chef calculates the unit cost automatically.'],
              ['2', 'Build your recipes', 'Combine ingredients into recipes. See the exact food cost per portion in real time.'],
              ['3', 'Create menus', 'Group recipes into menus. Set your markup and VAT — the price per person is calculated instantly.'],
              ['4', 'Plan events & export', 'Add a menu to an event, set the guest count, and export a professional PDF quote with full shopping list.'],
            ].map(([num, title, desc], i, arr) => (
              <div key={num} style={{ display: 'flex', gap: 24, paddingBottom: i < arr.length - 1 ? 36 : 0, marginBottom: i < arr.length - 1 ? 36 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ width: 40, height: 40, minWidth: 40, background: GOLD, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>{num}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Simple, transparent pricing</h2>
        <p style={{ textAlign: 'center', color: TEXT2, marginBottom: 48, fontSize: 15 }}>Start with a 14-day trial. Cancel anytime.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {plans.map(p => (
            <div key={p.name} style={{ background: p.highlight ? '#272318' : CARD_BG, border: `2px solid ${p.highlight ? GOLD : BORDER}`, borderRadius: 14, padding: 28, position: 'relative' }}>
              {p.badge && (
                <span style={{ position: 'absolute', top: -12, right: 16, background: GOLD, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>{p.badge}</span>
              )}
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT2, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>
                {p.price}<span style={{ fontSize: 14, fontWeight: 400, color: TEXT2 }}>{p.period}</span>
              </div>
              <ul style={{ margin: '20px 0', padding: 0, listStyle: 'none' }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: TEXT2, padding: '4px 0', display: 'flex', gap: 8 }}>
                    <span style={{ color: GOLD }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => open(p.mode)} style={{ width: '100%', padding: '11px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: p.highlight ? GOLD : '#2e2b26', color: p.highlight ? '#fff' : '#f0ece4' }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ background: '#272318', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>Ready to know your real food cost?</h2>
        <p style={{ color: TEXT2, fontSize: 15, marginBottom: 28 }}>Join professional chefs who price their menus with confidence.</p>
        <button onClick={() => open('register')} style={{ background: GOLD, border: 'none', color: '#fff', padding: '13px 32px', borderRadius: 9, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
          Start your 14-day trial
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: GOLD, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-chef-hat" style={{ color: '#fff', fontSize: 13 }}></i>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>App4Chef</span>
        </div>
        <div style={{ fontSize: 12, color: TEXT2 }}>© 2026 App4Chef. All rights reserved.</div>
        <button onClick={() => open('login')} style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: '#f0ece4', padding: '6px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>
          Sign in
        </button>
      </footer>

    </div>
  );
}
