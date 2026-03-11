'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Avatar, Badge } from '@/components/ui';
import { can } from '@/lib/permissions';
import { cn } from '@/lib/utils';

const NAV = [
  { group: 'Platform',
    items: [
      { href:'/overview',      icon: <IconGrid/>,    label: 'Overview',     resource: 'analytics' },
      { href:'/analytics',     icon: <IconChart/>,   label: 'Analytics',    resource: 'analytics' },
    ]
  },
  { group: 'Management',
    items: [
      { href:'/users',         icon: <IconUsers/>,   label: 'Users',        resource: 'users' },
      { href:'/trips',         icon: <IconMap/>,     label: 'Experiences',  resource: 'trips' },
      { href:'/activities',    icon: <IconStar/>,    label: 'Activities',   resource: 'activities' },
      { href:'/influencers',   icon: <IconCreator/>, label: 'Creators',     resource: 'influencers' },
    ]
  },
  { group: 'Operations',
    items: [
      { href:'/bookings',      icon: <IconBook/>,    label: 'Bookings',     resource: 'bookings' },
      { href:'/transactions',  icon: <IconTxn/>,     label: 'Transactions', resource: 'transactions' },
    ]
  },
  { group: 'System',
    items: [
      { href:'/admins',        icon: <IconShield/>,  label: 'Admin Users',  resource: 'admins' },
      { href:'/logs',          icon: <IconLog/>,     label: 'Activity Logs',resource: 'logs' },
      { href:'/settings',      icon: <IconGear/>,    label: 'Settings',     resource: 'settings' },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { admin, clearAuth } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const hasAccess = (resource: string) => admin ? can(admin.role, resource, 'view') : false;

  return (
    <aside style={{
      width: sidebarCollapsed ? 60 : 'var(--sidebar-w)',
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 30,
      transition: 'width 0.3s ease',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{padding:'20px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:32,height:32,borderRadius:9,background:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        {!sidebarCollapsed && (
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,letterSpacing:'-0.3px'}}>Muvay</div>
            <div style={{fontSize:10,color:'var(--muted)',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase'}}>Admin Portal</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{flex:1,overflowY:'auto',padding:'10px 8px'}}>
        {NAV.map(group => (
          <div key={group.group} style={{marginBottom:6}}>
            {!sidebarCollapsed && (
              <div className="nav-group-label">{group.group}</div>
            )}
            {group.items.map(item => {
              if (!hasAccess(item.resource)) return null;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={cn('nav-link', active && 'active')}
                  style={sidebarCollapsed ? {justifyContent:'center',padding:'10px'} : {}}>
                  <span style={{fontSize:16,flexShrink:0,color: active ? 'var(--blue)' : 'var(--muted)'}}>{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User */}
      {admin && !sidebarCollapsed && (
        <div style={{padding:'12px 14px',borderTop:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <Avatar name={admin.name} size={34}/>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{admin.name}</div>
              <Badge status={admin.role} />
            </div>
          </div>
          <button onClick={clearAuth} style={{width:'100%',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.18)',color:'#f87171',borderRadius:8,padding:'6px 10px',cursor:'pointer',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────
function IconGrid()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function IconChart()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
function IconUsers()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>; }
function IconMap()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/></svg>; }
function IconStar()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function IconCreator() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M12 14c-5 0-8 2-8 4v1h16v-1c0-2-3-4-8-4z"/><path d="M17 3l1 1-1 1M19 5l1 1-1 1"/></svg>; }
function IconBook()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>; }
function IconTxn()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function IconShield()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function IconLog()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function IconGear()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
