import { useState } from 'react';
import { useApp } from '../hooks/useApp.jsx';

export default function AuthPage() {
  const { login, register } = useApp();
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
            <div className="brand-sub">Event Cost Calculator</div>
          </div>
        </div>
        <div className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</div>
        <div className="auth-sub">{mode === 'login' ? 'Sign in to your kitchen dashboard' : 'Start managing your event costs'}</div>
        {error && <div className="auth-error"><i className="ti ti-alert-circle"></i> {error}</div>}
        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Chef Marco" required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="chef@restaurant.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        {mode === 'login' && (
          <div className="auth-switch" style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
            Demo account: <strong style={{ color: 'var(--text2)' }}>demo@chefcost.app</strong> / <strong style={{ color: 'var(--text2)' }}>demo1234</strong>
          </div>
        )}
        <div className="auth-switch">
          {mode === 'login' ? <>No account? <a onClick={() => setMode('register')}>Create one</a></> : <>Have an account? <a onClick={() => setMode('login')}>Sign in</a></>}
        </div>
      </div>
    </div>
  );
}
