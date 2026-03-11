'use client';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TOOLTIP_STYLE = {
  background: '#1a2234', border: '1px solid #2d3c57', borderRadius: 10,
  padding: '10px 14px', fontSize: 12, color: '#e8f0fe',
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};

// ── Revenue Area Chart ──────────────────────────────────────────────────────
export function RevenueChart({ data }: { data: { month: string; revenue: number; bookings: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.07)" />
        <XAxis dataKey="month" tick={{ fill: '#6b7fa3', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7fa3', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={45} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any, name: any) => [name === 'revenue' ? `$${Number(v).toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Bookings']} />
        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 5, fill: '#3b82f6' }} />
        <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} fill="url(#gradBookings)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── User Growth Line Chart ──────────────────────────────────────────────────
export function UserGrowthChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.07)" />
        <XAxis dataKey="date" tick={{ fill: '#6b7fa3', fontSize: 10 }} axisLine={false} tickLine={false}
          interval={Math.floor(data.length / 5)} />
        <YAxis tick={{ fill: '#6b7fa3', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [v, 'New Users']} />
        <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradUsers)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Bookings Donut Chart ────────────────────────────────────────────────────
export function BookingsDonut({ data }: { data: { status: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={62}
            dataKey="count" startAngle={90} endAngle={-270} strokeWidth={0}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [v, 'Bookings']} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1 }}>
        {data.map(d => (
          <div key={d.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{d.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{d.count.toLocaleString()}</span>
              <span style={{ fontSize: 11, color: 'var(--dim)' }}>{((d.count / total) * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
export function TopExperiencesChart({ data }: { data: { title: string; bookings: number; revenue: number }[] }) {
  const short = data.map(d => ({ ...d, title: d.title.split(' ').slice(0, 2).join(' ') }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={short} margin={{ top: 5, right: 5, bottom: 20, left: 0 }} barSize={16}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.07)" vertical={false} />
        <XAxis dataKey="title" tick={{ fill: '#6b7fa3', fontSize: 10 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" />
        <YAxis tick={{ fill: '#6b7fa3', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [v, 'Bookings']} />
        <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
export function Sparkline({ data, color = '#3b82f6' }: { data: number[]; color?: string }) {
  const pts = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={pts}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
