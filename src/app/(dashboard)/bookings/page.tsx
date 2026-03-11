'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader, SearchInput, Badge, Avatar, Button, Pagination, TableSkeleton, EmptyState, Modal, ConfirmDialog } from '@/components/ui';
import { MOCK_BOOKINGS } from '@/lib/mockData';
import { formatDate, formatCurrency, timeAgo, paginate } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/permissions';
import type { AdminBooking, BookingStatus } from '@/types';

const LIMIT = 12;

export default function BookingsPage() {
  const { admin } = useAuthStore();
  const { addToast } = useUIStore();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewBooking, setViewBooking] = useState<AdminBooking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<AdminBooking | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setBookings(MOCK_BOOKINGS); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => bookings.filter(b => {
    if (search) {
      const q = search.toLowerCase();
      if (!b.reference.toLowerCase().includes(q) && !b.userId.name.toLowerCase().includes(q) && !b.userId.email.toLowerCase().includes(q)) return false;
    }
    if (statusFilter && b.status !== statusFilter) return false;
    return true;
  }), [bookings, search, statusFilter]);

  const { data: pageData, total, pages } = useMemo(() => paginate(filtered, page, LIMIT), [filtered, page]);

  const handleCancel = () => {
    if (!cancelBooking) return;
    setBookings(bs => bs.map(b => b._id === cancelBooking._id ? { ...b, status: 'cancelled' as BookingStatus } : b));
    addToast(`Booking ${cancelBooking.reference} cancelled.`, 'warning');
    setCancelBooking(null);
  };

  const canEdit   = admin ? can(admin.role, 'bookings', 'edit') : false;

  const statusCounts = useMemo(() => {
    const obj: Record<string, number> = {};
    bookings.forEach(b => { obj[b.status] = (obj[b.status] || 0) + 1; });
    return obj;
  }, [bookings]);

  const totalRevenue = useMemo(() => bookings.filter(b => ['confirmed','completed','upcoming'].includes(b.status)).reduce((s, b) => s + b.totalAmount, 0), [bookings]);

  return (
    <div style={{ maxWidth: 1400 }}>
      <SectionHeader
        title="Bookings"
        subtitle={`${total.toLocaleString()} total bookings · ${formatCurrency(totalRevenue)} in confirmed revenue`}
      />

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { status: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
          { status: 'completed', label: 'Completed', color: '#10b981' },
          { status: 'upcoming', label: 'Upcoming', color: '#06b6d4' },
          { status: 'pending', label: 'Pending', color: '#f59e0b' },
          { status: 'cancelled', label: 'Cancelled', color: '#ef4444' },
        ].map(s => (
          <button key={s.status} onClick={() => { setStatusFilter(statusFilter === s.status ? '' : s.status); setPage(1); }}
            className="admin-card admin-card-hover"
            style={{ padding: '12px 14px', border: statusFilter === s.status ? `1px solid ${s.color}40` : undefined, cursor: 'pointer', background: statusFilter === s.status ? `${s.color}08` : undefined, textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, color: s.color }}>
              {(statusCounts[s.status] || 0).toLocaleString()}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by ref, name or email…" />
        <select className="adm-input adm-select" style={{ width: 160, height: 36, fontSize: 13 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['pending','confirmed','upcoming','completed','cancelled','refunded'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        {(search || statusFilter) && (
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}>Clear</button>
        )}
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? <TableSkeleton rows={10} /> : pageData.length === 0 ? <EmptyState title="No bookings found" /> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr>
                  <th>Reference</th><th>Guest</th><th>Experience</th><th>Date</th><th>Guests</th><th>Amount</th><th>Status</th><th>Booked</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {pageData.map(booking => (
                    <tr key={booking._id}>
                      <td>
                        <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>
                          {booking.reference}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={booking.userId.name} size={28} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500 }}>{booking.userId.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{booking.userId.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {booking.tripId?.image && (
                            <img src={booking.tripId.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500 }}>{booking.tripId?.title || booking.activityId?.title || 'N/A'}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{booking.tripId?.location || booking.activityId?.location || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{booking.date}</span></td>
                      <td><span style={{ fontSize: 12 }}>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span></td>
                      <td>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(booking.totalAmount)}</div>
                          {booking.discountAmount > 0 && <div style={{ fontSize: 11, color: 'var(--green)' }}>-{formatCurrency(booking.discountAmount)} off</div>}
                        </div>
                      </td>
                      <td><Badge status={booking.status} /></td>
                      <td><span style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(booking.createdAt)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" onClick={() => setViewBooking(booking)} title="View details">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          {canEdit && !['cancelled','refunded','completed'].includes(booking.status) && (
                            <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" style={{ color: 'var(--red)' }} onClick={() => setCancelBooking(booking)} title="Cancel booking">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPage={setPage} />
          </>
        )}
      </div>

      {/* Booking Detail Modal */}
      <Modal open={!!viewBooking} onClose={() => setViewBooking(null)} title="Booking Details" width={580}>
        {viewBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 18, fontWeight: 700, color: 'var(--blue)', marginBottom: 4 }}>{viewBooking.reference}</div>
                <Badge status={viewBooking.status} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700 }}>{formatCurrency(viewBooking.totalAmount)}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>incl. {formatCurrency(viewBooking.serviceFee)} service fee</div>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />

            {/* Experience */}
            {viewBooking.tripId && (
              <div style={{ display: 'flex', gap: 12, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                <img src={viewBooking.tripId.image} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{viewBooking.tripId.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>📍 {viewBooking.tripId.location}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>📅 {viewBooking.date} · 👥 {viewBooking.guests} guest{viewBooking.guests > 1 ? 's' : ''}</div>
                </div>
              </div>
            )}

            {/* Guest info */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Guest Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Name', `${viewBooking.guestInfo.firstName} ${viewBooking.guestInfo.lastName}`],
                  ['Email', viewBooking.guestInfo.email],
                  ['Phone', viewBooking.guestInfo.phone],
                  ['Account', viewBooking.userId.name],
                ].map(([k,v]) => (
                  <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '9px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Price Breakdown</div>
              {[
                ['Subtotal', formatCurrency(viewBooking.totalAmount - viewBooking.serviceFee + viewBooking.discountAmount)],
                ...(viewBooking.discountAmount > 0 ? [['Discount', `-${formatCurrency(viewBooking.discountAmount)}`]] : []),
                ['Service Fee', formatCurrency(viewBooking.serviceFee)],
              ].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                  <span style={{ color: 'var(--muted)' }}>{k}</span>
                  <span style={{ color: k === 'Discount' ? 'var(--green)' : 'var(--text)' }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13 }}>
                <span>Total</span><span>{formatCurrency(viewBooking.totalAmount)}</span>
              </div>
            </div>

            {viewBooking.specialRequests && (
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 9, padding: '10px 14px', fontSize: 12 }}>
                <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Special Request: </span>
                <span style={{ color: 'var(--muted)' }}>{viewBooking.specialRequests}</span>
              </div>
            )}

            <div style={{ fontSize: 11, color: 'var(--dim)', textAlign: 'right' }}>
              Booked {timeAgo(viewBooking.createdAt)}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!cancelBooking} onClose={() => setCancelBooking(null)} onConfirm={handleCancel} variant="warning"
        title="Cancel Booking"
        message={`Cancel booking ${cancelBooking?.reference}? The guest will be notified and a refund process will be initiated.`} />
    </div>
  );
}
