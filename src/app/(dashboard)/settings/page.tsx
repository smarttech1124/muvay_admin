'use client';
import { useState } from 'react';
import { SectionHeader, Button, Input, Toggle, Card } from '@/components/ui';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/permissions';
import type { SystemSettings } from '@/types';

const DEFAULT: SystemSettings = {
  siteName: 'Muvay', siteUrl: 'https://muvay.com', supportEmail: 'support@muvay.com',
  maintenanceMode: false, allowRegistrations: true, maxBookingsPerUser: 10,
  defaultCurrency: 'USD', serviceFeePercent: 5, commissionPercent: 15,
  sessionTimeoutMinutes: 15,
  emailNotifications: { bookingConfirmation: true, newUser: true, newBooking: false, paymentFailed: true },
};

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Syne,sans-serif', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>{title}</div>
    {children}
  </div>
);

export default function SettingsPage() {
  const { admin } = useAuthStore();
  const { addToast } = useUIStore();
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general'|'payments'|'notifications'|'security'>('general');

  const canEdit = admin ? can(admin.role, 'settings', 'edit') : false;

  const set = (key: keyof SystemSettings, value: any) =>
    setSettings(s => ({ ...s, [key]: value }));

  const setEmail = (key: keyof SystemSettings['emailNotifications'], value: boolean) =>
    setSettings(s => ({ ...s, emailNotifications: { ...s.emailNotifications, [key]: value } }));

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    addToast('Settings saved successfully.', 'success');
  };

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'payments', label: 'Payments & Fees' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ] as const;

  return (
    <div style={{ maxWidth: 780 }}>
      <SectionHeader
        title="System Settings"
        subtitle="Configure platform-wide settings and preferences"
        action={
          canEdit ? (
            <Button onClick={save} loading={saving}>
              {!saving && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>}
              Save Settings
            </Button>
          ) : null
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? 'var(--blue)' : 'transparent'}`, color: activeTab === tab.id ? 'var(--blue)' : 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: -1, transition: 'all 0.2s ease' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: '28px 28px' }}>
        {!canEdit && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: 'var(--amber)' }}>
            ⚠️ You have read-only access to settings. Contact a Super Admin to make changes.
          </div>
        )}

        {/* General */}
        {activeTab === 'general' && (
          <div>
            <SECTION title="Platform Identity">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Site Name" value={settings.siteName} onChange={e => set('siteName', e.target.value)} disabled={!canEdit} />
                <Input label="Site URL" value={settings.siteUrl} onChange={e => set('siteUrl', e.target.value)} disabled={!canEdit} />
                <Input label="Support Email" type="email" value={settings.supportEmail} onChange={e => set('supportEmail', e.target.value)} disabled={!canEdit} />
                <Input label="Default Currency" value={settings.defaultCurrency} onChange={e => set('defaultCurrency', e.target.value)} disabled={!canEdit} />
              </div>
            </SECTION>

            <SECTION title="Platform Controls">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Take the platform offline for all users except admins.', danger: true },
                  { key: 'allowRegistrations', label: 'Allow New Registrations', desc: 'Enable or disable new user sign-ups.' },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 16px', background: item.danger && settings.maintenanceMode ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${item.danger && settings.maintenanceMode ? 'rgba(239,68,68,0.2)' : 'var(--border)'}` }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: item.danger && settings.maintenanceMode ? 'var(--red)' : 'var(--text)' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.desc}</div>
                    </div>
                    <Toggle
                      checked={settings[item.key as keyof SystemSettings] as boolean}
                      onChange={v => set(item.key as keyof SystemSettings, v)}
                    />
                  </div>
                ))}
              </div>
            </SECTION>

            <SECTION title="User Limits">
              <div style={{ maxWidth: 300 }}>
                <Input label="Max Bookings Per User" type="number" value={settings.maxBookingsPerUser} onChange={e => set('maxBookingsPerUser', parseInt(e.target.value))} disabled={!canEdit} />
              </div>
            </SECTION>
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div>
            <SECTION title="Fee Structure">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <Input label="Service Fee %" type="number" value={settings.serviceFeePercent} onChange={e => set('serviceFeePercent', parseFloat(e.target.value))} disabled={!canEdit} />
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Charged to customers on each booking.</p>
                </div>
                <div>
                  <Input label="Host Commission %" type="number" value={settings.commissionPercent} onChange={e => set('commissionPercent', parseFloat(e.target.value))} disabled={!canEdit} />
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Muvay's take from each host payout.</p>
                </div>
              </div>

              {/* Fee preview */}
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Fee Preview: $1,000 Booking</div>
                {[
                  ['Customer pays', `$${(1000 * (1 + settings.serviceFeePercent / 100)).toFixed(0)}`],
                  ['Service fee (Muvay)', `$${(1000 * settings.serviceFeePercent / 100).toFixed(0)}`],
                  ['Gross to host', '$1,000'],
                  ['Commission (Muvay)', `-$${(1000 * settings.commissionPercent / 100).toFixed(0)}`],
                  ['Net to host', `$${(1000 * (1 - settings.commissionPercent / 100)).toFixed(0)}`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span style={{ color: 'var(--muted)' }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </SECTION>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div>
            <SECTION title="Email Notifications">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'bookingConfirmation', label: 'Booking Confirmations', desc: 'Send confirmation emails to guests on booking.' },
                  { key: 'newUser', label: 'New User Welcome', desc: 'Send welcome email to new registrations.' },
                  { key: 'newBooking', label: 'New Booking Alert to Host', desc: 'Alert hosts when they receive a new booking.' },
                  { key: 'paymentFailed', label: 'Payment Failed Alerts', desc: 'Notify users when a payment fails to process.' },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.desc}</div>
                    </div>
                    <Toggle
                      checked={settings.emailNotifications[item.key as keyof SystemSettings['emailNotifications']]}
                      onChange={v => setEmail(item.key as keyof SystemSettings['emailNotifications'], v)}
                    />
                  </div>
                ))}
              </div>
            </SECTION>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div>
            <SECTION title="Session Management">
              <div style={{ maxWidth: 320 }}>
                <Input label="Admin Session Timeout (minutes)" type="number"
                  value={settings.sessionTimeoutMinutes}
                  onChange={e => set('sessionTimeoutMinutes', parseInt(e.target.value))}
                  disabled={!canEdit} />
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  Admins will be automatically signed out after this period of inactivity.
                </p>
              </div>
            </SECTION>

            <SECTION title="Security Info">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Authentication', 'JWT Bearer tokens with HttpOnly cookies'],
                  ['Password Hashing', 'bcrypt with salt rounds 12'],
                  ['Rate Limiting', '100 requests/15min per IP (auth endpoints)'],
                  ['CORS', 'Restricted to muvay.com domains'],
                  ['Admin Sessions', `${settings.sessionTimeoutMinutes} min idle timeout`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 9 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>{k}</span>
                    <span style={{ fontSize: 12, fontFamily: 'IBM Plex Mono,monospace', color: 'var(--green)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </SECTION>

            <SECTION title="Danger Zone">
              <div style={{ border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '16px 20px', background: 'rgba(239,68,68,0.04)' }}>
                <div style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 6, fontSize: 13 }}>Reset All Settings</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>This will reset all platform settings to their defaults. This action is irreversible.</div>
                <Button variant="danger" size="sm" disabled={!canEdit} onClick={() => { setSettings(DEFAULT); addToast('Settings reset to defaults.', 'warning'); }}>
                  Reset to Defaults
                </Button>
              </div>
            </SECTION>
          </div>
        )}

        {canEdit && (
          <div style={{ paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={save} loading={saving} size="lg">
              {!saving && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>}
              Save All Settings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
