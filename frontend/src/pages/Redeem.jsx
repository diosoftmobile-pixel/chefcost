import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';

export default function Redeem() {
  const { user, refreshUser } = useApp();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle / submitting / success / error
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('code');
    if (c) setCode(c.toUpperCase());
  }, []);

  const redeem = async () => {
    if (!code.trim()) return;
    setStatus('submitting');
    setMsg('');
    try {
      const res = await api.redeemResearchCode(code.trim().toUpperCase());
      setStatus('success');
      setMsg(`Activated until ${new Date(res.expires).toLocaleDateString()}`);
      await refreshUser();
      setTimeout(() => { window.location.href = '/'; }, 2500);
    } catch (e) {
      setStatus('error');
      const m = e.message;
      if (m === 'invalid_code') setMsg('This code is not valid. Please double-check.');
      else if (m === 'already_redeemed') setMsg('This code has already been used.');
      else setMsg(m || 'Something went wrong. Please try again.');
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg, #F9F7F3)', padding: 24,
      }}>
        <div style={{
          maxWidth: 480, background: '#fff', padding: 40, borderRadius: 12,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Activate your 6 months free</h1>
          {code && (
            <div style={{
              background: '#f5f3ee', border: '2px dashed var(--accent)', padding: 14,
              borderRadius: 8, fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
              letterSpacing: 2, margin: '16px 0',
            }}>
              {code}
            </div>
          )}
          <p style={{ color: 'var(--text3)', marginBottom: 24 }}>
            Please log in or create an account to activate your free access. Your code will be applied after sign-in.
          </p>
          <a href={`/?signup=1&redeem=${encodeURIComponent(code)}`} className="btn btn-primary" style={{ width: '100%', padding: 12 }}>
            Sign up & activate →
          </a>
          <div style={{ marginTop: 12 }}>
            <a href={`/?login=1&redeem=${encodeURIComponent(code)}`} style={{ fontSize: 13, color: 'var(--text3)' }}>
              Already have an account? Log in
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg, #F9F7F3)', padding: 24,
    }}>
      <div style={{
        maxWidth: 480, background: '#fff', padding: 40, borderRadius: 12,
        border: '1px solid var(--border)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {status === 'success' ? '✓' : '🎁'}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
          {status === 'success' ? 'You\'re in!' : 'Activate your 6 months free'}
        </h1>

        {status !== 'success' && (
          <>
            <p style={{ color: 'var(--text3)', marginBottom: 20 }}>
              Enter the code we sent to your email to unlock 6 months of full access.
            </p>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              style={{
                width: '100%', padding: 14, fontSize: 18, fontFamily: 'monospace',
                fontWeight: 700, letterSpacing: 2, textAlign: 'center',
                border: '2px solid var(--border)', borderRadius: 8, marginBottom: 12,
              }}
            />
            {msg && status === 'error' && (
              <div style={{
                background: '#FEE2E2', color: '#991B1B', padding: 10,
                borderRadius: 6, fontSize: 13, marginBottom: 12,
              }}>
                {msg}
              </div>
            )}
            <button
              onClick={redeem}
              disabled={status === 'submitting' || !code}
              className="btn btn-primary"
              style={{ width: '100%', padding: 14, fontSize: 15 }}
            >
              {status === 'submitting' ? 'Activating…' : 'Activate my 6 months free →'}
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            <p style={{ color: 'var(--text)', marginBottom: 8, fontSize: 16 }}>
              <strong style={{ color: 'var(--accent-dark)' }}>{msg}</strong>
            </p>
            <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 20 }}>
              Redirecting you to the app…
            </p>
            <a href="/" className="btn btn-primary" style={{ padding: '10px 24px' }}>Go to App4Chef →</a>
          </>
        )}
      </div>
    </div>
  );
}
