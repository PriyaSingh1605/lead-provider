'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [leads, setLeads] = useState([]);
  const [providers, setProviders] = useState([]);
  const [tab, setTab] = useState('leads');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then((r) => r.json()),
      fetch('/api/providers').then((r) => r.json()),
    ]).then(([leadsData, provData]) => {
      setLeads(leadsData.leads || []);
      setProviders(provData.providers || []);
      setLoading(false);
    });
  }, []);

  const totalLeadsAssigned = leads.reduce((acc, l) => acc + (l.assignedProviders?.length || 0), 0);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
          ← Back to home
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: '0.5rem' }}>
          Admin Panel
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Monitor the full lead distribution system.</p>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Total Leads" value={leads.length} color="#3b82f6" />
          <StatCard label="Total Providers" value={providers.length} color="#22c55e" />
          <StatCard label="Priority Providers" value={providers.filter(p => p.isPriority).length} color="#a855f7" />
          <StatCard label="Total Assignments" value={totalLeadsAssigned} color="#f97316" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0' }}>
          {['leads', 'providers'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '0.6rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${tab === t ? 'var(--color-brand)' : 'transparent'}`,
                color: tab === t ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: tab === t ? 600 : 400,
                cursor: 'pointer',
                fontSize: 14,
                textTransform: 'capitalize',
                fontFamily: 'var(--font-body)',
                marginBottom: -1,
                transition: 'color 0.15s',
              }}
            >
              {t} ({t === 'leads' ? leads.length : providers.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem' }}>Loading…</div>
        ) : tab === 'leads' ? (
          <LeadsTable leads={leads} />
        ) : (
          <ProvidersTable providers={providers} />
        )}
      </div>
    </div>
  );
}

function LeadsTable({ leads }) {
  if (leads.length === 0) return <Empty msg="No leads yet. Submit an enquiry from the Customer Portal." />;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {['Customer', 'Service', 'Urgency', 'Assigned Providers', 'Status', 'Date'].map((h) => (
              <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={td}>
                <div style={{ fontWeight: 500 }}>{lead.customerName}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{lead.customerEmail}</div>
              </td>
              <td style={td}>{lead.serviceCategory}</td>
              <td style={td}><UrgencyBadge urgency={lead.urgency} /></td>
              <td style={td}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {lead.assignedProviders?.map((p) => (
                    <span key={p._id} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {p.isPriority && <span style={{ color: '#a855f7', fontSize: 10 }}>★</span>}
                      {p.name}
                    </span>
                  ))}
                </div>
              </td>
              <td style={td}><StatusBadge status={lead.status} /></td>
              <td style={{ ...td, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatDate(lead.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProvidersTable({ providers }) {
  if (providers.length === 0) return <Empty msg="No providers found. Run npm run seed." />;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {['Provider', 'Company', 'Services', 'Type', 'Leads Received', 'Dashboard'].map((h) => (
              <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={td}>
                <div style={{ fontWeight: 500 }}>{p.name}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{p.email}</div>
              </td>
              <td style={td}>{p.company || '—'}</td>
              <td style={td}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {p.services?.slice(0, 2).map((s) => (
                    <span key={s} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 20, background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>{s}</span>
                  ))}
                  {p.services?.length > 2 && <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>+{p.services.length - 2}</span>}
                </div>
              </td>
              <td style={td}>
                {p.isPriority
                  ? <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: '#a855f718', color: '#a855f7', fontWeight: 600 }}>Priority</span>
                  : <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>Regular</span>
                }
              </td>
              <td style={{ ...td, fontWeight: 600, color: 'var(--color-text)' }}>{p.leadCount || 0}</td>
              <td style={td}>
                <Link href={`/provider/${p._id}`} style={{ color: 'var(--color-brand-light)', textDecoration: 'none', fontSize: 12 }}>
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const td = { padding: '0.75rem', verticalAlign: 'top' };

function UrgencyBadge({ urgency }) {
  const map = { low: ['#22c55e', '#22c55e18'], medium: ['#3b82f6', '#3b82f618'], high: ['#f97316', '#f9731618'], emergency: ['#ef4444', '#ef444418'] };
  const [color, bg] = map[urgency] || map.medium;
  return <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: bg, color, fontWeight: 600, textTransform: 'capitalize' }}>{urgency}</span>;
}

function StatusBadge({ status }) {
  return <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>;
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1rem 1.25rem' }}>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Empty({ msg }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      {msg}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
