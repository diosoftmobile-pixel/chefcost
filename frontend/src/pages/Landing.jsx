import { useState } from 'react';
import {
  ChefHat, Calculator, CalendarDays, FileText, Sparkles, ShieldCheck,
  Utensils, CheckCircle2, PlayCircle, Globe2, Menu, X, Star,
  ArrowRight, BarChart3, ClipboardList, BadgeCheck,
} from 'lucide-react';
import AuthPage from './AuthPage.jsx';

const features = [
  { icon: Calculator,  title: 'Recipe & Cost Calculator', text: 'Real-time recipe food cost and portion calculation.' },
  { icon: Utensils,    title: 'Menu Builder',             text: 'Create multi-course menus with markup, VAT and price per guest.' },
  { icon: CalendarDays,title: 'Event Management',         text: 'Plan events, manage guests, menus, budgets and shopping lists.' },
  { icon: ShieldCheck, title: 'Allergen Tracking',        text: 'EU 14 allergen tracking built into every ingredient and recipe.' },
  { icon: Sparkles,    title: 'AI Advisor',               text: 'Get AI insights to improve profitability, balance and pricing.' },
  { icon: FileText,    title: 'Professional Quotes',      text: 'One-click PDF quotes that look premium and win more clients.' },
];

const steps = [
  ['Add Ingredients',  'Enter products, prices, suppliers and allergens.'],
  ['Build Recipes',    'Create recipes and calculate cost per portion.'],
  ['Create Menus',     'Combine recipes and define markup, VAT and price.'],
  ['Plan Events',      'Add the client, guest count, menu and event details.'],
  ['Send Offer',       'Export a professional PDF quote in seconds.'],
];

const allergens = ['Gluten','Crustaceans','Eggs','Fish','Peanuts','Soy','Milk','Nuts','Celery','Mustard','Sesame','Sulphites','Lupin','Molluscs'];

const pricing = [
  {
    name: '14-Day Trial', price: '€6.99', period: 'one-time', cta: 'Start 14-Day Trial', highlight: true,
    items: ['Full access to all features', 'Includes AI Advisor', 'Credit card required', 'Cancel anytime'],
  },
  {
    name: 'Monthly', price: '€49.99', period: '/month', cta: 'Start Monthly Plan', highlight: false,
    items: ['Unlimited ingredients', 'Unlimited recipes & menus', 'Unlimited events', 'PDF quotes included'],
  },
  {
    name: 'Yearly', price: '€499', period: '/year', cta: 'Start Yearly Plan', highlight: false, badge: 'Best Value',
    items: ['Save 17%', 'Equivalent to 2 months free', 'Unlimited everything', 'Priority support'],
  },
];

const testimonials = [
  { name: 'Marco Bianchi',  role: 'Executive Chef',   quote: 'Now I know exactly which dishes make money and which ones need repricing.' },
  { name: 'Elena Popescu',  role: 'Catering Owner',   quote: 'I can quote a 200-person wedding in minutes. My offers finally look professional.' },
  { name: 'Thomas Dubois',  role: 'Private Chef',     quote: 'The allergen tracking and PDF quotes are exactly what I needed for premium clients.' },
];

function NavBar({ onLogin, onRegister }) {
  const [open, setOpen] = useState(false);
  const nav = ['Features', 'How it works', 'Pricing', 'AI Advisor'];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0d0c0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="#" className="flex items-center gap-2 text-white" style={{ textDecoration:'none' }}>
          <div className="rounded-xl border border-[#D4A853]/40 bg-[#D4A853]/10 p-2 text-[#D4A853]">
            <ChefHat size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            app<span className="text-[#D4A853]">4</span>chef
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-white/80 lg:flex">
          {nav.map(item => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
               className="hover:text-[#D4A853]" style={{ textDecoration:'none', color:'inherit' }}>
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button onClick={onLogin}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
            style={{ background:'transparent', cursor:'pointer', fontFamily:'inherit' }}>
            Log in
          </button>
          <button onClick={onRegister}
            className="rounded-xl bg-[#D4A853] px-5 py-2.5 text-sm font-bold text-[#1A1916] shadow-lg shadow-[#D4A853]/20 hover:bg-[#c49642]"
            style={{ cursor:'pointer', border:'none', fontFamily:'inherit' }}>
            Start 14-Day Trial
          </button>
        </div>

        <button onClick={() => setOpen(!open)} className="text-white lg:hidden"
          style={{ background:'transparent', border:'none', cursor:'pointer', color:'white' }}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#11100e] px-5 py-5 lg:hidden">
          <div className="flex flex-col gap-4 text-white/85">
            {nav.map(item => (
              <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                 onClick={() => setOpen(false)} style={{ textDecoration:'none', color:'inherit' }}>
                {item}
              </a>
            ))}
            <button onClick={() => { setOpen(false); onRegister(); }}
              className="rounded-xl bg-[#D4A853] px-5 py-3 text-center font-bold text-[#1A1916]"
              style={{ border:'none', cursor:'pointer', fontFamily:'inherit' }}>
              Start 14-Day Trial
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function DashboardMockup() {
  return (
    <div className="relative" style={{ color: '#1A1916' }}>
      <div className="rounded-[2rem] border border-white/15 bg-white p-4 shadow-2xl shadow-black/40">
        <div className="rounded-[1.4rem] bg-[#f7f4ef] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">Dashboard</p>
              <h3 className="text-xl font-bold text-[#1A1916]">Event Profitability</h3>
            </div>
            <BadgeCheck className="text-[#16A34A]" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['Total Events','24'],['Food Cost','28.6%'],['Revenue','€21,480']].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-1 text-xl font-black text-[#1A1916]">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-5 gap-4">
            <div className="col-span-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1A1916]">
                <BarChart3 size={17} className="text-[#D4A853]" /> Cost Overview
              </div>
              <div className="flex h-32 items-end gap-3">
                {[36,58,46,72,65,88,78].map((h,i) => (
                  <div key={i} className="flex-1 rounded-t-xl bg-[#D4A853]/80" style={{ height:`${h}%` }} />
                ))}
              </div>
            </div>
            <div className="col-span-2 rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#1A1916]">
                <ClipboardList size={17} className="text-[#D4A853]" /> Cost Split
              </div>
              <div className="mx-auto h-28 w-28 rounded-full border-[18px] border-[#D4A853] border-r-[#16A34A] border-t-[#111111]" />
              <div className="mt-4 space-y-1 text-xs text-gray-600"><p>Food · Labor · Logistics · Other</p></div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-bold text-[#1A1916]">Upcoming Events</p>
            {[['Wedding Menu','May 31','Sent Offer','€4,280'],['Corporate Dinner','June 08','Approved','€2,930']].map(row => (
              <div key={row[0]} className="grid grid-cols-4 border-t border-gray-100 py-2 text-sm">
                <span className="font-medium">{row[0]}</span>
                <span className="text-gray-500">{row[1]}</span>
                <span className="text-[#16A34A]">{row[2]}</span>
                <span className="text-right font-bold">{row[3]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-10 -right-4 hidden w-52 rounded-[2rem] border border-white/20 bg-white p-3 shadow-2xl lg:block"
           style={{ color: '#1A1916' }}>
        <div className="h-28 rounded-2xl bg-gradient-to-br from-[#2b2117] to-[#c08f43]" />
        <div className="p-2">
          <p className="font-bold text-[#1A1916]">Beef Tenderloin</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div><p className="text-gray-500">Per portion</p><p className="font-black text-[#1A1916]">€4.28</p></div>
            <div><p className="text-gray-500">Allergens</p><p className="font-black text-[#1A1916]">G · M · E</p></div>
          </div>
          <div className="mt-3 flex gap-1">
            {allergens.slice(0,5).map(a => (
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

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const open = (mode) => { setAuthMode(mode); setShowAuth(true); };

  if (showAuth) return <AuthPage initialMode={authMode} />;

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
              <ChefHat size={15} /> The business app for professional chefs
            </div>
            <h1 className="max-w-2xl text-5xl font-black tracking-tight md:text-7xl" style={{ lineHeight:1.05 }}>
              Know your food cost. <span className="text-[#D4A853]">Price with confidence.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/80">
              Calculate real food costs, build profitable menus, manage events, track allergens and generate professional PDF quotes in minutes.
            </p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              {['Recipe & Cost Calculator','Allergen & Nutrition Tracking','Event Management','AI-Powered Menu Advisor'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/85">
                  <CheckCircle2 size={17} className="text-[#D4A853]" /> {item}
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <button onClick={() => open('register')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4A853] px-7 py-4 font-bold text-[#1A1916] shadow-xl shadow-[#D4A853]/20 hover:bg-[#c49642]"
                style={{ border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                Start 14-Day Trial — €6.99 <ArrowRight size={18} />
              </button>
              <button onClick={() => open('login')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 font-bold text-white hover:bg-white/10"
                style={{ background:'transparent', cursor:'pointer', fontFamily:'inherit' }}>
                <PlayCircle size={20} /> Sign in
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/65">
              <span>14-day full access</span>
              <span>Cancel anytime</span>
              <span>Demo: demo@chefcost.app / demo1234</span>
            </div>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section id="features" className="relative z-10 mx-auto -mt-14 max-w-7xl px-5 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-2xl shadow-black/10 md:grid-cols-3 lg:grid-cols-6">
          {features.map((f, i) => (
            <div key={f.title}
              className={`border-b border-black/5 p-6 text-center last:border-b-0 md:border-r lg:border-b-0 ${i === features.length - 1 ? 'border-r-0' : ''}`}>
              <f.icon className="mx-auto text-[#D4A853]" size={32} />
              <h3 className="mt-4 font-bold" style={{ fontSize:14 }}>{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem / Features ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[#1A1916] p-4 shadow-xl">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-[#2b2117] to-[#0d0c0a] p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">Food costing made simple</p>
            <h2 className="mt-3 text-4xl font-black" style={{ lineHeight:1.1 }}>Stop pricing menus by instinct.</h2>
            <p className="mt-5 leading-7 text-white/70">
              Most chefs use Excel, habit or competitor guessing. App4Chef gives you real cost visibility before you send the offer.
            </p>
            <div className="mt-8 space-y-4">
              {['Margins disappear without being noticed','Event quotes take hours and contain mistakes','Allergen declarations are managed manually','Ingredient prices are hard to update everywhere'].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#D4A853]" size={18} /><span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">Powerful features for chefs</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl" style={{ lineHeight:1.1 }}>Everything you need to run a profitable kitchen</h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            From ingredient database to final client proposal, App4Chef helps food businesses manage the full workflow of costing, planning, pricing and delivering events.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {['Real-time recipe costing','Automatic price updates','Menu pricing per guest','Event cost calculator','Shopping list generator','Professional PDF quotes','EU allergen tracking','AI-powered menu advisor','Multi-language support','Secure cloud backup'].map(item => (
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
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">How it works</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">From recipe to profitable event in 5 simple steps</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-5">
            {steps.map(([title, text], i) => (
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
              <Sparkles size={15} /> Chef's AI Advisor
            </div>
            <h2 className="mt-5 text-4xl font-black md:text-5xl" style={{ lineHeight:1.1 }}>Your AI culinary consultant, built in.</h2>
            <p className="mt-5 text-lg leading-8 text-white/70">
              The AI Advisor reviews your menu and gives practical feedback before you send the offer to your client.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {['Menu balance','Food cost %','Pricing competitiveness','Allergen risks','Profitability','Chef improvement tips'].map(item => (
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
                  <p className="text-sm font-bold text-[#D4A853]">AI Menu Review</p>
                  <h3 className="text-2xl font-black">Wedding Premium Menu</h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  ['Menu Balance',            'Strong structure with clear premium positioning.'],
                  ['Food Cost Analysis',      'Food cost is 29.4%, inside the recommended range.'],
                  ['Pricing Recommendation',  'Increase dessert markup by 8–10% for better margin.'],
                  ['Allergen Alert',          'Contains gluten, milk, eggs and nuts. Add visible guest warning.'],
                ].map(([title, text]) => (
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
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">Allergen compliance</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl" style={{ lineHeight:1.1 }}>EU allergen tracking built into every recipe.</h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            Tag ingredients once and App4Chef automatically carries allergens into recipes, menus, events and PDF quotes — citing EU Regulation 1169/2011.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {allergens.map(item => (
              <span key={item} className="rounded-full border border-[#D4A853]/30 bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-xl">
          <div className="rounded-[1.5rem] border border-black/5 bg-[#f7f4ef] p-6">
            <p className="text-sm font-bold text-[#D4A853]">PDF Quote Preview</p>
            <h3 className="mt-2 text-2xl font-black">Corporate Dinner — Q-083509</h3>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-black/10 pb-2"><span>Guests</span><strong>120</strong></div>
              <div className="flex justify-between border-b border-black/10 pb-2"><span>Price per guest</span><strong>€46.00</strong></div>
              <div className="flex justify-between border-b border-black/10 pb-2"><span>VAT</span><strong>19%</strong></div>
              <div className="flex justify-between text-lg"><span>Grand Total</span><strong>€5,520</strong></div>
            </div>
            <div className="mt-6 rounded-2xl bg-white p-4">
              <p className="font-bold">Allergen Declaration</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                This menu contains: Gluten, Milk, Eggs, Nuts. Please inform guests with allergies before serving. (EU Reg. 1169/2011)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A853]">Pricing</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">Start with a 14-day trial</h2>
          <p className="mt-4 text-gray-600">Full access to all features. Cancel anytime.</p>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricing.map(plan => (
              <div key={plan.name}
                className={`relative rounded-[2rem] border bg-white p-8 text-left shadow-xl ${plan.highlight ? 'border-[#D4A853] shadow-[#D4A853]/15' : 'border-black/10'}`}>
                {plan.badge && (
                  <span className="absolute right-6 top-6 rounded-full bg-[#16A34A] px-3 py-1 text-xs font-bold uppercase text-white">
                    {plan.badge}
                  </span>
                )}
                <p className="text-sm font-bold uppercase tracking-widest text-[#D4A853]">{plan.name}</p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="pb-2 text-gray-500">{plan.period}</span>
                </div>
                <ul className="mt-8 space-y-3" style={{ listStyle:'none', padding:0 }}>
                  {plan.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={17} className="text-[#D4A853]" /> {item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => open('register')}
                  className={`mt-8 w-full rounded-xl px-5 py-4 font-bold ${plan.highlight ? 'bg-[#D4A853] text-[#1A1916]' : 'border border-[#1A1916]/20 hover:bg-[#1A1916] hover:text-white'}`}
                  style={{ cursor:'pointer', fontFamily:'inherit', background: plan.highlight ? '#D4A853' : 'transparent' }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500">Secure payments by Stripe · Cancel anytime</p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-[#11100e] py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#D4A853]">Trusted by chefs worldwide</p>
          <h2 className="mt-3 text-center text-4xl font-black">Built for chefs who want control</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map(t => (
              <div key={t.name} className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <div className="mb-4 flex gap-1 text-[#D4A853]">
                  {[1,2,3,4,5].map(i => <Star key={i} size={17} fill="currentColor" />)}
                </div>
                <p className="text-lg italic leading-8 text-white/85">"{t.quote}"</p>
                <div className="mt-6">
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-white/55">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-[#f5f3ef] py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-4xl font-black md:text-5xl">Stop guessing. Start calculating.</h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            Know your food cost, protect your margins, manage allergens and send professional quotes from one simple app.
          </p>
          <button onClick={() => open('register')}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#D4A853] px-8 py-4 font-bold text-[#1A1916] shadow-lg hover:bg-[#c49642]"
            style={{ border:'none', cursor:'pointer', fontFamily:'inherit' }}>
            Start Your 14-Day Trial <ArrowRight size={18} />
          </button>
          <div className="mt-5 text-sm text-gray-500">
            Or try the demo — <span className="font-semibold text-[#1A1916]">demo@chefcost.app</span> / <span className="font-semibold text-[#1A1916]">demo1234</span>
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
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600">The simplest and most powerful app for chefs and caterers.</p>
          </div>
          {[
            ['Product',  'Features', 'How it works', 'Pricing', 'AI Advisor'],
            ['Legal',    'Privacy Policy', 'Terms of Service', 'Cookie Policy'],
            ['Account',  'Sign in', 'Create account', 'Demo account'],
          ].map(([title, ...links]) => (
            <div key={title}>
              <p className="font-bold">{title}</p>
              <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
                {links.map(link => (
                  <a key={link} href="#"
                    onClick={link === 'Sign in' ? (e) => { e.preventDefault(); open('login'); }
                           : link === 'Create account' || link === 'Demo account' ? (e) => { e.preventDefault(); open('register'); }
                           : undefined}
                    className="hover:text-[#D4A853]" style={{ textDecoration:'none', cursor:'pointer', color:'inherit' }}>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-4 border-t border-black/10 px-5 pt-6 text-sm text-gray-500 md:flex-row lg:px-8">
          <p>© 2026 App4Chef. All rights reserved.</p>
          <p>Available in EN · FR · RO · HU</p>
        </div>
      </footer>

    </main>
  );
}
