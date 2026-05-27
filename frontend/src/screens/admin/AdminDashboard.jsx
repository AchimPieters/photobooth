import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { config, updateConfig, getSessions } = useApp()
  const [tab, setTab] = useState('stats') // stats | config | sessions
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const pin = sessionStorage.getItem('adminPin') || ''

  useEffect(() => {
    if (!pin) { navigate('/admin'); return }
    setForm({
      eventName:       config.eventName,
      tagline:         config.tagline,
      price:           config.price,
      accentColor:     config.accentColor,
      logoUrl:         config.logoUrl,
      brandText:       config.brandText,
      showEmailCapture: config.showEmailCapture,
      showFilters:     config.showFilters,
      sumupKey:        '',
      adminPin:        '',
    })
  }, [config])

  useEffect(() => {
    if (tab === 'sessions') {
      getSessions(pin).then(setSessions)
    }
  }, [tab])

  async function save() {
    setSaving(true)
    const patch = { ...form }
    if (!patch.sumupKey) delete patch.sumupKey
    if (!patch.adminPin) delete patch.adminPin
    try {
      await updateConfig(patch, pin)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const paid    = sessions.filter(s => s.status === 'paid' || s.status === 'printed')
  const revenue = paid.length * Number(config.price)
  const accent  = config.accentColor || '#e63946'

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate('/')}>← Kiosk</button>
        <h1 style={s.headerTitle}>Admin</h1>
        <div style={{ width: 60 }} />
      </div>

      {/* Tab bar */}
      <div style={s.tabs}>
        {[['stats','📊 Stats'],['config','⚙️ Config'],['sessions','🗂️ Sessies']].map(([id, label]) => (
          <button
            key={id}
            style={{ ...s.tab, borderBottom: tab === id ? `3px solid ${accent}` : '3px solid transparent', color: tab === id ? '#fff' : 'var(--text3)' }}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.body} className="scrollable">

        {tab === 'stats' && (
          <div style={s.statsGrid}>
            <StatCard label="Totaal sessies" value={sessions.length || '—'} accent={accent} />
            <StatCard label="Betaald"         value={paid.length || '—'} accent={accent} />
            <StatCard label="Omzet"           value={`€${revenue.toFixed(2)}`} accent={accent} big />
            <StatCard label="Filters actief"  value={config.showFilters ? 'Ja' : 'Nee'} accent={accent} />
          </div>
        )}

        {tab === 'config' && (
          <div style={s.form}>
            <Field label="Evenementnaam">
              <input style={s.input} value={form.eventName || ''} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} />
            </Field>
            <Field label="Tagline">
              <input style={s.input} value={form.tagline || ''} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} />
            </Field>
            <Field label="Prijs (€)">
              <input style={s.input} type="number" step="0.50" min="0" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} />
            </Field>
            <Field label="Accentkleur">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input style={{ ...s.input, flex: 1 }} value={form.accentColor || ''} onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))} />
                <input type="color" value={form.accentColor || '#e63946'} onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))} style={{ width: 48, height: 48, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
              </div>
            </Field>
            <Field label="Logo URL">
              <input style={s.input} placeholder="https://…/logo.png" value={form.logoUrl || ''} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} />
            </Field>
            <Field label="Brandtekst op strip">
              <input style={s.input} placeholder="#JouwEvent2025" value={form.brandText || ''} onChange={e => setForm(f => ({ ...f, brandText: e.target.value }))} />
            </Field>
            <Field label="SumUp affiliate key">
              <input style={s.input} type="password" placeholder="Laat leeg = dev-modus" value={form.sumupKey || ''} onChange={e => setForm(f => ({ ...f, sumupKey: e.target.value }))} />
            </Field>
            <Field label="Nieuwe admin-PIN">
              <input style={s.input} type="password" placeholder="Laat leeg = ongewijzigd" maxLength={8} value={form.adminPin || ''} onChange={e => setForm(f => ({ ...f, adminPin: e.target.value }))} />
            </Field>

            {/* Toggles */}
            <Toggle label="E-mail opvragen" value={form.showEmailCapture} onChange={v => setForm(f => ({ ...f, showEmailCapture: v }))} accent={accent} />
            <Toggle label="Filters tonen" value={form.showFilters} onChange={v => setForm(f => ({ ...f, showFilters: v }))} accent={accent} />

            <button
              style={{ ...s.saveBtn, background: saved ? '#22c55e' : accent }}
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Opslaan…' : saved ? '✓ Opgeslagen' : 'Opslaan'}
            </button>
          </div>
        )}

        {tab === 'sessions' && (
          <div style={s.sessionList}>
            {sessions.length === 0
              ? <p style={{ color: 'var(--text3)', textAlign: 'center', padding: 32 }}>Nog geen sessies</p>
              : sessions.map(s2 => (
                <div key={s2.id} style={s.sessionRow}>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 2 }}>
                      {new Date(s2.createdAt).toLocaleString('nl-NL')}
                    </p>
                    {s2.email && <p style={{ fontSize: 12, color: 'var(--text3)' }}>{s2.email}</p>}
                  </div>
                  <span style={{
                    ...s.badge,
                    background: s2.status === 'paid' || s2.status === 'printed'
                      ? '#22c55e22' : '#f59e0b22',
                    color: s2.status === 'paid' || s2.status === 'printed'
                      ? '#22c55e' : '#f59e0b',
                  }}>
                    {s2.status}
                  </span>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent, big }) {
  return (
    <div style={{
      background: 'var(--bg2)', borderRadius: 16,
      padding: '20px 24px', border: '1px solid var(--border)',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: big ? 36 : 28, fontWeight: 800, color: accent }}>{value}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ fontSize: 15 }}>{label}</span>
      <button
        style={{
          width: 52, height: 30, borderRadius: 15,
          background: value ? accent : 'var(--bg3)',
          border: '1px solid var(--border)',
          position: 'relative', cursor: 'pointer',
          transition: 'background 200ms',
        }}
        onClick={() => onChange(!value)}
      >
        <span style={{
          position: 'absolute', top: 3,
          left: value ? 24 : 4,
          width: 22, height: 22, borderRadius: 50,
          background: '#fff',
          transition: 'left 200ms',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  )
}

const s = {
  container: {
    width: '100%', height: '100%',
    background: 'var(--bg)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  back: { background: 'none', color: 'var(--text3)', fontSize: 15, padding: '4px 0' },
  headerTitle: { fontSize: 18, fontWeight: 700 },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  tab: {
    flex: 1, padding: '14px 8px',
    background: 'none', fontSize: 14, fontWeight: 600,
    transition: 'color 200ms, border-color 200ms',
  },
  body: {
    flex: 1, overflowY: 'auto',
    padding: 24,
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480 },
  input: {
    padding: '14px 16px',
    background: 'var(--bg3)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', fontSize: 16,
  },
  saveBtn: {
    padding: '18px',
    borderRadius: 'var(--radius)',
    color: '#fff', fontSize: 17, fontWeight: 700,
    marginTop: 8, transition: 'background 300ms',
  },
  sessionList: { display: 'flex', flexDirection: 'column', gap: 8 },
  sessionRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px',
    background: 'var(--bg2)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
  },
  badge: {
    padding: '4px 12px', borderRadius: 100,
    fontSize: 12, fontWeight: 600,
  },
}
