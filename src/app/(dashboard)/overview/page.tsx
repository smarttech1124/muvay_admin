'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatCard, Card, Badge, Avatar, TableSkeleton } from '@/components/ui';
import { RevenueChart, UserGrowthChart, BookingsDonut, TopExperiencesChart } from '@/components/charts';
import { MOCK_STATS, MOCK_BOOKINGS, MOCK_LOGS } from '@/lib/mockData';
import { formatCurrency, formatNumber, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { DashboardStats } from '@/types';

export default function OverviewPage() {
  const { admin } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setStats(MOCK_STATS); setLoading(false); }, 800);
    return () => clearTimeout(t);
  }, []);

  const recentBookings = MOCK_BOOKINGS.slice(0, 5);
  const recentLogs = MOCK_LOGS.slice(0, 6);

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }} className="animate-fade-up">
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>
          ✦ Command Center
        </div>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {admin?.name.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          Here's what's happening across the Muvay platform today.
        </p>
      </div>

      {/* Pending alerts */}
      {!loading && stats && (stats.pendingApprovals > 0 || stats.pendingInfluencers > 0) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }} className="animate-fade-up">
          {stats.pendingApprovals > 0 && (
            <Link href="/trips?status=pending" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 14 }}>⏳</span>
                <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>{stats.pendingApprovals} experiences awaiting approval</span>
              </div>
            </Link>
          )}
          {stats.pendingInfluencers > 0 && (
            <Link href="/influencers?status=pending" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>🌟</span>
                <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>{stats.pendingInfluencers} creator applications pending review</span>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{height:120,borderRadius:14}}/>)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard title="Total Users" value={stats!.totalUsers} change={stats!.userGrowth7d}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
            color="#3b82f6" index={0} />
          <StatCard title="Total Revenue" value={formatCurrency(stats!.totalRevenue)} change={stats!.revenueGrowth7d}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
            color="#10b981" index={1} />
          <StatCard title="Total Bookings" value={stats!.totalBookings} change={stats!.bookingGrowth7d}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>}
            color="#8b5cf6" index={2} />
          <StatCard title="Active Experiences" value={stats!.activeTrips}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/></svg>}
            color="#f59e0b" index={3} />
        </div>
      )}

      {/* Today's stats */}
      {!loading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'New Users Today', value: `+${stats.newUsersToday}`, color: 'var(--blue)' },
            { label: 'Revenue Today', value: formatCurrency(stats.revenueToday), color: 'var(--green)' },
            { label: 'Bookings Today', value: `+${stats.bookingsToday}`, color: 'var(--violet)' },
          ].map((item, i) => (
            <div key={i} className="admin-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.label}</span>
              <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card title="Revenue & Bookings" action={<span style={{ fontSize: 11, color: 'var(--muted)' }}>Last 8 months</span>}>
          {loading ? <div className="shimmer" style={{ height: 220, borderRadius: 8 }} /> : <RevenueChart data={stats!.revenueChart} />}
        </Card>
        <Card title="Booking Status">
          {loading ? <div className="shimmer" style={{ height: 140, borderRadius: 8 }} /> : <BookingsDonut data={stats!.bookingsByStatus} />}
        </Card>
      </div>

      {/* Second charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card title="Daily New Users (30d)" action={<span style={{ fontSize: 11, color: 'var(--muted)' }}>Registrations</span>}>
          {loading ? <div className="shimmer" style={{ height: 160, borderRadius: 8 }} /> : <UserGrowthChart data={stats!.userGrowthChart} />}
        </Card>
        <Card title="Top Experiences by Bookings">
          {loading ? <div className="shimmer" style={{ height: 200, borderRadius: 8 }} /> : <TopExperiencesChart data={stats!.topExperiences} />}
        </Card>
      </div>

      {/* Bottom tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Bookings */}
        <Card title="Recent Bookings" noPad action={<Link href="/bookings" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>View all →</Link>}>
          <table className="admin-table">
            <thead><tr>
              <th>Reference</th><th>Guest</th><th>Amount</th><th>Status</th>
            </tr></thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b._id}>
                  <td><span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 12, color: 'var(--blue)' }}>{b.reference}</span></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar name={b.userId.name} size={26} /><span style={{ fontSize: 12 }}>{b.userId.name}</span></div></td>
                  <td><span style={{ fontSize: 12, fontWeight: 600 }}>${b.totalAmount.toLocaleString()}</span></td>
                  <td><Badge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Activity Log */}
        <Card title="Activity Log" noPad action={<Link href="/logs" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>View all →</Link>}>
          <div style={{ padding: '4px 0' }}>
            {recentLogs.map(log => (
              <div key={log._id} style={{ display: 'flex', gap: 10, padding: '10px 20px', borderBottom: '1px solid rgba(30,45,71,0.6)' }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                  background: log.severity === 'critical' ? 'var(--red)' : log.severity === 'warning' ? 'var(--amber)' : 'var(--green)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{log.action.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                    {log.adminId.name} · {log.resource} · {timeAgo(log.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
