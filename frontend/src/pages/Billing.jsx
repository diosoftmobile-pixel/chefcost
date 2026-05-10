import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';

const CHECK = '✓';

export default function Billing() {
  const { user, isPaid, refreshUser } = useApp();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Handle Stripe redirect success
  useEffect(() => {
    if (window.location.search.includes('success=1')) {
      refreshUser();
      setMsg(t('billing.paymentSuccess'));
      window.history.replaceState({}, '', '/billing');
    }
  }, []);

  const startTrial = async () => {
    setLoading(true);
    try {
      await api.startTrial();
      await refreshUser();
      setMsg(t('billing.trialStarted'));
    } catch (e) {
      setMsg(e.message === 'Trial or subscription already used' ? t('billing.trialUsed') : e.message);
    } finally { setLoading(false); }
  };

  const checkout = async (plan) => {
    setLoading(true);
    try {
      const { url } = await api.createCheckout(plan);
      window.location.href = url;
    } catch (e) {
      if (e.message === 'stripe_not_configured') {
        setMsg(t('billing.stripeNotConfigured'));
      } else {
        setMsg(e.message);
      }
      setLoading(false);
    }
  };

  const openPortal = async () => {
    setLoading(true);
    try {
      const { url } = await api.createPortal();
      window.location.href = url;
    } catch (e) {
      setMsg(t('billing.stripeNotConfigured'));
      setLoading(false);
    }
  };

  const sub = user?.subscription_status || 'free';
  const trialUsed = sub !== 'free';

  const plans = [
    {
      id: 'free',
      name: t('billing.planFree'),
      price: t('billing.free'),
      period: '',
      features: [t('billing.featViewIngredients'), t('billing.featViewRecipes'), t('billing.featMenus'), t('billing.featEvents')],
      locked: [t('billing.featAddIngredients'), t('billing.featAddRecipes')],
      cta: null,
      current: sub === 'free',
    },
    {
      id: 'trial',
      name: t('billing.planTrial'),
      price: '€6.99',
      period: t('billing.for14days'),
      features: [t('billing.featAll'), t('billing.featThenMonthly')],
      cta: trialUsed ? null : t('billing.startTrial'),
      ctaAction: startTrial,
      current: sub === 'trial',
      highlight: true,
    },
    {
      id: 'monthly',
      name: t('billing.planMonthly'),
      price: '€49.99',
      period: `/${t('billing.month')}`,
      features: [t('billing.featAll'), t('billing.featCancel')],
      cta: t('billing.subscribe'),
      ctaAction: () => checkout('monthly'),
      current: sub === 'active',
    },
    {
      id: 'yearly',
      name: t('billing.planYearly'),
      price: '€499',
      period: `/${t('billing.year')}`,
      badge: t('billing.save17'),
      features: [t('billing.featAll'), t('billing.featBestValue')],
      cta: t('billing.subscribe'),
      ctaAction: () => checkout('yearly'),
      current: false,
    },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('billing.title')}</div>
        {isPaid && (
          <button className="btn btn-ghost" onClick={openPortal} disabled={loading}>
            <i className="ti ti-credit-card"></i> {t('billing.manageSubscription')}
          </button>
        )}
      </div>
      <div className="content">
        {msg && (
          <div className="card" style={{ padding: '12px 20px', marginBottom: 16, background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
            {msg}
          </div>
        )}

        <p style={{ color: 'var(--text3)', marginBottom: 24, fontSize: 14 }}>{t('billing.subtitle')}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {plans.map(p => (
            <div key={p.id} className="card" style={{
              padding: 24,
              border: p.highlight ? '2px solid var(--accent)' : p.current ? '2px solid var(--green)' : '1px solid var(--border)',
              position: 'relative',
            }}>
              {p.badge && (
                <span style={{ position: 'absolute', top: -10, right: 16, background: 'var(--accent)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 99 }}>{p.badge}</span>
              )}
              {p.current && (
                <span className="badge badge-green" style={{ marginBottom: 8, display: 'inline-block' }}>{t('billing.currentPlan')}</span>
              )}
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
                {p.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text3)' }}>{p.period}</span>
              </div>
              <ul style={{ margin: '16px 0', padding: 0, listStyle: 'none', fontSize: 13 }}>
                {p.features.map((f, i) => (
                  <li key={i} style={{ padding: '3px 0', color: 'var(--text2)' }}>
                    <span style={{ color: 'var(--green)', marginRight: 6 }}>{CHECK}</span>{f}
                  </li>
                ))}
                {(p.locked || []).map((f, i) => (
                  <li key={`l${i}`} style={{ padding: '3px 0', color: 'var(--text3)', textDecoration: 'line-through' }}>
                    <i className="ti ti-lock" style={{ marginRight: 6, fontSize: 12 }}></i>{f}
                  </li>
                ))}
              </ul>
              {p.cta && !p.current && (
                <button
                  className={`btn ${p.highlight ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={p.ctaAction}
                  disabled={loading}
                >
                  {p.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
