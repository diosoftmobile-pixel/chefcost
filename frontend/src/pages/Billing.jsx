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

  const startTrial = () => checkout('trial');

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

  const cancelSub = async () => {
    if (!confirm(t('billing.confirmCancel'))) return;
    setLoading(true);
    try {
      const result = await api.cancelSubscription();
      await refreshUser();
      setMsg(t('billing.cancelScheduled', { date: new Date(result.cancel_at).toLocaleDateString() }));
    } catch (e) { setMsg(e.message); }
    finally { setLoading(false); }
  };

  const reactivateSub = async () => {
    setLoading(true);
    try {
      await api.reactivateSubscription();
      await refreshUser();
      setMsg(t('billing.reactivated'));
    } catch (e) { setMsg(e.message); }
    finally { setLoading(false); }
  };

  const sub = user?.subscription_status || 'free';
  const plan = user?.subscription_plan || null;
  const trialUsed = sub !== 'free';
  const isNewUser = sub === 'free';
  const cancelAt = user?.cancel_at ? new Date(user.cancel_at) : null;
  const isCancelled = cancelAt && cancelAt > new Date();
  // Active Stripe subscribers must switch plans via the portal, not create a new subscription
  const hasActiveStripe = sub === 'active';

  const plans = [
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
      cta: hasActiveStripe ? null : t('billing.subscribe'),
      ctaAction: () => checkout('monthly'),
      current: sub === 'active' && plan === 'monthly',
    },
    {
      id: 'yearly',
      name: t('billing.planYearly'),
      price: '€499',
      period: `/${t('billing.year')}`,
      badge: t('billing.save17'),
      features: [t('billing.featAll'), t('billing.featBestValue')],
      cta: hasActiveStripe ? null : t('billing.subscribe'),
      ctaAction: () => checkout('yearly'),
      current: sub === 'active' && plan === 'yearly',
    },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('billing.title')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isPaid && !isCancelled && (
            <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={cancelSub} disabled={loading}>
              <i className="ti ti-x"></i> {t('billing.cancelBtn')}
            </button>
          )}
          {isPaid && isCancelled && (
            <button className="btn btn-ghost" style={{ color: 'var(--green)' }} onClick={reactivateSub} disabled={loading}>
              <i className="ti ti-refresh"></i> {t('billing.reactivateBtn')}
            </button>
          )}
          {isPaid && (
            <button className="btn btn-ghost" onClick={openPortal} disabled={loading}>
              <i className="ti ti-credit-card"></i> {t('billing.manageSubscription')}
            </button>
          )}
        </div>
      </div>
      <div className="content">
        {isCancelled && (
          <div className="card" style={{ padding: '12px 20px', marginBottom: 16, background: 'var(--red-soft, #fef2f2)', border: '1px solid var(--red, #ef4444)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className="ti ti-clock" style={{ color: 'var(--red, #ef4444)', fontSize: 18 }}></i>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t('billing.cancelledTitle')}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                {t('billing.cancelledDesc', { date: cancelAt.toLocaleDateString() })}
              </div>
            </div>
            <button className="btn btn-ghost" style={{ marginLeft: 'auto', color: 'var(--green)', whiteSpace: 'nowrap' }} onClick={reactivateSub} disabled={loading}>
              {t('billing.reactivateBtn')}
            </button>
          </div>
        )}

        {isNewUser && (
          <div className="card" style={{ padding: '16px 20px', marginBottom: 16, background: 'var(--accent-soft)', border: '2px solid var(--accent)', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{t('billing.welcomeTitle')}</div>
            <div style={{ color: 'var(--text2)', fontSize: 13 }}>{t('billing.welcomeDesc')}</div>
          </div>
        )}

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

        {hasActiveStripe && (
          <p style={{ color: 'var(--text3)', marginTop: 16, fontSize: 13, textAlign: 'center' }}>
            {t('billing.switchPlanHint')} <button className="btn btn-ghost" style={{ fontSize: 13, padding: '2px 8px' }} onClick={openPortal} disabled={loading}>{t('billing.manageSubscription')}</button>
          </p>
        )}
      </div>
    </>
  );
}
