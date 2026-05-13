import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import i18n from '../i18n/index.js';

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

function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 20, color: 'var(--accent)', marginTop: 1 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SaveBar({ saving, saved, onSave, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
      <button className="btn btn-primary" onClick={onSave} disabled={saving}>
        {saving ? t('common.saving') : t('common.save')}
      </button>
      {saved && <span style={{ color: 'var(--green)', fontSize: 13 }}>✓ {t('settings.saved')}</span>}
    </div>
  );
}

export default function Settings() {
  const { user, refreshUser } = useApp();
  const { t } = useTranslation();

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'EUR');
  const [language, setLanguage] = useState(user?.language || 'en');

  // Company
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [companyAddress, setCompanyAddress] = useState(user?.company_address || '');
  const [vatNumber, setVatNumber] = useState(user?.vat_number || '');
  const [companyEmail, setCompanyEmail] = useState(user?.company_email || '');
  const [companyPhone, setCompanyPhone] = useState(user?.company_phone || '');

  // Costing
  const [profitMargin, setProfitMargin] = useState(user?.profit_margin ?? 30);
  const [defaultVat, setDefaultVat] = useState(user?.default_vat ?? 19);
  const [foodCostTarget, setFoodCostTarget] = useState(user?.food_cost_target ?? 32);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const doSave = async (extra = {}) => {
    if (!name.trim()) return alert(t('common.nameRequired'));
    setSaving(true);
    setSaved(false);
    try {
      await api.updateSettings({
        name: name.trim(),
        currency,
        language,
        profit_margin: parseFloat(profitMargin),
        default_vat: parseFloat(defaultVat),
        food_cost_target: parseFloat(foodCostTarget),
        company_name: companyName,
        company_address: companyAddress,
        vat_number: vatNumber,
        company_email: companyEmail,
        company_phone: companyPhone,
        ...extra,
      });
      await refreshUser();
      // Apply language immediately
      i18n.changeLanguage(language);
      localStorage.setItem('cc_lang', language);
      localStorage.setItem('cc_currency', currency);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const pMargin = parseFloat(profitMargin) || 0;
  const pFoodCost = parseFloat(foodCostTarget) || 0;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('settings.title')}</div>
      </div>
      <div className="page-content" style={{ maxWidth: 700 }}>

        {/* ── Profile ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle icon="ti-user" title={t('settings.profile')} />
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('settings.name')}</label>
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.email')}</label>
              <input className="form-control" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('settings.language')}</label>
              <select className="form-control" value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.currency')}</label>
              <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <SaveBar saving={saving} saved={saved} onSave={doSave} t={t} />
        </div>

        {/* ── Company Profile ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle icon="ti-building" title={t('settings.companyProfile')} sub={t('settings.companyProfileDesc')} />
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('settings.companyName')}</label>
              <input className="form-control" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={t('common.optional')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.vatNumber')}</label>
              <input className="form-control" value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder={t('common.optional')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('settings.companyAddress')}</label>
            <input className="form-control" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder={t('common.optional')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('settings.companyEmail')}</label>
              <input className="form-control" type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder={t('common.optional')} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.companyPhone')}</label>
              <input className="form-control" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder={t('common.optional')} />
            </div>
          </div>
          <SaveBar saving={saving} saved={saved} onSave={doSave} t={t} />
        </div>

        {/* ── Costing Defaults ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle icon="ti-chart-line" title={t('settings.costingDefaults')} sub={t('settings.costingDefaultsDesc')} />

          {/* Profit Margin */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label">{t('settings.profitMargin')}</label>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text3)' }}>{t('settings.profitMarginDesc')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: 140 }}>
                <input className="form-control" type="number" min="0" max="1000" step="0.5" value={profitMargin} onChange={e => setProfitMargin(e.target.value)} style={{ paddingRight: 28 }} />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 13 }}>%</span>
              </div>
              <div style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--bg4)', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>e.g. €10 cost → </span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>€{(10 * (1 + pMargin / 100)).toFixed(2)}</span>
                <span style={{ color: 'var(--text3)' }}> selling price</span>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{
                  height: '100%', borderRadius: 2, transition: 'width 0.3s, background 0.3s',
                  width: `${Math.min(100, pMargin)}%`,
                  background: pMargin < 20 ? 'var(--red)' : pMargin < 35 ? 'var(--accent)' : 'var(--green)',
                }} />
              </div>
              <div style={{ fontSize: 11, color: pMargin < 20 ? 'var(--red)' : pMargin < 35 ? 'var(--accent)' : 'var(--green)' }}>
                {pMargin < 20 && `⚠ ${t('settings.marginLow')}`}
                {pMargin >= 20 && pMargin < 35 && `✓ ${t('settings.marginOk')}`}
                {pMargin >= 35 && `✓ ${t('settings.marginStrong')}`}
              </div>
            </div>
          </div>

          {/* Default VAT */}
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">{t('settings.defaultVat')}</label>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text3)' }}>{t('settings.defaultVatDesc')}</p>
              <div style={{ position: 'relative', maxWidth: 160 }}>
                <input className="form-control" type="number" min="0" max="100" step="0.5" value={defaultVat} onChange={e => setDefaultVat(e.target.value)} style={{ paddingRight: 28 }} />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 13 }}>%</span>
              </div>
            </div>

            {/* Food Cost Target */}
            <div className="form-group">
              <label className="form-label">{t('settings.foodCostTarget')}</label>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text3)' }}>{t('settings.foodCostTargetDesc')}</p>
              <div style={{ position: 'relative', maxWidth: 160 }}>
                <input className="form-control" type="number" min="0" max="100" step="0.5" value={foodCostTarget} onChange={e => setFoodCostTarget(e.target.value)} style={{ paddingRight: 28 }} />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 13 }}>%</span>
              </div>
              {pFoodCost > 40 && <div style={{ fontSize: 11, marginTop: 4, color: 'var(--amber)' }}>⚠ {t('settings.foodCostHigh')}</div>}
              {pFoodCost <= 40 && pFoodCost > 0 && <div style={{ fontSize: 11, marginTop: 4, color: 'var(--green)' }}>✓ {t('settings.foodCostGood')}</div>}
            </div>
          </div>

          <SaveBar saving={saving} saved={saved} onSave={doSave} t={t} />
        </div>

        {/* ── Subscription ── */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle icon="ti-credit-card" title={t('settings.subscriptionTitle')} />
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
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: 6, fontSize: 13, color: '#ef4444' }}>
              <i className="ti ti-clock" style={{ marginRight: 6 }}></i>
              {t('settings.cancelledOn', { date: new Date(user.cancel_at).toLocaleDateString() })}
            </div>
          )}
          {user?.subscription_status === 'free' && (
            <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--text3)' }}>{t('settings.upgradeHint')}</p>
          )}
        </div>
      </div>
    </>
  );
}
