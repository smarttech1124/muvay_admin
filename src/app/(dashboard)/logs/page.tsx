'use client';
import { useState, useMemo, useEffect } from 'react';
import { SectionHeader, SearchInput, Badge, Avatar, Pagination, TableSkeleton, EmptyState } from '@/components/ui';
import { MOCK_LOGS } from '@/lib/mockData';
import { formatDateTime, timeAgo, paginate } from '@/lib/utils';
import type { ActivityLog } from '@/types';

const LIMIT = 15;

const SEVERITY_COLORS = { info: '#10b981', warning: '#f59e0b', critical: '#ef4444' };
const SEVERITY_BG = { info: 'rgba(16,185,129,0.1)', warning: 'rgba(245,158,11,0.1)', critical: 'rgba(239,68,68,0.1)' };

const ACTION_ICONS: Record<string, string> = {
  USER_SUSPENDED: '🚫', USER_DELETED: '🗑️', USER_ACTIVATED: '✅',
  TRIP_APPROVED: '✅', TRIP_REJECTED: '✕', BOOKING_CANCELLED: '📋',
  INFLUENCER_APPROVED: '🌟', ADMIN_CREATED: '👤', SETTINGS_UPDATED: '⚙️',
  REFUND_PROCESSED: '↩', TRIP_FEATURED: '⭐',
};

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setLogs(MOCK_LOGS); setLoading(false); }, 500);
    return () => clearTimeout(t);
  }, []);

  const resources = useMemo(() => [...new Set(logs.map(l => l.resource))], [logs]);

  const filtered = useMemo(() => logs.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      if (!l.action.toLowerCase().includes(q) && !l.adminId.name.toLowerCase().includes(q) && !l.resource.toLowerCase().includes(q)) return false;
    }
    if (severityFilter && l.severity !== severityFilter) return false;
    if (resourceFilter && l.resource !== resourceFilter) return false;
    return true;
  }), [logs, search, severityFilter, resourceFilter]);

  const { data: pageData, total, pages } = useMemo(() => paginate(filtered, page, LIMIT), [filtered, page]);

  const counts = useMemo(() => ({
    info: logs.filter(l => l.severity === 'info').length,
    warning: logs.filter(l => l.severity === 'warning').length,
    critical: logs.filter(l => l.severity === 'critical').length,
  }), [logs]);

  return (
    <div style={{ maxWidth: 1300 }}>
      <SectionHeader
        title="Activity Logs"
        subtitle="Complete audit trail of all admin actions on the platform"
      />

      {/* Severity summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {(['info','warning','critical'] as const).map(sev => (
          <button key={sev} onClick={() => setSeverityFilter(severityFilter === sev ? '' : sev)}
            className="admin-card admin-card-hover"
            style={{ padding: '14px 18px', textAlign: 'left', cursor: 'pointer', borderColor: severityFilter === sev ? SEVERITY_COLORS[sev] + '40' : undefined, background: severityFilter === sev ? SEVERITY_BG[sev] : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{sev} events</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 700, color: SEVERITY_COLORS[sev] }}>{counts[sev]}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: SEVERITY_BG[sev], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sev === 'info' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SEVERITY_COLORS[sev]} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
                {sev === 'warning' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SEVERITY_COLORS[sev]} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                {sev === 'critical' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SEVERITY_COLORS[sev]} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by action, admin, or resource…" />
        <select className="adm-input adm-select" style={{ width: 140, height: 36, fontSize: 13 }} value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}>
          <option value="">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <select className="adm-input adm-select" style={{ width: 140, height: 36, fontSize: 13 }} value={resourceFilter} onChange={e => { setResourceFilter(e.target.value); setPage(1); }}>
          <option value="">All Resources</option>
          {resources.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        {(search || severityFilter || resourceFilter) && (
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setSearch(''); setSeverityFilter(''); setResourceFilter(''); setPage(1); }}>Clear</button>
        )}
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? <TableSkeleton rows={12} /> : pageData.length === 0 ? <EmptyState title="No log entries found" /> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr>
                  <th>Severity</th><th>Action</th><th>Admin</th><th>Resource</th><th>Details</th><th>IP Address</th><th>Time</th>
                </tr></thead>
                <tbody>
                  {pageData.map(log => (
                    <tr key={log._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLORS[log.severity], flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: SEVERITY_COLORS[log.severity], fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {log.severity}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{ACTION_ICONS[log.action] || '📝'}</span>
                          <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, fontWeight: 500, color: 'var(--text)' }}>{log.action}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar name={log.adminId.name} size={24} />
                          <span style={{ fontSize: 12 }}>{log.adminId.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, background: 'rgba(59,130,246,0.1)', color: 'var(--blue)', padding: '2px 8px', borderRadius: 5, fontWeight: 600 }}>
                          {log.resource}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{log.details || '—'}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, color: 'var(--dim)' }}>{log.ipAddress || '—'}</span>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{timeAgo(log.createdAt)}</div>
                          <div style={{ fontSize: 10, color: 'var(--dim)' }}>{formatDateTime(log.createdAt).split(',')[1]?.trim()}</div>
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
    </div>
  );
}
