import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChefHat, Calculator, CalendarDays, FileText, Sparkles, ShieldCheck,
  Utensils, CheckCircle2, PlayCircle, Menu, X, Star,
  ArrowRight, BarChart3, ClipboardList, BadgeCheck, ChevronDown, Link2, Check,
} from 'lucide-react';

/* ── Social share helpers ────────────────────────────────────────────── */
const APP_URL   = 'https://app4chef.com';
const APP_TEXT  = encodeURIComponent('Know your food cost. Price with confidence. 🍽️ The app for professional chefs →');

const SOCIAL_SHARE = [
  {
    key: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    bg: 'rgba(24,119,242,0.10)',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    color: '#000000',
    bg: 'rgba(0,0,0,0.08)',
    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(APP_URL)}&text=${APP_TEXT}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    bg: 'rgba(10,102,194,0.10)',
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.10)',
    href: 'https://instagram.com/app4chef',
    isFollow: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    color: '#010101',
    bg: 'rgba(0,0,0,0.08)',
    href: 'https://tiktok.com/@app4chef',
    isFollow: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z"/>
      </svg>
    ),
  },
];
import i18n from '../i18n/index.js';
import AuthPage from './AuthPage.jsx';

/* ── Language config ────────────────────────────────────────────────── */
const LANGS = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'ro', flag: '🇷🇴' },
  { code: 'hu', flag: '🇭🇺' },
];

const FR_COUNTRIES = ['FR','BE','CH','LU','CI','ML','SN','CM','BJ','TG','BF','MG','NE','GA','CG','CD','GN','RW','DJ','MU','GQ','KM','CF','TD','BI'];
const RO_COUNTRIES = ['RO','MD'];
const HU_COUNTRIES = ['HU'];

function detectLangFromCountry(cc) {
  if (!cc) return 'en';
  if (FR_COUNTRIES.includes(cc)) return 'fr';
  if (RO_COUNTRIES.includes(cc)) return 'ro';
  if (HU_COUNTRIES.includes(cc)) return 'hu';
  return 'en';
}

/* ── Icon array parallel to features translation array ─────────────── */
const FEATURE_ICONS = [Calculator, Utensils, CalendarDays, ShieldCheck, Sparkles, FileText];

/* ── Pricing: static config (highlight / badge) merged with translations */
const PLAN_CONFIG = [
  { highlight: true,  badge: false },
  { highlight: false, badge: false },
  { highlight: false, badge: true  },
];

/* ── Language Switcher ──────────────────────────────────────────────── */
function LangSwitcher() {
  const { i18n: i18nInst, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = LANGS.find(l => l.code === i18nInst.language) || LANGS[0];

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const changeLang = (code) => {
    i18nInst.changeLanguage(code);
    localStorage.setItem('cc_lang', code);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
        style={{ background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
        <span>{cur.flag}</span>
        <span className="font-semibold">{cur.code.toUpperCase()}</span>
        <ChevronDown size={13} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-2xl border border-white/15 bg-[#1a1916] shadow-2xl"
          style={{ zIndex: 200 }}>
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-white/10 ${lang.code === i18nInst.language ? 'text-[#D4A853] font-semibold' : 'text-white/80'}`}
              style={{ background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', border: 'none', textAlign: 'left' }}>
              <span style={{ fontSize: 18 }}>{lang.flag}</span>
              <span>{t(`landing.lang.${lang.code}`)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Social share button ─────────────────────────────────────────────── */
function SocialBtn({ href, label, icon, color, bg, isFollow }) {
  const { t } = useTranslation();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={isFollow ? `${t('landing.footer.follow')} ${label}` : `${t('landing.footer.shareOn')} ${label}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 13px', borderRadius: 10,
        background: bg, color, border: `1px solid ${color}22`,
        fontSize: 13, fontWeight: 600, textDecoration: 'none',
        transition: 'all 0.15s', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.color = color; }}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

/* ── Copy-link button ────────────────────────────────────────────────── */
function CopyLinkBtn() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      title={t('landing.footer.copyLink')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 13px', borderRadius: 10,
        background: copied ? 'rgba(22,163,74,0.10)' : 'rgba(0,0,0,0.05)',
        color: copied ? '#16A34A' : '#6B7280',
        border: `1px solid ${copied ? '#16A34A33' : '#00000015'}`,
        fontSize: 13, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      {copied ? <Check size={15} /> : <Link2 size={15} />}
      <span>{copied ? t('landing.footer.copied') : t('landing.footer.copyLink')}</span>
    </button>
  );
}

/* ── NavBar ─────────────────────────────────────────────────────────── */
function NavBar({ onLogin, onRegister }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: t('landing.nav.features'),    href: '#features' },
    { label: t('landing.nav.howItWorks'),  href: '#how-it-works' },
    { label: t('landing.nav.pricing'),     href: '#pricing' },
    { label: t('landing.nav.aiAdvisor'),   href: '#ai-advisor' },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0d0c0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 text-white" style={{ textDecoration: 'none' }}>
          <div className="rounded-xl border border-[#D4A853]/40 bg-[#D4A853]/10 p-2 text-[#D4A853]">
            <ChefHat size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            app<span className="text-[#D4A853]">4</span>chef
          </span>
        </a>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-8 text-sm text-white/80 lg:flex">
          {navItems.map(item => (
            <a key={item.href} href={item.href}
               className="hover:text-[#D4A853]" style={{ textDecoration: 'none', color: 'inherit' }}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <LangSwitcher />
          <button onClick={onLogin}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
            style={{ background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t('landing.nav.login')}
          </button>
          <button onClick={onRegister}
            className="rounded-xl bg-[#D4A853] px-5 py-2.5 text-sm font-bold text-[#1A1916] shadow-lg shadow-[#D4A853]/20 hover:bg-[#c49642]"
            style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
            {t('landing.nav.startTrial')}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="text-white lg:hidden"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#11100e] px-5 py-5 lg:hidden">
          <div className="flex flex-col gap-4 text-white/85">
            {navItems.map(item => (
              <a key={item.href} href={item.href}
                 onClick={() => setOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
                {item.label}
              </a>
            ))}
            {/* Mobile language row */}
            <div className="flex gap-2 border-t border-white/10 pt-4">
              {LANGS.map(lang => (
                <button key={lang.code}
                  onClick={() => { i18n.changeLanguage(lang.code); localStorage.setItem('cc_lang', lang.code); }}
                  className={`flex-1 rounded-xl py-2 text-center text-sm font-semibold transition ${i18n.language === lang.code ? 'bg-[#D4A853]/20 text-[#D4A853]' : 'text-white/60 hover:bg-white/10'}`}
                  style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: i18n.language === lang.code ? '' : 'transparent' }}>
                  {lang.flag} {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => { setOpen(false); onRegister(); }}
              className="rounded-xl bg-[#D4A853] px-5 py-3 text-center font-bold text-[#1A1916]"
              style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t('landing.nav.startTrial')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Dashboard Mockup ───────────────────────────────────────────────── */
function DashboardMockup() {
  const { t } = useTranslation();
  const m = t('landing.mockup', { returnObjects: true });
  const allergenList = t('landing.allergen.list', { returnObjects: true });

  return (
    <div className="relative" style={{ color: '#1A1916' }}>
      <div className="rounded-[2rem] border border-white/15 bg-white p-4 shadow-2xl shadow-black/40">
        <div className="rounded-[1.4rem] bg-[#f7f4ef] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">{m.dashboard}</p>
              <h3 className="text-xl font-bold text-[#1A1916]">{m.profitability}</h3>
            </div>
            <BadgeCheck className="text-[#16A34A]" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[[m.totalEvents,'24'],[m.foodCost,'28.6%'],[m.revenue,'€21,480']].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-1 text-xl font-black text-[#1A1916]">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-5 gap-4">
            <div className="col-span-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1A1916]">
                <BarChart3 size={17} className="text-[#D4A853]" /> {m.costOverview}
              </div>
              <div className="flex h-32 items-end gap-3">
                {[36,58,46,72,65,88,78].map((h,i) => (
                  <div key={i} className="flex-1 rounded-t-xl bg-[#D4A853]/80" style={{ height:`${h}%` }} />
                ))}
              </div>
            </div>
            <div className="col-span-2 rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1A1916]">
                <ClipboardList size={17} className="text-[#D4A853]" /> {m.costSplit}
              </div>
              <div className="mx-auto h-28 w-28 rounded-full border-[18px] border-[#D4A853] border-r-[#16A34A] border-t-[#111111]" />
              <div className="mt-4 space-y-1 text-xs text-gray-600"><p>{m.costSplitSub}</p></div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-bold text-[#1A1916]">{m.upcomingEvents}</p>
            {[m.event1, m.event2].map(row => (
              <div key={row[0]} className="grid grid-cols-4 border-t border-gray-100 py-2 text-sm">
                <span className="font-medium text-[#1A1916]">{row[0]}</span>
                <span className="text-gray-500">{row[1]}</span>
                <span className="text-[#16A34A]">{row[2]}</span>
                <span className="text-right font-bold text-[#1A1916]">{row[3]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating recipe card */}
      <div className="absolute -bottom-10 -right-4 hidden w-52 rounded-[2rem] border border-white/20 bg-white p-3 shadow-2xl lg:block"
           style={{ color: '#1A1916' }}>
        <div className="h-28 rounded-2xl bg-gradient-to-br from-[#2b2117] to-[#c08f43]" />
        <div className="p-2">
          <p className="font-bold text-[#1A1916]">{m.recipeCard}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div><p className="text-gray-500">{m.perPortion}</p><p className="font-black text-[#1A1916]">€4.28</p></div>
            <div><p className="text-gray-500">{m.allergensLabel}</p><p className="font-black text-[#1A1916]">G · M · E</p></div>
          </div>
          <div className="mt-3 flex gap-1">
            {allergenList.slice(0,5).map(a => (
              <span key={a} className="h-5 w-5 rounded-full bg-[#D4A853]/20 text-center text-[10px] leading-5 text-[#1A1916]">
                {a[0]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Landing page ──────────────────────────────────────────────── */
export default function Landing() {
  const { t } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  /* ── IP-based language detection (runs once if no preference stored) */
  useEffect(() => {
    if (!localStorage.getItem('cc_lang')) {
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(data => {
          const lang = detectLangFromCountry(data.country_code);
          i18n.changeLanguage(lang);
          localStorage.setItem('cc_lang', lang);
        })
        .catch(() => { /* silently fall back to default 'en' */ });
    }
  }, []);

  const open = (mode) => { setAuthMode(mode); setShowAuth(true); };
  if (showAuth) return <AuthPage initialMode={authMode} />;

  /* Pull arrays from translations */
  const checks        = t('landing.hero.checks',             { returnObjects: true });
  const features      = t('landing.features.items',          { returnObjects: true });
  const problemItems  = t('landing.problem.items',           { returnObjects: true });
  const featListItems = t('landing.featList.items',          { returnObjects: true });
  const steps         = t('landing.steps.items',             { returnObjects: true });
  const aiCards       = t('landing.ai.cards',               { returnObjects: true });
  const aiMockItems   = t('landing.ai.mockItems',           { returnObjects: true });
  const allergenList  = t('landing.allergen.list',          { returnObjects: true });
  const plans         = t('landing.pricing.plans',          { returnObjects: true });
  const testimonials  = t('landing.testimonials.items',     { returnObjects: true });
  const col1Links     = t('landing.footer.col1Links',       { returnObjects: true });
  const col2Links     = t('landing.footer.col2Links',       { returnObjects: true });
  const col3Links     = t('landing.footer.col3Links',       { returnObjects: true });

  return (
    <main className="min-h-screen bg-[#f5f3ef] font-sans text-[#1A1916]"
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      <NavBar onLogin={() => open('login')} onRegister={() => open('register')} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0b0b09] pt-32 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.25),transparent_35%),linear-gradient(135deg,#050504_0%,#17130f_60%,#2a1e12_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f5f3ef] to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-28 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A853]/40 bg-[#D4A853]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#D4A853]">
              <ChefHat size={15} /> {t('landing.hero.badge')}
            </div>
            <h1 className="max-w-2xl text-5xl font-black tracking-tight md:text-7xl" style={{ lineHeight: 1.05 }}>
              {t('landing.hero.h1')} <span className="text-[#D4A853]">{t('landing.hero.h1gold')}</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/80">
              {t('landing.hero.p')}
            </p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              {checks.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/85">
                  <CheckCircle2 size={17} className="text-[#D4A853]" /> {item}
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <button onClick={() => open('register')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4A853] px-7 py-4 font-bold text-[#1A1916] shadow-xl shadow-[#D4A853]/20 hover:bg-[#c49642]"
                style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t('landing.hero.ctaTrial')} <ArrowRight size={18} />
              </button>
              <button onClick={() => open('login')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 font-bold text-white hover:bg-white/10"
                style={{ background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
                <PlayCircle size={20} /> {t('landing.hero.ctaSignin')}
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/65">
              <span>{t('landing.hero.note1')}</span>
              <span>{t('landing.hero.note2')}</span>
              <span>{t('landing.hero.note3')}</span>
            </div>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section id="features" className="relative z-10 mx-auto -mt-14 max-w-7xl px-5 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-2xl shadow-black/10 md:grid-cols-3 lg:grid-cols-6">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={f.title}
                className={`border-b border-black/5 p-6 text-center last:border-b-0 md:border-r lg:border-b-0 ${i === features.length - 1 ? 'border-r-0' : ''}`}>
                <Icon className="mx-auto text-[#D4A853]" size={32} />
                <h3 className="mt-4 font-bold" style={{ fontSize: 14 }}>{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Problem / Features ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[#1A1916] p-4 shadow-xl">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-[#2b2117] to-[#0d0c0a] p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">{t('landing.problem.label')}</p>
            <h2 className="mt-3 text-4xl font-black" style={{ lineHeight: 1.1 }}>{t('landing.problem.h2')}</h2>
            <p className="mt-5 leading-7 text-white/70">{t('landing.problem.p')}</p>
            <div className="mt-8 space-y-4">
              {problemItems.map(item => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#D4A853]" size={18} /><span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">{t('landing.featList.label')}</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl" style={{ lineHeight: 1.1 }}>{t('landing.featList.h2')}</h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">{t('landing.featList.p')}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {featListItems.map(item => (
              <div key={item} className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={17} className="text-[#D4A853]" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">{t('landing.steps.label')}</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">{t('landing.steps.h2')}</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-5">
            {steps.map(({ title, text }, i) => (
              <div key={title} className="relative">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#D4A853]/30 bg-[#f5f3ef] text-[#D4A853]">
                  <span className="text-2xl font-black">{i + 1}</span>
                </div>
                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Advisor ── */}
      <section id="ai-advisor" className="bg-[#11100e] py-24 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D4A853]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#D4A853]">
              <Sparkles size={15} /> {t('landing.ai.badge')}
            </div>
            <h2 className="mt-5 text-4xl font-black md:text-5xl" style={{ lineHeight: 1.1 }}>{t('landing.ai.h2')}</h2>
            <p className="mt-5 text-lg leading-8 text-white/70">{t('landing.ai.p')}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {aiCards.map(item => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <CheckCircle2 size={18} className="mb-2 text-[#D4A853]" />
                  <p className="font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="rounded-[1.5rem] bg-white p-6 text-[#1A1916]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#D4A853]/15 p-3 text-[#D4A853]"><Sparkles /></div>
                <div>
                  <p className="text-sm font-bold text-[#D4A853]">{t('landing.ai.mockTitle')}</p>
                  <h3 className="text-2xl font-black">{t('landing.ai.mockH3')}</h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {aiMockItems.map(({ title, text }) => (
                  <div key={title} className="rounded-2xl bg-[#f5f3ef] p-4">
                    <p className="font-bold">{title}</p>
                    <p className="mt-1 text-sm text-gray-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Allergen compliance ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">{t('landing.allergen.label')}</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl" style={{ lineHeight: 1.1 }}>{t('landing.allergen.h2')}</h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">{t('landing.allergen.p')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {allergenList.map(item => (
              <span key={item} className="rounded-full border border-[#D4A853]/30 bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-xl">
          <div className="rounded-[1.5rem] border border-black/5 bg-[#f7f4ef] p-6">
            <p className="text-sm font-bold text-[#D4A853]">{t('landing.allergen.pdfLabel')}</p>
            <h3 className="mt-2 text-2xl font-black">{t('landing.allergen.pdfH3')}</h3>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-black/10 pb-2"><span>{t('landing.allergen.pdfGuests')}</span><strong>120</strong></div>
              <div className="flex justify-between border-b border-black/10 pb-2"><span>{t('landing.allergen.pdfPrice')}</span><strong>€46.00</strong></div>
              <div className="flex justify-between border-b border-black/10 pb-2"><span>{t('landing.allergen.pdfVat')}</span><strong>19%</strong></div>
              <div className="flex justify-between text-lg"><span>{t('landing.allergen.pdfTotal')}</span><strong>€5,520</strong></div>
            </div>
            <div className="mt-6 rounded-2xl bg-white p-4">
              <p className="font-bold">{t('landing.allergen.pdfAllergenTitle')}</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">{t('landing.allergen.pdfAllergenText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">{t('landing.pricing.label')}</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">{t('landing.pricing.h2')}</h2>
          <p className="mt-4 text-gray-600">{t('landing.pricing.p')}</p>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan, i) => {
              const cfg = PLAN_CONFIG[i];
              return (
                <div key={plan.name}
                  className={`relative rounded-[2rem] border bg-white p-8 text-left shadow-xl ${cfg.highlight ? 'border-[#D4A853] shadow-[#D4A853]/15' : 'border-black/10'}`}>
                  {cfg.badge && (
                    <span className="absolute right-6 top-6 rounded-full bg-[#16A34A] px-3 py-1 text-xs font-bold uppercase text-white">
                      {t('landing.pricing.bestValue')}
                    </span>
                  )}
                  <p className="text-sm font-bold uppercase tracking-widest text-[#D4A853]">{plan.name}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="pb-2 text-gray-500">{plan.period}</span>
                  </div>
                  <ul className="mt-8 space-y-3" style={{ listStyle: 'none', padding: 0 }}>
                    {plan.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={17} className="text-[#D4A853]" /> {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => open('register')}
                    className={`mt-8 w-full rounded-xl px-5 py-4 font-bold ${cfg.highlight ? 'bg-[#D4A853] text-[#1A1916]' : 'border border-[#1A1916]/20 hover:bg-[#1A1916] hover:text-white'}`}
                    style={{ cursor: 'pointer', fontFamily: 'inherit', background: cfg.highlight ? '#D4A853' : 'transparent' }}>
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-gray-500">{t('landing.pricing.note')}</p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-[#11100e] py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#D4A853]">{t('landing.testimonials.label')}</p>
          <h2 className="mt-3 text-center text-4xl font-black">{t('landing.testimonials.h2')}</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map(t2 => (
              <div key={t2.name} className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <div className="mb-4 flex gap-1 text-[#D4A853]">
                  {[1,2,3,4,5].map(i => <Star key={i} size={17} fill="currentColor" />)}
                </div>
                <p className="text-lg italic leading-8 text-white/85">"{t2.quote}"</p>
                <div className="mt-6">
                  <p className="font-bold">{t2.name}</p>
                  <p className="text-sm text-white/55">{t2.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-[#f5f3ef] py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-4xl font-black md:text-5xl">{t('landing.cta.h2')}</h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">{t('landing.cta.p')}</p>
          <button onClick={() => open('register')}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#D4A853] px-8 py-4 font-bold text-[#1A1916] shadow-lg hover:bg-[#c49642]"
            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t('landing.cta.btn')} <ArrowRight size={18} />
          </button>
          <div className="mt-5 text-sm text-gray-500">
            {t('landing.cta.demo')} <span className="font-semibold text-[#1A1916]">demo@chefcost.app</span> / <span className="font-semibold text-[#1A1916]">demo1234</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-5 lg:px-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <ChefHat className="text-[#D4A853]" />
              <span className="text-2xl font-black">app<span className="text-[#D4A853]">4</span>chef</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600">{t('landing.footer.tagline')}</p>
          </div>

          {/* Product col */}
          <div>
            <p className="font-bold">{t('landing.footer.col1Title')}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
              {col1Links.map(link => (
                <a key={link} href="#" className="hover:text-[#D4A853]"
                   style={{ textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}>{link}</a>
              ))}
            </div>
          </div>

          {/* Legal col */}
          <div>
            <p className="font-bold">{t('landing.footer.col2Title')}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
              {col2Links.map(link => (
                <a key={link} href="#" className="hover:text-[#D4A853]"
                   style={{ textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}>{link}</a>
              ))}
            </div>
          </div>

          {/* Account col */}
          <div>
            <p className="font-bold">{t('landing.footer.col3Title')}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
              {col3Links.map((link, i) => (
                <a key={link} href="#"
                   onClick={(e) => { e.preventDefault(); open(i === 0 ? 'login' : 'register'); }}
                   className="hover:text-[#D4A853]"
                   style={{ textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}>{link}</a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Social share bar ── */}
        <div className="mx-auto mt-10 max-w-7xl border-t border-black/10 px-5 pt-8 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm font-semibold text-gray-500">{t('landing.footer.shareLabel')}</p>
            <div className="flex flex-wrap items-center gap-2">
              {SOCIAL_SHARE.map(s => (
                <SocialBtn key={s.key} {...s} />
              ))}
              <CopyLinkBtn />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-7xl flex-col justify-between gap-4 border-t border-black/10 px-5 pt-6 text-sm text-gray-500 md:flex-row lg:px-8">
          <p>{t('landing.footer.copyright')}</p>
          {/* Language quick-switcher in footer */}
          <div className="flex items-center gap-3">
            {LANGS.map(lang => (
              <button key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); localStorage.setItem('cc_lang', lang.code); }}
                className={`text-sm font-semibold transition hover:text-[#D4A853] ${i18n.language === lang.code ? 'text-[#D4A853]' : 'text-gray-400'}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {lang.flag} {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </footer>

    </main>
  );
}
