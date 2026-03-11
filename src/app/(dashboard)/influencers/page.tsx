'use client';
import { useState, useMemo, useEffect } from 'react';
import { SectionHeader, SearchInput, Badge, Avatar, Button, Pagination, TableSkeleton, EmptyState, Modal, Input, ConfirmDialog } from '@/components/ui';
import { MOCK_INFLUENCERS } from '@/lib/mockData';
import { formatDate, timeAgo, paginate } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/permissions';
import type { InfluencerApplication, ApplicationStatus } from '@/types';

const LIMIT = 10;

export default function InfluencersPage() {
  const { admin } = useAuthStore();
  const { addToast } = useUIStore();
  const [apps, setApps] = useState<InfluencerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewApp, setViewApp] = useState<InfluencerApplication | null>(null);
  const [rejectModal, setRejectModal] = useState<InfluencerApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setApps(MOCK_INFLUENCERS); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => apps.filter(a => {
    if (search && !a.fullName.toLowerCase().includes(search.toLowerCase()) && !a.userId.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  }), [apps, search, statusFilter]);

  const { data: pageData, total, pages } = useMemo(() => paginate(filtered, page, LIMIT), [filtered, page]);

  const approve = (app: InfluencerApplication) => {
    setApps(as => as.map(a => a._id === app._id ? { ...a, status: 'approved' as ApplicationStatus } : a));
    addToast(`${app.fullName} approved as a Creator!`, 'success');
  };

  const reject = () => {
    if (!rejectModal) return;
    setApps(as => as.map(a => a._id === rejectModal._id ? { ...a, status: 'rejected' as ApplicationStatus } : a));
    addToast(`${rejectModal.fullName}'s application rejected.`, 'warning');
    setRejectModal(null); setRejectReason('');
  };

  const canApprove = admin ? can(admin.role, 'influencers', 'approve') : false;

  const counts = useMemo(() => ({
    all: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  }), [apps]);

  const PLATFORM_ICONS: Record<string, string> = {
    Instagram: '📸', TikTok: '🎵', YouTube: '🎥', Podcast: '🎙️', Newsletter: '📧',
  };

  return (
    <div style={{ maxWidth: 1300 }}>
      <SectionHeader
        title="Creator Applications"
        subtitle="Review and manage Muvay Creator Program applications"
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            {counts.pending > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 9, padding: '7px 14px', fontSize: 12, color: 'var(--amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⏳ {counts.pending} pending review
              </div>
            )}
          </div>
        }
      />

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {[['','All',counts.all],['pending','Pending',counts.pending],['approved','Approved',counts.approved],['rejected','Rejected',counts.rejected]].map(([val, label, count]) => (
          <button key={val as string} onClick={() => { setStatusFilter(val as string); setPage(1); }}
            style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${statusFilter === val ? 'var(--blue)' : 'transparent'}`, color: statusFilter === val ? 'var(--blue)' : 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', marginBottom: -1 }}>
            {label}
            <span style={{ background: statusFilter === val ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)', borderRadius: 50, padding: '1px 7px', fontSize: 11 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or email…" />
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? <TableSkeleton rows={8} /> : pageData.length === 0 ? <EmptyState title="No applications found" /> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr>
                  <th>Applicant</th><th>Platform</th><th>Followers</th><th>Niche</th><th>Applied</th><th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {pageData.map(app => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={app.fullName} size={34} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{app.fullName}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{app.userId.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 13 }}>
                          {PLATFORM_ICONS[app.platform] || '🌐'} {app.platform}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>{app.followerCount}</span>
                      </td>
                      <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{app.niche}</span></td>
                      <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{timeAgo(app.createdAt)}</span></td>
                      <td><Badge status={app.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" onClick={() => setViewApp(app)} title="View application">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          {canApprove && app.status === 'pending' && (
                            <>
                              <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ color: 'var(--green)', gap: 4, display: 'flex', alignItems: 'center' }} onClick={() => approve(app)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                Approve
                              </button>
                              <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ color: 'var(--red)' }} onClick={() => setRejectModal(app)}>Reject</button>
                            </>
                          )}
                          {app.status === 'approved' && (
                            <a href={app.profileUrl} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm" style={{ fontSize: 11 }}>
                              View Profile ↗
                            </a>
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

      {/* View Application Modal */}
      <Modal open={!!viewApp} onClose={() => setViewApp(null)} title="Creator Application" width={560}>
        {viewApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(59,130,246,0.06)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.15)' }}>
              <Avatar name={viewApp.fullName} size={52} />
              <div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700 }}>{viewApp.fullName}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{viewApp.userId.email}</div>
                <Badge status={viewApp.status} />
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Platform', `${PLATFORM_ICONS[viewApp.platform] || '🌐'} ${viewApp.platform}`],
                ['Followers', viewApp.followerCount],
                ['Niche / Focus', viewApp.niche],
                ['Applied', timeAgo(viewApp.createdAt)],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 9, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Profile URL */}
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Profile / Portfolio URL</div>
              <a href={viewApp.profileUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: 'var(--blue)', wordBreak: 'break-all' }}>
                {viewApp.profileUrl} ↗
              </a>
            </div>

            {/* Bio */}
            {viewApp.bio && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>About</div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{viewApp.bio}</p>
              </div>
            )}

            {/* Actions */}
            {canApprove && viewApp.status === 'pending' && (
              <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <Button variant="success" size="sm" style={{ flex: 1 }} onClick={() => { approve(viewApp); setViewApp(null); }}>
                  ✓ Approve Creator
                </Button>
                <Button variant="danger" size="sm" style={{ flex: 1 }} onClick={() => { setViewApp(null); setRejectModal(viewApp); }}>
                  ✕ Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Application">
        {rejectModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              You're rejecting <strong style={{ color: 'var(--text)' }}>{rejectModal.fullName}</strong>'s Creator application. They'll receive an email notification.
            </p>
            <Input label="Reason (optional, sent to applicant)"
              value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Insufficient follower count for our current requirements…" />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={reject}>Confirm Rejection</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
