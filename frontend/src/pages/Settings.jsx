import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';

const CURRENCIES = [
  { code: 'EUR', label: 'EUR — Euro (€)' },
  { code: 'USD', label: 'USD — Dollar ($)' },
  { code: 'GBP', label: 'GBP — Pound (£)' },
  { code: 'RON', label: 'RON — Romanian Leu' },
  { code: 'HUF', label: 'HUF — Hungarian Forint' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ro', label: 'Română' },
  { code: 'hu', label: 'Magyar' },
];

export default function Settings() {
  const { user, refreshUser } = useApp();
  const { t } = useTranslation();
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'EUR');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [profitMargin, setProfitMargin] = useState(user?.profit_margin ?? 30);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!name.trim()) return alert(t('common.nameRequired'));
    const pct = parseFloat(profitMargin);
    if (isNaN(pct) || pct < 0 || pct > 1000) return alert('Profit margin must be between 0 and 1000');
    setSaving(true);
    setSaved(false);
    try {
      await api.updateSettings({ name: name.trim(), currency, language, profit_margin: pct });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('settings.title')}</div>
      </div>
      <div className="content" style={{ maxWidth: 560 }}>
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>{t('settings.profile')}</h3>

          <div className="form-group">
            <label className="form-label">{t('settings.name')}</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">{t('settings.email')}</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>

          <div className="form-group">
            <label className="form-label">{t('settings.language')}</label>
            <select className="form-input" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('settings.currency')}</label>
            <select className="form-input" value={currency} onChange={e => setCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </button>
            {saved && <span style={{ color: 'var(--green)', fontSize: 13 }}>✓ {t('settings.saved')}</span>}
          </div>
        </div>

        {/* ── Profit Margin card ── */}
        <div className="card" style={{ padding: 28, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <i className="ti ti-chart-line" style={{ fontSize: 20, color: 'var(--accent)' }} />
            <h3 style={{ margin: 0, fontSize: 16 }}>{t('settings.profitMargin')}</h3>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
            {t('settings.profitMarginDesc')}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 140 }}>
              <input
                className="form-control"
                type="number"
                min="0"
                max="1000"
                step="0.5"
                value={profitMargin}
                onChange={e => setProfitMargin(e.target.value)}
                style={{ paddingRight: 32 }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14, pointerEvents: 'none' }}>%</span>
            </div>

            {/* Visual preview: what €10 food cost becomes */}
            <div style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', fontSize: 13 }}>
              <span style={{ color: 'var(--text3)' }}>e.g. €10 cost → </span>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                €{(10 * (1 + parseFloat(profitMargin || 0) / 100)).toFixed(2)}
              </span>
              <span style={{ color: 'var(--text3)' }}> selling price</span>
            </div>
          </div>

          {/* Margin indicator bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
              <span>0%</span>
              <span style={{ color: parseFloat(profitMargin) < 20 ? 'var(--red)' : parseFloat(profitMargin) < 35 ? 'var(--accent)' : 'var(--green)' }}>
                {parseFloat(profitMargin || 0).toFixed(1)}%
              </span>
              <span>100%</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, transition: 'width 0.3s, background 0.3s',
                width: `${Math.min(100, parseFloat(profitMargin || 0))}%`,
                background: parseFloat(profitMargin) < 20 ? 'var(--red)' : parseFloat(profitMargin) < 35 ? 'var(--accent)' : 'var(--green)',
              }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
              {parseFloat(profitMargin) < 20 && <span style={{ color: 'var(--red)' }}>⚠ Below typical industry minimum (20%)</span>}
              {parseFloat(profitMargin) >= 20 && parseFloat(profitMargin) < 35 && <span style={{ color: 'var(--accent)' }}>✓ Acceptable range (20–35%)</span>}
              {parseFloat(profitMargin) >= 35 && <span style={{ color: 'var(--green)' }}>✓ Strong margin (35%+)</span>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </button>
            {saved && <span style={{ color: 'var(--green)', fontSize: 13 }}>✓ {t('settings.saved')}</span>}
          </div>
        </div>

        <div className="card" style={{ padding: 28, marginTop: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{t('settings.subscriptionTitle')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`badge ${
              user?.subscription_status === 'active' ? 'badge-green' :
              user?.subscription_status === 'trial' ? 'badge-blue' : 'badge-gray'
            }`}>
              {t(`settings.status_${user?.subscription_status || 'free'}`)}
            </span>
            {user?.subscription_status === 'trial' && user?.trial_end && (
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>
                {t('settings.trialEnds')} {new Date(user.trial_end).toLocaleDateString()}
              </span>
            )}
          </div>
          {user?.cancel_at && new Date(user.cancel_at) > new Date() && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--red-soft, #fef2f2)', border: '1px solid var(--red, #ef4444)', borderRadius: 6, fontSize: 13, color: 'var(--red, #ef4444)' }}>
              <i className="ti ti-clock" style={{ marginRight: 6 }}></i>
              {t('settings.cancelledOn', { date: new Date(user.cancel_at).toLocaleDateString() })}
            </div>
          )}
          {(user?.subscription_status === 'free') && (
            <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--text3)' }}>
              {t('settings.upgradeHint')}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
