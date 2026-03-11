'use client';
import { use } from 'react';
import Link from 'next/link';
import { Avatar, Badge, Button, Card } from '@/components/ui';
import { MOCK_USERS, MOCK_BOOKINGS } from '@/lib/mockData';
import { formatDate, formatCurrency, timeAgo } from '@/lib/utils';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = MOCK_USERS.find(u => u._id === id) ?? MOCK_USERS[0];
  const userBookings = MOCK_BOOKINGS.filter(b => b.userId._id === user._id).slice(0, 5);

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/users" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>← Back to Users</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Profile card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <Avatar name={user.name} size={72} />
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 700, marginTop: 12 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{user.email}</div>
              <Badge status={user.isActive ? 'active' : 'suspended'} />
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
            {[
              ['Role', user.role === 'influencer' ? '🌟 Creator' : '👤 User'],
              ['Tier', user.memberTier.charAt(0).toUpperCase() + user.memberTier.slice(1)],
              ['Verified', user.isVerified ? '✓ Yes' : '✕ No'],
              ['Phone', user.phone || 'Not set'],
              ['Joined', formatDate(user.createdAt)],
              ['Last Updated', timeAgo(user.updatedAt)],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, borderBottom: '1px solid rgba(30,45,71,0.5)' }}>
                <span style={{ color: 'var(--muted)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total Bookings', value: user.bookingCount ?? 0, color: 'var(--blue)' },
                { label: 'Total Spent', value: formatCurrency(user.totalSpent ?? 0), color: 'var(--green)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(59,130,246,0.05)', borderRadius: 10 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button size="sm" variant="ghost">Send Email</Button>
            <Button size="sm" variant="amber">Suspend Account</Button>
            <Button size="sm" variant="danger">Delete Account</Button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Recent Bookings" noPad>
            {userBookings.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No bookings yet</div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Ref</th><th>Experience</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {userBookings.map(b => (
                    <tr key={b._id}>
                      <td><span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, color: 'var(--blue)' }}>{b.reference}</span></td>
                      <td><span style={{ fontSize: 12 }}>{b.tripId?.title || b.activityId?.title || 'N/A'}</span></td>
                      <td><span style={{ fontSize: 11, color: 'var(--muted)' }}>{b.date}</span></td>
                      <td><span style={{ fontSize: 12, fontWeight: 600 }}>${b.totalAmount.toLocaleString()}</span></td>
                      <td><Badge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card title="Account Activity">
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
              <div>Account created: {formatDate(user.createdAt)}</div>
              <div>Last updated: {formatDate(user.updatedAt)}</div>
              <div>Verification status: {user.isVerified ? '✓ Verified email' : '✕ Unverified'}</div>
              <div>Account status: {user.isActive ? 'Active & in good standing' : 'Currently suspended'}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
