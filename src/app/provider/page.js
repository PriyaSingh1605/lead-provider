'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProviderSelectPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/providers')
      .then((r) => r.json())
      .then((d) => { setProviders(d.providers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
          ← Back to home
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: '0.5rem' }}>
          Provider Dashboards
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Select a provider to view their assigned leads in real time.
        </p>

        {loading ? (
          <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem' }}>Loading providers…</div>
        ) : providers.length === 0 ? (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>No providers found. Run the seed script first.</p>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--color-surface-2)', padding: '0.5rem 1rem', borderRadius: 6, display: 'inline-block' }}>
              npm run seed
            </code>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {providers.map((p) => (
              <ProviderCard key={p._id} provider={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider }) {
  const initials = provider.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Link href={`/provider/${provider._id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: 'var(--color-surface)',
          border: `1px solid ${provider.isPriority ? '#a855f7' : 'var(--color-border)'}`,
          borderRadius: 14,
          padding: '1.25rem',
          cursor: 'pointer',
          transition: 'transform 0.18s, box-shadow 0.18s',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {provider.isPriority && (
          <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, background: '#a855f718', color: '#a855f7', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Priority
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Avatar name={provider.name} isPriority={provider.isPriority} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{provider.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{provider.company}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {provider.services?.slice(0, 3).map((s) => (
            <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
              {s}
            </span>
          ))}
          {provider.services?.length > 3 && (
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>+{provider.services.length - 3} more</span>
          )}
        </div>

        <div style={{ marginTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {provider.leadCount || 0} leads received
          </span>
          <span style={{ fontSize: 13, color: 'var(--color-brand-light)', fontWeight: 500 }}>View →</span>
        </div>
      </div>
    </Link>
  );
}

function Avatar({ name, isPriority }) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const bg = isPriority ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #3b82f6, #6366f1)';
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  );
}
