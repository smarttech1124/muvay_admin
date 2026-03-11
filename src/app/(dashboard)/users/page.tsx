'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader, SearchInput, Badge, Avatar, Button, Select, Pagination, TableSkeleton, EmptyState, Modal, Input, ConfirmDialog } from '@/components/ui';
import { MOCK_USERS } from '@/lib/mockData';
import { formatDate, formatCurrency, timeAgo, paginate } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/permissions';
import type { PlatformUser } from '@/types';

const LIMIT = 12;

export default function UsersPage() {
  const { admin } = useAuthStore();
  const { addToast } = useUIStore();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<PlatformUser | null>(null);
  const [suspendUser, setSuspendUser] = useState<PlatformUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<PlatformUser | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setUsers(MOCK_USERS); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (statusFilter && (statusFilter === 'active' ? !u.isActive : u.isActive)) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      if (tierFilter && u.memberTier !== tierFilter) return false;
      return true;
    });
  }, [users, search, statusFilter, roleFilter, tierFilter]);

  const { data: pageData, total, pages } = useMemo(() => paginate(filtered, page, LIMIT), [filtered, page]);

  const handleSuspend = () => {
    if (!suspendUser) return;
    setUsers(us => us.map(u => u._id === suspendUser._id ? { ...u, isActive: false } : u));
    addToast(`${suspendUser.name} suspended.`, 'warning');
    setSuspendUser(null); setSuspendReason('');
  };

  const handleActivate = (user: PlatformUser) => {
    setUsers(us => us.map(u => u._id === user._id ? { ...u, isActive: true } : u));
    addToast(`${user.name} reactivated.`, 'success');
  };

  const handleDelete = () => {
    if (!deleteUser) return;
    setUsers(us => us.filter(u => u._id !== deleteUser._id));
    addToast(`${deleteUser.name} deleted.`, 'error');
    setDeleteUser(null);
  };

  const canEdit    = admin ? can(admin.role, 'users', 'edit') : false;
  const canSuspend = admin ? can(admin.role, 'users', 'suspend') : false;
  const canDelete  = admin ? can(admin.role, 'users', 'delete') : false;

  return (
    <div style={{ maxWidth: 1400 }}>
      <SectionHeader
        title="User Management"
        subtitle={`${total.toLocaleString()} users on the Muvay platform`}
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />{users.filter(u => u.isActive).length} active
              <span style={{ marginLeft: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />{users.filter(u => !u.isActive).length} suspended
            </div>
          </div>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or email…" />
        <select className="adm-input adm-select" style={{ width: 140, height: 36, fontSize: 13 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className="adm-input adm-select" style={{ width: 140, height: 36, fontSize: 13 }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="influencer">Creator</option>
        </select>
        <select className="adm-input adm-select" style={{ width: 140, height: 36, fontSize: 13 }} value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1); }}>
          <option value="">All Tiers</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
          <option value="platinum">Platinum</option>
        </select>
        {(search || statusFilter || roleFilter || tierFilter) && (
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); setRoleFilter(''); setTierFilter(''); setPage(1); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? <TableSkeleton rows={10} /> : (
          <>
            {pageData.length === 0 ? (
              <EmptyState title="No users found" description="Try adjusting your search filters" />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead><tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Member Tier</th>
                    <th>Bookings</th>
                    <th>Total Spent</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {pageData.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={user.name} size={32} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: user.role === 'influencer' ? 'var(--violet)' : 'var(--muted)', fontWeight: 500 }}>
                            {user.role === 'influencer' ? '🌟 Creator' : '👤 User'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 50,
                            background: user.memberTier === 'platinum' ? 'rgba(139,92,246,0.15)' : user.memberTier === 'gold' ? 'rgba(245,158,11,0.15)' : user.memberTier === 'silver' ? 'rgba(148,163,184,0.15)' : 'rgba(107,127,163,0.1)',
                            color: user.memberTier === 'platinum' ? '#a78bfa' : user.memberTier === 'gold' ? '#fbbf24' : user.memberTier === 'silver' ? '#cbd5e1' : 'var(--muted)',
                          }}>
                            {user.memberTier.charAt(0).toUpperCase() + user.memberTier.slice(1)}
                          </span>
                        </td>
                        <td><span style={{ fontSize: 13, fontWeight: 500 }}>{user.bookingCount ?? 0}</span></td>
                        <td><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{formatCurrency(user.totalSpent ?? 0)}</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(user.createdAt)}</span></td>
                        <td><Badge status={user.isActive ? 'active' : 'suspended'} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <Link href={`/users/${user._id}`}>
                              <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" title="View details">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                            </Link>
                            {canEdit && (
                              <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" title="Edit user" onClick={() => setEditUser(user)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                            )}
                            {canSuspend && (
                              user.isActive
                                ? <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" title="Suspend user" style={{ color: 'var(--amber)' }} onClick={() => setSuspendUser(user)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                  </button>
                                : <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" title="Reactivate" style={{ color: 'var(--green)' }} onClick={() => handleActivate(user)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                  </button>
                            )}
                            {canDelete && (
                              <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" title="Delete user" style={{ color: 'var(--red)' }} onClick={() => setDeleteUser(user)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={page} pages={pages} total={total} limit={LIMIT} onPage={setPage} />
          </>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Avatar name={editUser.name} size={48} />
              <div>
                <div style={{ fontWeight: 600 }}>{editUser.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{editUser.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Full Name" defaultValue={editUser.name} />
              <Input label="Email" type="email" defaultValue={editUser.email} />
              <Input label="Phone" defaultValue={editUser.phone || ''} />
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Member Tier</label>
                <select className="adm-input adm-select" defaultValue={editUser.memberTier}>
                  {['bronze','silver','gold','platinum'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button size="sm" onClick={() => { addToast('User updated.', 'success'); setEditUser(null); }}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Suspend Modal */}
      <Modal open={!!suspendUser} onClose={() => setSuspendUser(null)} title="Suspend User">
        {suspendUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              You are about to suspend <strong style={{ color: 'var(--text)' }}>{suspendUser.name}</strong>. They will lose access to the platform immediately.
            </p>
            <Input label="Reason for suspension (optional)" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="e.g. Violation of community guidelines" />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => setSuspendUser(null)}>Cancel</Button>
              <Button variant="amber" size="sm" onClick={handleSuspend}>Suspend User</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDelete} variant="danger"
        title="Delete User Account"
        message={`This will permanently delete ${deleteUser?.name}'s account and all associated data. This action cannot be undone.`}
      />
    </div>
  );
}
