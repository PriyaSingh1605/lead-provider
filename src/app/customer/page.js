'use client';

import { useState } from 'react';
import Link from 'next/link';

const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'HVAC / Air Conditioning',
  'Roofing',
  'Landscaping',
  'Cleaning',
  'Security Systems',
  'Solar Installation',
  'Interior Design',
  'Pest Control',
];

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low — Flexible timing', color: '#22c55e' },
  { value: 'medium', label: 'Medium — Within a week', color: '#3b82f6' },
  { value: 'high', label: 'High — Within 48 hours', color: '#f97316' },
  { value: 'emergency', label: '🚨 Emergency — ASAP', color: '#ef4444' },
];

export default function CustomerPage() {
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    serviceCategory: '',
    description: '',
    urgency: 'medium',
    budget: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setResult(data);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <SuccessScreen result={result} onReset={() => { setStatus('idle'); setResult(null); setForm({ customerName:'',customerEmail:'',customerPhone:'',address:'',serviceCategory:'',description:'',urgency:'medium',budget:'' }); }} />;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ maxWidth: 680, margin: '0 auto', marginBottom: '2rem' }}>
        <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
          ← Back to home
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: '0.5rem' }}>
          Request a Service
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Tell us what you need and we&apos;ll connect you with qualified professionals.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 680, margin: '0 auto' }}>
        <Section title="Your Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Full Name *" name="customerName" value={form.customerName} onChange={handleChange} placeholder="Jane Smith" required />
            <Field label="Email *" name="customerEmail" type="email" value={form.customerEmail} onChange={handleChange} placeholder="jane@example.com" required />
            <Field label="Phone" name="customerPhone" type="tel" value={form.customerPhone} onChange={handleChange} placeholder="+91 98765 43210" />
            <Field label="Address / Area" name="address" value={form.address} onChange={handleChange} placeholder="Varanasi, UP" />
          </div>
        </Section>

        <Section title="Service Details">
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Service Category *</label>
            <select name="serviceCategory" value={form.serviceCategory} onChange={handleChange} required style={inputStyle}>
              <option value="">Select a service…</option>
              {SERVICE_CATEGORIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Describe your requirement *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Please describe the issue or service you need in detail…"
              style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Budget (optional)</label>
            <input name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. ₹5,000 – ₹10,000" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Urgency *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              {URGENCY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.75rem',
                    borderRadius: 10,
                    border: `2px solid ${form.urgency === opt.value ? opt.color : 'var(--color-border)'}`,
                    background: form.urgency === opt.value ? `${opt.color}12` : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontSize: 13,
                    fontWeight: 500,
                    color: form.urgency === opt.value ? opt.color : 'var(--color-text-muted)',
                  }}
                >
                  <input type="radio" name="urgency" value={opt.value} checked={form.urgency === opt.value} onChange={handleChange} style={{ display: 'none' }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </Section>

        {status === 'error' && (
          <div style={{ padding: '0.875rem 1rem', background: '#ef444418', border: '1px solid #ef4444', borderRadius: 10, color: '#ef4444', fontSize: 14, marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: status === 'loading' ? 'var(--color-surface-2)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
            fontFamily: 'var(--font-body)',
          }}
        >
          {status === 'loading' ? 'Submitting…' : 'Submit Enquiry →'}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div style={{ marginBottom: '0.25rem' }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '0.4rem' };
const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.875rem',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 9,
  color: 'var(--color-text)',
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 0.15s',
};

function SuccessScreen({ result, onReset }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', animation: 'fadeUp 0.5s ease-out' }}>
        <div style={{ fontSize: 56, marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: '0.75rem' }}>
          Enquiry Submitted!
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Your lead has been distributed to <strong style={{ color: 'var(--color-brand-light)' }}>{result.assignedCount} provider(s)</strong>. They will contact you shortly.
        </p>
        {result.lead?.assignedProviders?.length > 0 && (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Assigned Providers</p>
            {result.lead.assignedProviders.map((p) => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <Avatar name={p.name} />
                <div>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{p.company || p.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={onReset} style={{ padding: '0.65rem 1.5rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>Submit Another</button>
          <Link href="/" style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: 10, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Go Home</Link>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  );
}
