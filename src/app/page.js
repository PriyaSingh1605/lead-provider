'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'var(--font-display)',
            }}
          >
            P
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
            }}
          >
            Prowider
          </span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>
          Mini Lead Distribution System
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          width: '100%',
          maxWidth: 820,
        }}
      >
        <NavCard
          href="/customer"
          icon="🏠"
          title="Customer Portal"
          description="Submit a service enquiry and get matched with qualified providers instantly."
          color="#3b82f6"
          label="Request a Service"
        />
        <NavCard
          href="/provider"
          icon="⚡"
          title="Provider Dashboard"
          description="View your assigned leads in real time. New leads appear without page refresh."
          color="#22c55e"
          label="View Leads"
        />
        <NavCard
          href="/admin"
          icon="📊"
          title="Admin Panel"
          description="Manage providers, view all leads, and monitor distribution across the platform."
          color="#a855f7"
          label="Manage System"
        />
      </div>

      <p
        style={{
          marginTop: '3rem',
          color: 'var(--color-text-muted)',
          fontSize: 13,
          textAlign: 'center',
        }}
      >
        Built with Next.js · MongoDB · Server-Sent Events
      </p>
    </main>
  );
}

function NavCard({ href, icon, title, description, color, label }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: 'var(--color-surface)',
          border: `1px solid var(--color-border)`,
          borderRadius: 16,
          padding: '1.75rem',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
          height: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 12px 40px ${color}22`;
          e.currentTarget.style.borderColor = color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        <div style={{ fontSize: 32, marginBottom: '1rem' }}>{icon}</div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text)',
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {description}
        </p>
        <span
          style={{
            display: 'inline-block',
            padding: '0.4rem 1rem',
            borderRadius: 8,
            background: `${color}18`,
            color: color,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {label} →
        </span>
      </div>
    </Link>
  );
}
