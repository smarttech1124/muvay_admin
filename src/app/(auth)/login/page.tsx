'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { MOCK_ADMINS } from '@/lib/mockData';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    // Demo: accept any MOCK_ADMINS email + password "admin123"
    const admin = MOCK_ADMINS.find(a => a.email === form.email);
    if (admin && form.password === 'admin123') {
      setAuth({ ...admin, lastLogin: new Date().toISOString() }, 'mock_admin_token_' + admin._id);
      addToast(`Welcome back, ${admin.name.split(' ')[0]}!`, 'success');
      router.replace('/overview');
    } else {
      setError('Invalid email or password. (Demo: use any listed email + "admin123")');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-up">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: 'var(--blue)', marginBottom: 16, boxShadow: '0 0 32px rgba(59,130,246,0.4)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="0.5" stroke="white"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Muvay Admin</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sign in to the admin portal</p>
      </div>

      {/* Card */}
      <div className="admin-card" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit}>
          {/* Demo hint */}
          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: 'var(--blue)' }}>
            <strong>Demo accounts:</strong><br />
            elena@muvay.com · marcus@muvay.com · aisha@muvay.com<br />
            <span style={{ color: 'var(--muted)' }}>Password: <strong style={{ color: 'var(--text)' }}>admin123</strong></span>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                type="email" required autoComplete="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@muvay.com"
                className="adm-input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input
                type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="adm-input"
                style={{ paddingLeft: 38, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dim)', padding: 2 }}>
                {showPw
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '9px 12px', marginBottom: 16, fontSize: 12, color: '#f87171' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="adm-btn adm-btn-primary adm-btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? (
              <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: '_spin 0.7s linear infinite' }}><style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style><circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="2.5"/><path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg> Signing in…</>
            ) : <>Sign In to Admin Portal →</>}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--dim)', marginTop: 16 }}>
        Muvay Admin Portal · Authorized personnel only
      </p>
    </div>
  );
}
