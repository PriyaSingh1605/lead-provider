'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const URGENCY_CONFIG = {
  low:       { label: 'Low',       color: '#22c55e', bg: '#22c55e18' },
  medium:    { label: 'Medium',    color: '#3b82f6', bg: '#3b82f618' },
  high:      { label: 'High',      color: '#f97316', bg: '#f9731618' },
  emergency: { label: '🚨 Emergency', color: '#ef4444', bg: '#ef444418' },
};

export default function ProviderDashboard({ params }) {
  const { id } = params;
  const [provider, setProvider] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [newLeadIds, setNewLeadIds] = useState(new Set());
  const eventSourceRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetch(`/api/providers/${id}/leads`)
      .then((r) => r.json())
      .then((d) => {
        setProvider(d.provider);
        setLeads(d.leads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Connect SSE
  useEffect(() => {
    const es = new EventSource(`/api/sse/${id}`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'NEW_LEAD') {
          const newLead = data.lead;
          setLeads((prev) => [newLead, ...prev]);
          setNewLeadIds((prev) => new Set([...prev, newLead._id]));
          // Remove highlight after 5s
          setTimeout(() => {
            setNewLeadIds((prev) => {
              const next = new Set(prev);
              next.delete(newLead._id);
              return next;
            });
          }, 5000);
        }
      } catch {}
    };

    return () => { es.close(); setConnected(false); };
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)' }}>Loading dashboard…</div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Provider not found.</p>
          <Link href="/provider" style={{ color: 'var(--color-brand-light)' }}>← Back to providers</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link href="/provider" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
              ← All providers
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Avatar name={provider.name} isPriority={provider.isPriority} size={52} />
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {provider.name}
                  {provider.isPriority && (
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#a855f718', color: '#a855f7', padding: '2px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Priority
                    </span>
                  )}
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                  {provider.company} · {provider.email}
                </p>
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 1rem', background: connected ? '#22c55e12' : '#ef444412', border: `1px solid ${connected ? '#22c55e' : '#ef4444'}40`, borderRadius: 24, fontSize: 13, fontWeight: 500, color: connected ? '#22c55e' : '#ef4444' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444', display: 'inline-block', animation: connected ? 'pulseDot 1.5s ease-in-out infinite' : 'none' }} />
            {connected ? 'Live — Real-time updates on' : 'Connecting…'}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Total Leads" value={leads.length} color="#3b82f6" />
          <StatCard label="New" value={leads.filter(l => l.status === 'new').length} color="#22c55e" />
          <StatCard label="In Progress" value={leads.filter(l => l.status === 'in_progress').length} color="#f97316" />
          <StatCard label="Services" value={provider.services?.length || 0} color="#a855f7" />
        </div>

        {/* Services */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {provider.services?.map((s) => (
            <span key={s} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              {s}
            </span>
          ))}
        </div>

        {/* Leads list */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: '1rem' }}>
          Assigned Leads
        </h2>

        {leads.length === 0 ? (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No leads assigned yet. Submit an enquiry through the Customer Portal to see leads appear here in real time.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leads.map((lead) => (
              <LeadCard key={lead._id} lead={lead} isNew={newLeadIds.has(lead._id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LeadCard({ lead, isNew }) {
  const urgency = URGENCY_CONFIG[lead.urgency] || URGENCY_CONFIG.medium;

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${isNew ? 'var(--color-brand)' : 'var(--color-border)'}`,
        borderLeft: `4px solid ${urgency.color}`,
        borderRadius: 12,
        padding: '1.25rem',
        animation: isNew ? 'fadeUp 0.4s ease-out' : 'none',
        transition: 'border-color 0.4s',
        background: isNew ? `linear-gradient(135deg, rgba(59,130,246,0.06), var(--color-surface))` : 'var(--color-surface)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {isNew && (
            <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--color-brand)', color: '#fff', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              New!
            </span>
          )}
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)' }}>{lead.customerName}</span>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>· {lead.serviceCategory}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Badge text={urgency.label} color={urgency.color} bg={urgency.bg} />
          <Badge text={lead.status.replace('_', ' ')} color="#8892a4" bg="var(--color-surface-2)" />
        </div>
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: '0.75rem' }}>
        {lead.description}
      </p>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: 13, color: 'var(--color-text-muted)' }}>
        {lead.address && <span>📍 {lead.address}</span>}
        {lead.budget && <span>💰 {lead.budget}</span>}
        <span>🕐 {formatDate(lead.createdAt)}</span>
      </div>
    </div>
  );
}

function Badge({ text, color, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: bg, color: color, textTransform: 'capitalize' }}>
      {text}
    </span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1rem 1.25rem' }}>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Avatar({ name, isPriority, size = 40 }) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const bg = isPriority ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #3b82f6, #6366f1)';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
