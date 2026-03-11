'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import Sidebar from '@/components/layout/Sidebar';
import { Avatar, Badge } from '@/components/ui';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, admin, clearAuth } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, toasts, removeToast } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useIdleTimer();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated || !admin) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation: '_spin 0.7s linear infinite', color: 'var(--blue)' }}>
          <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".2" strokeWidth="2.5"/>
          <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{
          height: 'var(--topbar-h)', background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 20,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={toggleSidebar}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 6, borderRadius: 7 }}
              title="Toggle sidebar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Pending approvals indicator */}
            <Link href="/trips" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 7, borderRadius: 8, display: 'flex', textDecoration: 'none' }}
              title="Pending approvals">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', border: '2px solid var(--surface)' }} />
            </Link>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

            {/* User menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
              <Avatar name={admin.name} size={30} />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{admin.name.split(' ')[0]}</div>
                <div><Badge status={admin.role} /></div>
              </div>
            </div>

            {/* Sign out */}
            <button onClick={() => { clearAuth(); router.replace('/login'); }}
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '6px 11px', cursor: 'pointer', fontSize: 12, color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              <span style={{ display: 'none' }}>Out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="grid-bg" style={{ flex: 1, padding: '28px 28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} className="animate-fade-up admin-card"
            style={{
              padding: '12px 16px', minWidth: 280, maxWidth: 360,
              display: 'flex', alignItems: 'center', gap: 10,
              borderColor: t.type === 'success' ? 'rgba(16,185,129,0.3)' : t.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
            <span style={{ fontSize: 16 }}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <span style={{ fontSize: 13, flex: 1 }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2, flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
