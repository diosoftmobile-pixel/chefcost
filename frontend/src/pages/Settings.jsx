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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!name.trim()) return alert(t('common.nameRequired'));
    setSaving(true);
    setSaved(false);
    try {
      await api.updateSettings({ name: name.trim(), currency, language });
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
