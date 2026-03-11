'use client';
import { useState, useMemo, useEffect } from 'react';
import { SectionHeader, SearchInput, Badge, Button, Pagination, TableSkeleton, EmptyState, Modal, Input, Textarea, ConfirmDialog } from '@/components/ui';
import { MOCK_TRIPS } from '@/lib/mockData';
import { formatDate, formatCurrency, paginate, truncate } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/permissions';
import type { AdminTrip, TripStatus } from '@/types';

const LIMIT = 10;

export default function TripsPage() {
  const { admin } = useAuthStore();
  const { addToast } = useUIStore();
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rejectModal, setRejectModal] = useState<AdminTrip | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteTrip, setDeleteTrip] = useState<AdminTrip | null>(null);
  const [viewTrip, setViewTrip] = useState<AdminTrip | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setTrips(MOCK_TRIPS); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => trips.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  }), [trips, search, statusFilter]);

  const { data: pageData, total, pages } = useMemo(() => paginate(filtered, page, LIMIT), [filtered, page]);

  const approve = (trip: AdminTrip) => {
    setTrips(ts => ts.map(t => t._id === trip._id ? { ...t, status: 'active' as TripStatus } : t));
    addToast(`"${trip.title}" approved and live.`, 'success');
  };

  const reject = () => {
    if (!rejectModal) return;
    setTrips(ts => ts.map(t => t._id === rejectModal._id ? { ...t, status: 'rejected' as TripStatus } : t));
    addToast(`"${rejectModal.title}" rejected.`, 'warning');
    setRejectModal(null); setRejectReason('');
  };

  const toggleFeatured = (trip: AdminTrip) => {
    setTrips(ts => ts.map(t => t._id === trip._id ? { ...t, featured: !t.featured } : t));
    addToast(`${trip.featured ? 'Removed from' : 'Added to'} featured.`, 'success');
  };

  const handleDelete = () => {
    if (!deleteTrip) return;
    setTrips(ts => ts.filter(t => t._id !== deleteTrip._id));
    addToast('Experience deleted.', 'error');
    setDeleteTrip(null);
  };

  const canApprove = admin ? can(admin.role, 'trips', 'approve') : false;
  const canDelete  = admin ? can(admin.role, 'trips', 'delete') : false;

  const statusCounts = useMemo(() => ({
    all: trips.length,
    active: trips.filter(t => t.status === 'active').length,
    pending: trips.filter(t => t.status === 'pending').length,
    inactive: trips.filter(t => t.status === 'inactive').length,
    rejected: trips.filter(t => t.status === 'rejected').length,
  }), [trips]);

  return (
    <div style={{ maxWidth: 1400 }}>
      <SectionHeader title="Experiences" subtitle="Manage all trips and multi-day experiences on Muvay" />

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {[['','All',statusCounts.all],['active','Active',statusCounts.active],['pending','Pending',statusCounts.pending],['inactive','Inactive',statusCounts.inactive],['rejected','Rejected',statusCounts.rejected]].map(([val, label, count]) => (
          <button key={val as string} onClick={() => { setStatusFilter(val as string); setPage(1); }}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${statusFilter === val ? 'var(--blue)' : 'transparent'}`, color: statusFilter === val ? 'var(--blue)' : 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', marginBottom: -1, transition: 'all 0.2s ease' }}>
            {label}
            <span style={{ background: statusFilter === val ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)', borderRadius: 50, padding: '1px 7px', fontSize: 11 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by title or location…" />
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? <TableSkeleton rows={8} /> : pageData.length === 0 ? <EmptyState title="No experiences found" /> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr>
                  <th>Experience</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr></thead>
                <tbody>
                  {pageData.map(trip => (
                    <tr key={trip._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={trip.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{truncate(trip.title, 28)}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>📍 {trip.location} · {trip.duration}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{trip.category}</span></td>
                      <td><span style={{ fontSize: 13, fontWeight: 600 }}>${trip.price.toLocaleString()}</span></td>
                      <td><span style={{ fontSize: 13 }}>{(trip.bookingCount ?? 0).toLocaleString()}</span></td>
                      <td><span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{formatCurrency(trip.revenue ?? 0)}</span></td>
                      <td>
                        <span style={{ fontSize: 12 }}>
                          <span style={{ color: 'var(--amber)' }}>★</span> {trip.rating} ({trip.reviewCount})
                        </span>
                      </td>
                      <td><Badge status={trip.status} /></td>
                      <td>
                        <button onClick={() => toggleFeatured(trip)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: trip.featured ? 1 : 0.25 }}
                          title={trip.featured ? 'Remove from featured' : 'Add to featured'}>
                          ⭐
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" onClick={() => setViewTrip(trip)} title="View">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          {canApprove && trip.status === 'pending' && (
                            <>
                              <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" style={{ color: 'var(--green)' }} onClick={() => approve(trip)} title="Approve">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              </button>
                              <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" style={{ color: 'var(--red)' }} onClick={() => setRejectModal(trip)} title="Reject">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            </>
                          )}
                          {canApprove && trip.status === 'active' && (
                            <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" style={{ color: 'var(--amber)' }} onClick={() => { setTrips(ts => ts.map(t => t._id === trip._id ? { ...t, status: 'inactive' as TripStatus } : t)); addToast('Experience deactivated.', 'warning'); }} title="Deactivate">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            </button>
                          )}
                          {canDelete && (
                            <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" style={{ color: 'var(--red)' }} onClick={() => setDeleteTrip(trip)} title="Delete">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
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

      {/* View Trip Modal */}
      <Modal open={!!viewTrip} onClose={() => setViewTrip(null)} title="Experience Details" width={600}>
        {viewTrip && (
          <div>
            <img src={viewTrip.image} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{viewTrip.title}</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <Badge status={viewTrip.status} />
              {viewTrip.featured && <span style={{ fontSize: 11, color: 'var(--amber)' }}>⭐ Featured</span>}
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>📍 {viewTrip.location}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>⏱ {viewTrip.duration}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>{viewTrip.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[['Price', `$${viewTrip.price.toLocaleString()}`],['Rating', `★ ${viewTrip.rating}`],['Bookings', (viewTrip.bookingCount ?? 0).toLocaleString()],['Revenue', formatCurrency(viewTrip.revenue ?? 0)],['Slots', viewTrip.slots],['Category', viewTrip.category]].map(([k,v]) => (
                <div key={k as string} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Experience">
        {rejectModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Rejecting <strong style={{ color: 'var(--text)' }}>"{rejectModal.title}"</strong>. The host will be notified.</p>
            <Input label="Reason for rejection" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Missing safety information, low quality photos…" />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={reject}>Reject Experience</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTrip} onClose={() => setDeleteTrip(null)} onConfirm={handleDelete} variant="danger"
        title="Delete Experience" message={`Permanently delete "${deleteTrip?.title}"? This cannot be undone.`} />
    </div>
  );
}
