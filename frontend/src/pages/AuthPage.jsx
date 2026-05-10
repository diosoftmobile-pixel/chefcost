import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';

export default function AuthPage() {
  const { login, register } = useApp();
  const { t } = useTranslation();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><i className="ti ti-chef-hat"></i></div>
          <div>
            <div className="brand-name" style={{ fontSize: 18 }}>ChefCost</div>
            <div className="brand-sub">{t('nav.brandSub')}</div>
          </div>
        </div>
        <div className="auth-title">{mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}</div>
        <div className="auth-sub">{mode === 'login' ? t('auth.signInSub') : t('auth.createSub')}</div>
        {error && <div className="auth-error"><i className="ti ti-alert-circle"></i> {error}</div>}
        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">{t('auth.fullName')}</label>
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Chef Marco" required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('auth.emailAddress')}</label>
            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="chef@restaurant.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? t('common.pleaseWait') : mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
          </button>
        </form>
        {mode === 'login' && (
          <div className="auth-switch" style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
            {t('auth.demoAccount')}: <strong style={{ color: 'var(--text2)' }}>demo@chefcost.app</strong> / <strong style={{ color: 'var(--text2)' }}>demo1234</strong>
          </div>
        )}
        <div className="auth-switch">
          {mode === 'login'
            ? <>{t('auth.noAccount')} <a onClick={() => setMode('register')}>{t('auth.createOne')}</a></>
            : <>{t('auth.haveAccount')} <a onClick={() => setMode('login')}>{t('auth.signInLink')}</a></>}
        </div>
      </div>
    </div>
  );
}
