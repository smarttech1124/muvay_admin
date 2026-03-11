'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="animate-fade-up">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: 'var(--blue)', marginBottom: 16 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Reset Password</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Enter your admin email to receive a reset link</p>
      </div>

      <div className="admin-card" style={{ padding: 32 }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Check your inbox</div>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              If <strong style={{ color: 'var(--text)' }}>{email}</strong> is registered as an admin, you'll receive a password reset link within a few minutes.
            </p>
            <Link href="/login" style={{ fontSize: 13, color: 'var(--blue)' }}>← Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Admin Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@muvay.com" className="adm-input" />
            </div>
            <button type="submit" disabled={loading} className="adm-btn adm-btn-primary adm-btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link href="/login" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>← Back to sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
