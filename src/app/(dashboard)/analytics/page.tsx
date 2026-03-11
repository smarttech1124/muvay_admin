'use client';
import { useState, useEffect } from 'react';
import { Card, SectionHeader } from '@/components/ui';
import { RevenueChart, UserGrowthChart, BookingsDonut } from '@/components/charts';
import { MOCK_STATS } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TOOLTIP_STYLE = { background: '#1a2234', border: '1px solid #2d3c57', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#e8f0fe' };

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7d'|'30d'|'90d'|'1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [stats] = useState(MOCK_STATS);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Extended monthly data
  const monthlyData = [
    { month:'Jan 25', revenue:32000, bookings:204, users:380 },
    { month:'Feb 25', revenue:38500, bookings:245, users:420 },
    { month:'Mar 25', revenue:45200, bookings:288, users:510 },
    { month:'Apr 25', revenue:41800, bookings:266, users:465 },
    { month:'May 25', revenue:52400, bookings:334, users:598 },
    { month:'Jun 25', revenue:58900, bookings:376, users:672 },
    { month:'Jul 25', revenue:64200, bookings:410, users:741 },
    { month:'Aug 25', revenue:47300, bookings:302, users:543 },
    { month:'Sep 25', revenue:53800, bookings:344, users:614 },
    { month:'Oct 25', revenue:61500, bookings:393, users:703 },
    { month:'Nov 25', revenue:69200, bookings:442, users:792 },
    { month:'Dec 25', revenue:78400, bookings:501, users:897 },
    ...stats.revenueChart.map(d => ({ month: d.month, revenue: d.revenue, bookings: d.bookings, users: Math.round(d.bookings * 1.4) })),
  ];

  const categoryData = [
    { name: 'Hiking & Nature', bookings: 842, revenue: 485000, color: '#10b981' },
    { name: 'Food & Culture', bookings: 756, revenue: 302400, color: '#f59e0b' },
    { name: 'Wellness', bookings: 624, revenue: 374400, color: '#8b5cf6' },
    { name: 'Adventure', bookings: 512, revenue: 563200, color: '#ef4444' },
    { name: 'Photography', bookings: 398, revenue: 238800, color: '#06b6d4' },
    { name: 'Creative Arts', bookings: 289, revenue: 144500, color: '#3b82f6' },
  ];

  const geoData = [
    { country: 'United Kingdom', bookings: 1243, revenue: 892000 },
    { country: 'Nigeria', bookings: 987, revenue: 455000 },
    { country: 'United States', bookings: 823, revenue: 989000 },
    { country: 'France', bookings: 654, revenue: 523000 },
    { country: 'Japan', bookings: 521, revenue: 677000 },
    { country: 'Italy', bookings: 447, revenue: 536000 },
    { country: 'Thailand', bookings: 398, revenue: 278000 },
    { country: 'Germany', bookings: 312, revenue: 374000 },
  ];

  const RANGE_OPTIONS: ('7d'|'30d'|'90d'|'1y')[] = ['7d','30d','90d','1y'];

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Analytics</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Platform-wide performance insights and trends</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--card)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
          {RANGE_OPTIONS.map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: range === r ? 'var(--blue)' : 'transparent', color: range === r ? 'white' : 'var(--muted)', transition: 'all 0.2s ease' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total GMV', value: '$2.4M', change: '+18.3%', sub: 'Gross merchandise value', color: 'var(--green)' },
          { label: 'Avg. Booking Value', value: '$847', change: '+6.2%', sub: 'Per transaction', color: 'var(--blue)' },
          { label: 'Conversion Rate', value: '3.8%', change: '+0.4pp', sub: 'Visitors to bookings', color: 'var(--violet)' },
          { label: 'NPS Score', value: '74', change: '+3pts', sub: 'Net promoter score', color: 'var(--amber)' },
        ].map((kpi, i) => (
          <div key={i} className="admin-card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 700, color: kpi.color, marginBottom: 2 }}>{kpi.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>{kpi.change}</span>
              <span style={{ fontSize: 11, color: 'var(--dim)' }}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart + Bookings donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card title="Revenue & Bookings Over Time" action={<span style={{ fontSize: 11, color: 'var(--muted)' }}>Monthly</span>}>
          {loading ? <div className="shimmer" style={{ height: 240, borderRadius: 8 }} /> : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.07)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7fa3', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7fa3', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={45} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any, n: any) => [n === 'revenue' ? `$${Number(v).toLocaleString()}` : v, n === 'revenue' ? 'Revenue' : 'Bookings']} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gR)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Booking Distribution">
          {loading ? <div className="shimmer" style={{ height: 220, borderRadius: 8 }} /> : <BookingsDonut data={stats.bookingsByStatus} />}
        </Card>
      </div>

      {/* Category + Geo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Categories */}
        <Card title="Revenue by Category" noPad>
          <div style={{ padding: '4px 0' }}>
            {categoryData.map(c => {
              const maxRev = Math.max(...categoryData.map(d => d.revenue));
              const pct = (c.revenue / maxRev) * 100;
              return (
                <div key={c.name} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(30,45,71,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(c.revenue)}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.bookings.toLocaleString()} bookings</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{ height: '100%', borderRadius: 2, background: c.color, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Geo */}
        <Card title="Top Markets by Bookings" noPad>
          <div style={{ padding: '4px 0' }}>
            {geoData.map((g, i) => (
              <div key={g.country} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: '1px solid rgba(30,45,71,0.5)' }}>
                <div style={{ width: 24, fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--dim)', textAlign: 'right', flexShrink: 0 }}>
                  #{i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{g.country}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{g.bookings.toLocaleString()} bookings</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{formatCurrency(g.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* User growth */}
      <Card title="Daily User Registrations (30 Days)" action={<span style={{ fontSize: 11, color: 'var(--muted)' }}>New signups per day</span>}>
        {loading ? <div className="shimmer" style={{ height: 160, borderRadius: 8 }} /> : <UserGrowthChart data={stats.userGrowthChart} />}
      </Card>
    </div>
  );
}
