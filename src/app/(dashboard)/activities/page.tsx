'use client';
import { useState, useMemo, useEffect } from 'react';
import { SectionHeader, SearchInput, Badge, Button, Pagination, TableSkeleton, EmptyState, Modal, ConfirmDialog } from '@/components/ui';
import { MOCK_ACTIVITIES } from '@/lib/mockData';
import { formatCurrency, paginate, truncate } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/permissions';
import type { AdminActivity } from '@/types';

const LIMIT = 10;

export default function ActivitiesPage() {
  const { admin } = useAuthStore();
  const { addToast } = useUIStore();
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewActivity, setViewActivity] = useState<AdminActivity | null>(null);
  const [deleteActivity, setDeleteActivity] = useState<AdminActivity | null>(null);
  const [rejectModal, setRejectModal] = useState<AdminActivity | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setActivities(MOCK_ACTIVITIES); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const categories = useMemo(() => [...new Set(activities.map(a => a.category))], [activities]);

  const filtered = useMemo(() => activities.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (categoryFilter && a.category !== categoryFilter) return false;
    return true;
  }), [activities, search, statusFilter, categoryFilter]);

  const { data: pageData, total, pages } = useMemo(() => paginate(filtered, page, LIMIT), [filtered, page]);

  const approve = (act: AdminActivity) => {
    setActivities(as => as.map(a => a._id === act._id ? { ...a, status: 'active' as any } : a));
    addToast(`"${act.title}" approved.`, 'success');
  };

  const canApprove = admin ? can(admin.role, 'activities', 'approve') : false;
  const canDelete  = admin ? can(admin.role, 'activities', 'delete') : false;

  return (
    <div style={{ maxWidth: 1400 }}>
      <SectionHeader title="Activities" subtitle="Manage single-day activities and experiences" />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search activities…" />
        <select className="adm-input adm-select" style={{ width: 140, height: 36, fontSize: 13 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="adm-input adm-select" style={{ width: 160, height: 36, fontSize: 13 }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? <TableSkeleton rows={8} /> : pageData.length === 0 ? <EmptyState title="No activities found" /> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr>
                  <th>Activity</th><th>Category</th><th>Price</th><th>Rating</th><th>Duration</th><th>Slots</th><th>Host</th><th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {pageData.map(act => (
                    <tr key={act._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={act.image} alt="" style={{ width: 36, height: 36, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{truncate(act.title, 26)}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>📍 {act.location}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{act.category}</span></td>
                      <td><span style={{ fontSize: 13, fontWeight: 600 }}>{act.price === 0 ? <span style={{ color: 'var(--green)' }}>Free</span> : `$${act.price}`}</span></td>
                      <td><span style={{ fontSize: 12 }}><span style={{ color: 'var(--amber)' }}>★</span> {act.rating} ({act.reviewCount})</span></td>
                      <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{act.duration}</span></td>
                      <td><span style={{ fontSize: 12 }}>{act.slots}</span></td>
                      <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{act.createdBy?.name || 'N/A'}</span></td>
                      <td><Badge status={act.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" onClick={() => setViewActivity(act)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          {canApprove && act.status === 'pending' && (
                            <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" style={{ color: 'var(--green)' }} onClick={() => approve(act)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>
                          )}
                          {canDelete && (
                            <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" style={{ color: 'var(--red)' }} onClick={() => setDeleteActivity(act)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
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

      <Modal open={!!viewActivity} onClose={() => setViewActivity(null)} title="Activity Details" width={560}>
        {viewActivity && (
          <div>
            <img src={viewActivity.image} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }} />
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{viewActivity.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 14 }}>{viewActivity.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Location',viewActivity.location],['Category',viewActivity.category],['Price', viewActivity.price === 0 ? 'Free' : `$${viewActivity.price}`],['Duration',viewActivity.duration],['Rating', `★ ${viewActivity.rating} (${viewActivity.reviewCount})`],['Slots',viewActivity.slots]].map(([k,v]) => (
                <div key={k as string} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteActivity} onClose={() => setDeleteActivity(null)}
        onConfirm={() => { setActivities(as => as.filter(a => a._id !== deleteActivity?._id)); addToast('Activity deleted.', 'error'); setDeleteActivity(null); }}
        variant="danger" title="Delete Activity" message={`Permanently delete "${deleteActivity?.title}"?`} />
    </div>
  );
}
