'use client';
import { useState, useMemo, useEffect } from 'react';
import { SectionHeader, Badge, Avatar, Button, Modal, Input, Select, ConfirmDialog, TableSkeleton, EmptyState } from '@/components/ui';
import { MOCK_ADMINS } from '@/lib/mockData';
import { ROLE_META, ROLE_PERMISSIONS, AdminRoleId, PermAction } from '@/types';
import { formatDate, timeAgo } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/permissions';
import type { AdminUser } from '@/types';

const RESOURCES = ['users','trips','activities','influencers','bookings','transactions','analytics','admins','logs','settings'];
const ACTIONS: PermAction[] = ['view','create','edit','delete','approve','suspend'];

export default function AdminsPage() {
  const { admin: currentAdmin } = useAuthStore();
  const { addToast } = useUIStore();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<AdminUser | null>(null);
  const [viewPerms, setViewPerms] = useState<AdminRoleId | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'support_admin' as AdminRoleId });

  useEffect(() => {
    const t = setTimeout(() => { setAdmins(MOCK_ADMINS); setLoading(false); }, 500);
    return () => clearTimeout(t);
  }, []);

  const canCreate = currentAdmin?.role === 'super_admin';
  const canDelete = currentAdmin?.role === 'super_admin';

  const handleCreate = () => {
    const newAdmin: AdminUser = {
      _id: `admin_${Date.now()}`, name: form.name, email: form.email,
      role: form.role, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setAdmins(as => [...as, newAdmin]);
    addToast(`${form.name} added as ${ROLE_META[form.role].label}.`, 'success');
    setCreateModal(false);
    setForm({ name: '', email: '', password: '', role: 'support_admin' });
  };

  const handleDelete = () => {
    if (!deleteAdmin) return;
    setAdmins(as => as.filter(a => a._id !== deleteAdmin._id));
    addToast(`${deleteAdmin.name} removed.`, 'error');
    setDeleteAdmin(null);
  };

  const handleToggleActive = (admin: AdminUser) => {
    setAdmins(as => as.map(a => a._id === admin._id ? { ...a, isActive: !a.isActive } : a));
    addToast(`${admin.name} ${admin.isActive ? 'deactivated' : 'reactivated'}.`, 'success');
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      <SectionHeader
        title="Admin Users"
        subtitle="Manage admin accounts and their access levels"
        action={
          canCreate ? (
            <Button onClick={() => setCreateModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Admin
            </Button>
          ) : null
        }
      />

      {/* Role overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {(Object.entries(ROLE_META) as [AdminRoleId, typeof ROLE_META[AdminRoleId]][]).map(([roleId, meta]) => {
          const count = admins.filter(a => a.role === roleId).length;
          return (
            <button key={roleId} onClick={() => setViewPerms(roleId)}
              className="admin-card admin-card-hover" style={{ padding: '14px 16px', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: meta.color, marginTop: 3 }} />
                <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, color: meta.color }}>{count}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{meta.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{meta.description.slice(0, 50)}…</div>
            </button>
          );
        })}
      </div>

      {/* Admin list */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>All Admin Accounts ({admins.length})</span>
        </div>

        {loading ? <TableSkeleton rows={4} /> : admins.length === 0 ? <EmptyState title="No admin accounts" /> : (
          <table className="admin-table">
            <thead><tr>
              <th>Admin</th><th>Role</th><th>Status</th><th>Last Login</th><th>Created</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {admins.map(adm => (
                <tr key={adm._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ position: 'relative' }}>
                        <Avatar name={adm.name} size={36} />
                        {adm.isActive && (
                          <div style={{ position: 'absolute', bottom: 1, right: 1, width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', border: '1.5px solid var(--card)' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {adm.name}
                          {adm._id === currentAdmin?._id && <span style={{ fontSize: 10, color: 'var(--blue)', background: 'rgba(59,130,246,0.12)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>YOU</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{adm.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: ROLE_META[adm.role]?.color }} />
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{ROLE_META[adm.role]?.label}</span>
                    </div>
                  </td>
                  <td><Badge status={adm.isActive ? 'active' : 'inactive'} /></td>
                  <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{adm.lastLogin ? timeAgo(adm.lastLogin) : 'Never'}</span></td>
                  <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(adm.createdAt)}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ fontSize: 11 }} onClick={() => setViewPerms(adm.role)}>
                        Permissions
                      </button>
                      {canCreate && adm._id !== currentAdmin?._id && (
                        <>
                          <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" onClick={() => setEditAdmin(adm)} title="Edit">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" style={{ color: adm.isActive ? 'var(--amber)' : 'var(--green)' }} onClick={() => handleToggleActive(adm)} title={adm.isActive ? 'Deactivate' : 'Activate'}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {adm.isActive ? <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></> : <polyline points="20 6 9 17 4 12"/>}
                            </svg>
                          </button>
                          {canDelete && (
                            <button className="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" style={{ color: 'var(--red)' }} onClick={() => setDeleteAdmin(adm)} title="Delete">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Admin Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Admin Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
          <Input label="Email Address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@muvay.com" />
          <Input label="Temporary Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 8 characters" />
          <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AdminRoleId }))}
            options={Object.entries(ROLE_META).map(([id, m]) => ({ value: id, label: m.label }))} />

          {/* Role description */}
          <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: 'var(--muted)' }}>
            {ROLE_META[form.role]?.description}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button variant="ghost" size="sm" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={!form.name || !form.email || !form.password}>Create Admin</Button>
          </div>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal open={!!viewPerms} onClose={() => setViewPerms(null)} title={`${viewPerms ? ROLE_META[viewPerms]?.label : ''} — Permissions`} width={680}>
        {viewPerms && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>{ROLE_META[viewPerms].description}</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border)' }}>Resource</th>
                    {ACTIONS.map(a => (
                      <th key={a} style={{ textAlign: 'center', padding: '8px 10px', color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border)' }}>{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESOURCES.map(resource => {
                    const perms = ROLE_PERMISSIONS[viewPerms][resource] || [];
                    return (
                      <tr key={resource} style={{ borderBottom: '1px solid rgba(30,45,71,0.5)' }}>
                        <td style={{ padding: '9px 10px', fontWeight: 500, textTransform: 'capitalize' }}>{resource}</td>
                        {ACTIONS.map(action => {
                          const has = perms.includes(action);
                          return (
                            <td key={action} style={{ padding: '9px 10px', textAlign: 'center' }}>
                              {has
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              }
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteAdmin} onClose={() => setDeleteAdmin(null)} onConfirm={handleDelete} variant="danger"
        title="Remove Admin Account"
        message={`Remove ${deleteAdmin?.name}'s admin access? They will immediately lose access to the admin portal.`} />
    </div>
  );
}
