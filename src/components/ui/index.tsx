'use client';
import React, { useEffect } from 'react';
import { cn, getInitials } from '@/lib/utils';

// ── Button ──────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'danger'|'success'|'ghost'|'outline'|'amber';
  size?: 'sm'|'md'|'lg'|'icon';
  loading?: boolean;
}
export function Button({ variant='primary', size='md', loading, children, className, ...props }: BtnProps) {
  return (
    <button className={cn('adm-btn',`adm-btn-${variant}`,size==='sm'?'adm-btn-sm':size==='lg'?'adm-btn-lg':size==='icon'?'adm-btn-icon':'',className)} disabled={loading||props.disabled} {...props}>
      {loading?<Spinner size={13}/>:null}{children}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; icon?: React.ReactNode; }
export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label&&<label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">{label}</label>}
      <div className="relative">
        {icon&&<span className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--dim)'}}>{icon}</span>}
        <input className={cn('adm-input',icon&&'pl-9',error&&'border-[var(--red)]',className)} {...props}/>
      </div>
      {error&&<span className="text-xs" style={{color:'var(--red)'}}>{error}</span>}
    </div>
  );
}

// ── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; }
export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label&&<label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">{label}</label>}
      <textarea className={cn('adm-input resize-none',className)} {...props}/>
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; options: {value:string;label:string}[]; }
export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label&&<label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">{label}</label>}
      <select className={cn('adm-input adm-select',className)} {...props}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ status, className }: { status: string; className?: string }) {
  const map: Record<string,string> = {
    active:'badge-active',inactive:'badge-inactive',pending:'badge-pending',suspended:'badge-suspended',
    confirmed:'badge-confirmed',completed:'badge-completed',cancelled:'badge-cancelled',refunded:'badge-refunded',
    approved:'badge-approved',rejected:'badge-rejected',success:'badge-success',failed:'badge-failed',
    upcoming:'badge-confirmed',featured:'badge-gold',
    super_admin:'badge-role-super_admin',operations_admin:'badge-role-operations_admin',
    finance_admin:'badge-role-finance_admin',support_admin:'badge-role-support_admin',
  };
  return (
    <span className={cn('adm-badge',map[status?.toLowerCase()]||'badge-inactive',className)}>
      <span style={{width:5,height:5,borderRadius:'50%',background:'currentColor',display:'inline-block',flexShrink:0}}/>
      {status?.charAt(0).toUpperCase()+status?.slice(1).replace(/_/g,' ')}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, src, size=32 }: {name:string;src?:string;size?:number}) {
  const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  const color = colors[(name||'?').charCodeAt(0) % colors.length];
  if (src) return <img src={src} alt={name} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>;
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.36,fontWeight:700,color:'white',flexShrink:0,fontFamily:'IBM Plex Sans,sans-serif'}}>
      {getInitials(name||'?')}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size=18 }: {size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{animation:'_spin 0.7s linear infinite',flexShrink:0}}>
      <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".2" strokeWidth="2.5"/>
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width=520 }: {open:boolean;onClose:()=>void;title?:string;children:React.ReactNode;width?:number}) {
  useEffect(()=>{
    const esc=(e:KeyboardEvent)=>e.key==='Escape'&&onClose();
    document.addEventListener('keydown',esc);
    return ()=>document.removeEventListener('keydown',esc);
  },[onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="admin-card animate-fade-up" style={{width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto'}}>
        {title&&(
          <div className="flex items-center justify-between p-5" style={{borderBottom:'1px solid var(--border)'}}>
            <h2 style={{fontSize:15,fontWeight:600,fontFamily:'Syne,sans-serif'}}>{title}</h2>
            <button onClick={onClose} className="adm-btn adm-btn-icon adm-btn-ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, title, message, onConfirm, onClose, variant='danger' }: {open:boolean;title:string;message:string;onConfirm:()=>void;onClose:()=>void;variant?:'danger'|'warning'}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="admin-card animate-fade-up" style={{maxWidth:420,width:'100%',padding:24}}>
        <div className="flex items-center gap-3 mb-4">
          <div style={{width:40,height:40,borderRadius:'50%',background:variant==='danger'?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={variant==='danger'?'#ef4444':'#f59e0b'} strokeWidth="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          </div>
          <div style={{fontWeight:600,fontSize:14}}>{title}</div>
        </div>
        <p style={{color:'var(--muted)',fontSize:13,lineHeight:1.6,marginBottom:20}}>{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant={variant==='danger'?'danger':'amber'} size="sm" onClick={()=>{onConfirm();onClose();}}>
            {variant==='danger'?'Delete':'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ title, description, action }: {title:string;description?:string;action?:React.ReactNode}) {
  return (
    <div className="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"/></svg>
      <div style={{fontSize:13,fontWeight:600}}>{title}</div>
      {description&&<div style={{fontSize:12}}>{description}</div>}
      {action}
    </div>
  );
}

// ── Table Skeleton ────────────────────────────────────────────────────────────
export function TableSkeleton({ rows=6 }: {rows?:number}) {
  return (
    <div style={{padding:16,display:'flex',flexDirection:'column',gap:12}}>
      {Array.from({length:rows}).map((_,i)=>(
        <div key={i} style={{display:'flex',gap:12,alignItems:'center'}}>
          <div className="shimmer" style={{width:32,height:32,borderRadius:'50%',flexShrink:0}}/>
          <div className="shimmer" style={{height:13,flex:2}}/>
          <div className="shimmer" style={{height:13,flex:1}}/>
          <div className="shimmer" style={{height:13,flex:1}}/>
          <div className="shimmer" style={{height:13,width:80}}/>
        </div>
      ))}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, total, limit, onPage }: {page:number;pages:number;total:number;limit:number;onPage:(p:number)=>void}) {
  const from=(page-1)*limit+1,to=Math.min(page*limit,total);
  const range:(number|'...')[] = [];
  if (pages<=7){for(let i=1;i<=pages;i++)range.push(i);}
  else{
    range.push(1);if(page>3)range.push('...');
    for(let i=Math.max(2,page-1);i<=Math.min(pages-1,page+1);i++)range.push(i);
    if(page<pages-2)range.push('...');range.push(pages);
  }
  if(pages<=1) return null;
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderTop:'1px solid var(--border)'}}>
      <span style={{fontSize:12,color:'var(--muted)'}}>Showing {from}–{to} of {total.toLocaleString()}</span>
      <div style={{display:'flex',gap:4,alignItems:'center'}}>
        <button onClick={()=>onPage(page-1)} disabled={page===1} className="adm-btn adm-btn-icon adm-btn-ghost disabled:opacity-30" style={{fontSize:13}}>‹</button>
        {range.map((r,i)=>r==='...'?
          <span key={i} style={{padding:'0 8px',color:'var(--muted)',fontSize:12}}>…</span>:
          <button key={i} onClick={()=>onPage(r as number)} className={cn('adm-btn adm-btn-icon',r===page?'adm-btn-primary':'adm-btn-ghost')} style={{fontSize:12}}>{r}</button>
        )}
        <button onClick={()=>onPage(page+1)} disabled={page===pages} className="adm-btn adm-btn-icon adm-btn-ghost disabled:opacity-30" style={{fontSize:13}}>›</button>
      </div>
    </div>
  );
}

// ── SearchInput ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder='Search…' }: {value:string;onChange:(v:string)=>void;placeholder?:string}) {
  return (
    <div style={{position:'relative'}}>
      <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--dim)',pointerEvents:'none'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="adm-input" style={{paddingLeft:32,height:36,fontSize:13,minWidth:220}}/>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }: {checked:boolean;onChange:(v:boolean)=>void;label?:string}) {
  return (
    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
      <button type="button" role="switch" aria-checked={checked} onClick={()=>onChange(!checked)}
        style={{width:40,height:22,borderRadius:11,padding:2,background:checked?'var(--blue)':'var(--border)',border:'none',cursor:'pointer',transition:'background 0.2s ease',display:'flex',alignItems:'center'}}>
        <span style={{width:18,height:18,borderRadius:'50%',background:'white',transform:checked?'translateX(18px)':'translateX(0)',transition:'transform 0.2s ease',display:'block'}}/>
      </button>
      {label&&<span style={{fontSize:13}}>{label}</span>}
    </label>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ title, value, change, icon, color, prefix='', suffix='', index=0 }: {title:string;value:string|number;change?:number;icon:React.ReactNode;color:string;prefix?:string;suffix?:string;index?:number}) {
  const up=(change??0)>=0;
  return (
    <div className="admin-card admin-card-hover animate-fade-up" style={{padding:20,animationDelay:`${index*0.08}s`,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-15,right:-15,width:90,height:90,borderRadius:'50%',background:`${color}12`,pointerEvents:'none'}}/>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--muted)'}}>{title}</div>
        <div style={{width:36,height:36,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',color,flexShrink:0}}>{icon}</div>
      </div>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:30,fontWeight:700,lineHeight:1,marginBottom:8}}>
        {prefix}{typeof value==='number'?value.toLocaleString():value}{suffix}
      </div>
      {change!==undefined&&(
        <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:up?'#34d399':'#f87171'}}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={up?'M18 15l-6-6-6 6':'M6 9l6 6 6-6'}/></svg>
          {Math.abs(change)}% vs last week
        </div>
      )}
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: {title:string;subtitle?:string;action?:React.ReactNode}) {
  return (
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,marginBottom:24}}>
      <div>
        <h1 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700}}>{title}</h1>
        {subtitle&&<p style={{color:'var(--muted)',fontSize:13,marginTop:4}}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
export function Card({ children, className, title, action, noPad }: {children:React.ReactNode;className?:string;title?:string;action?:React.ReactNode;noPad?:boolean}) {
  return (
    <div className={cn('admin-card',className)}>
      {title&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderBottom:'1px solid var(--border)'}}><span style={{fontWeight:600,fontSize:13}}>{title}</span>{action}</div>}
      <div style={noPad?{}:{padding:20}}>{children}</div>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <div style={{height:1,background:'var(--border)',margin:'16px 0'}}/>;
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,margin:'20px 0'}}>
      <div style={{flex:1,height:1,background:'var(--border)'}}/>
      <span style={{fontSize:11,color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px'}}>{label}</span>
      <div style={{flex:1,height:1,background:'var(--border)'}}/>
    </div>
  );
}
