'use client';
import { useState, useMemo, useEffect } from 'react';
import { SectionHeader, SearchInput, Badge, Avatar, Button, Pagination, TableSkeleton, EmptyState, Modal, ConfirmDialog } from '@/components/ui';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';
import { formatDate, formatCurrency, timeAgo, paginate } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/permissions';
import type { AdminTransaction, PaymentStatus } from '@/types';

const LIMIT = 12;

export default function TransactionsPage() {
  const { admin } = useAuthStore();
  const { addToast } = useUIStore();
  const [txns, setTxns] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);
  const [refundTxn, setRefundTxn] = useState<AdminTransaction | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setTxns(MOCK_TRANSACTIONS); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => txns.filter(t => {
    if (search) {
      const q = search.toLowerCase();
      if (!t.transactionRef.toLowerCase().includes(q) && !t.userId.name.toLowerCase().includes(q) && !t.bookingId.reference.toLowerCase().includes(q)) return false;
    }
    if (statusFilter && t.status !== statusFilter) return false;
    if (methodFilter && t.method !== methodFilter) return false;
    return true;
  }), [txns, search, statusFilter, methodFilter]);

  const { data: pageData, total, pages } = useMemo(() => paginate(filtered, page, LIMIT), [filtered, page]);

  const handleRefund = () => {
    if (!refundTxn) return;
    setTxns(ts => ts.map(t => t._id === refundTxn._id ? { ...t, status: 'refunded' as PaymentStatus } : t));
    addToast(`Refund initiated for ${formatCurrency(refundTxn.amount)}.`, 'success');
    setRefundTxn(null);
  };

  const canRefund = admin ? can(admin.role, 'transactions', 'view') : false;

  const summary = useMemo(() => ({
    totalRevenue: txns.filter(t => t.status === 'success').reduce((s, t) => s + t.amount, 0),
    totalRefunded: txns.filter(t => t.status === 'refunded').reduce((s, t) => s + t.amount, 0),
    successCount: txns.filter(t => t.status === 'success').length,
    failedCount: txns.filter(t => t.status === 'failed').length,
  }), [txns]);

  const METHOD_LABELS: Record<string, string> = {
    card: '💳 Card',
    bank_transfer: '🏦 Bank Transfer',
    paypal: '🅿️ PayPal',
  };

  return (
    <div style={{ maxWidth: 1400 }}>
      <SectionHeader title="Transactions" subtitle="Monitor all payment activity across the platform" />

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), color: 'var(--green)', icon: '💰' },
          { label: 'Successful', value: summary.successCount.toLocaleString(), color: 'var(--green)', icon: '✓' },
          { label: 'Failed', value: summary.failedCount.toLocaleString(), color: 'var(--red)', icon: '✕' },
          { label: 'Total Refunded', value: formatCurrency(summary.totalRefunded), color: 'var(--violet)', icon: '↩' },
        ].map((s, i) => (
          <div key={i} className="admin-card" style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by ref, user, or booking…" />
        <select className="adm-input adm-select" style={{ width: 150, height: 36, fontSize: 13 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="adm-input adm-select" style={{ width: 160, height: 36, fontSize: 13 }} value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setPage(1); }}>
          <option value="">All Methods</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="paypal">PayPal</option>
        </select>
        {(search || statusFilter || methodFilter) && (
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setSearch(''); setStatusFilter(''); setMethodFilter(''); setPage(1); }}>Clear</button>
        )}
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? <TableSkeleton rows={10} /> : pageData.length === 0 ? <EmptyState title="No transactions found" /> : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead><tr>
                  <th>Transaction Ref</th><th>User</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {pageData.map(txn => (
                    <tr key={txn._id}>
                      <td>
                        <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, color: 'var(--muted)' }}>
                          {txn.transactionRef}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={txn.userId.name} size={26} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500 }}>{txn.userId.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{txn.userId.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, color: 'var(--blue)' }}>
                          {txn.bookingId.reference}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 14, fontWeight: 700, color: txn.status === 'refunded' ? 'var(--violet)' : txn.status === 'failed' ? 'var(--red)' : 'var(--green)' }}>
                          {txn.status === 'refunded' && '↩ '}{formatCurrency(txn.amount)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12 }}>{METHOD_LABELS[txn.method] || txn.method}</span>
                      </td>
                      <td><Badge status={txn.status} /></td>
                      <td><span style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(txn.createdAt)}</span></td>
                      <td>
                        {canRefund && txn.status === 'success' && (
                          <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ color: 'var(--violet)', fontSize: 11 }} onClick={() => setRefundTxn(txn)}>
                            ↩ Refund
                          </button>
                        )}
                        {txn.status === 'refunded' && (
                          <span style={{ fontSize: 11, color: 'var(--violet)' }}>Refunded</span>
                        )}
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

      <ConfirmDialog
        open={!!refundTxn} onClose={() => setRefundTxn(null)} onConfirm={handleRefund} variant="warning"
        title="Process Refund"
        message={`Refund ${refundTxn ? formatCurrency(refundTxn.amount) : ''} to ${refundTxn?.userId.name}? This will initiate a refund to their original payment method.`}
      />
    </div>
  );
}
