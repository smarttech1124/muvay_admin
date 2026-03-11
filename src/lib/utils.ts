import { type ClassValue, clsx } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('en-US').format(n);

export const formatDate = (d: string | Date, opts?: Intl.DateTimeFormatOptions) =>
  new Date(d).toLocaleDateString('en-US', opts ?? { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateTime = (d: string | Date) =>
  new Date(d).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

export const timeAgo = (d: string | Date) => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
  return formatDate(d);
};

export const truncate = (s: string, n = 40) => s.length > n ? s.slice(0, n) + '…' : s;

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const debounce = <T extends (...args: any[]) => any>(fn: T, ms = 300) => {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
};

export const getInitials = (name: string) =>
  name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();

export const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    active:'badge-active', inactive:'badge-inactive', pending:'badge-pending',
    suspended:'badge-suspended', confirmed:'badge-confirmed', completed:'badge-completed',
    cancelled:'badge-cancelled', refunded:'badge-refunded', approved:'badge-approved',
    rejected:'badge-rejected', success:'badge-success', failed:'badge-failed',
    upcoming:'badge-confirmed',
  };
  return `adm-badge ${map[status?.toLowerCase()] || 'badge-inactive'}`;
};

export const paginate = <T>(arr: T[], page: number, limit: number) => ({
  data: arr.slice((page - 1) * limit, page * limit),
  total: arr.length,
  pages: Math.ceil(arr.length / limit),
  page, limit,
});
