import React, { useState, useRef } from 'react'
import { getSettings, saveSettings, verifyPassword, hashPassword } from '../utils/settings'
import { getConfig } from '../utils/config'

export default function AdminScreen({ onClose }) {
  const [phase, setPhase] = useState('login')
  const [pw, setPw] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [loginBusy, setLoginBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pwError, setPwError] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const savedTimer = useRef(null)

  const [form, setForm] = useState(() => {
    const c = getConfig()
    const s = getSettings()
    return {
      sumupAffiliateKey: c.sumupAffiliateKey,
      price:             String(c.price),
      passportPrice:     String(c.passportPrice),
      currency:          c.currency,
      baseUrl:           c.baseUrl,
      totalPhotos:       String(c.totalPhotos),
      countdownSecs:     String(c.countdownSecs),
      autoRestartSecs:   String(c.autoRestartSecs),
      stripFooter:       c.stripFooter,
      stripBg:           c.stripBg,
      // keep original passwordHash for save
      _passwordHash:     s.passwordHash,
    }
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const login = async () => {
    setLoginBusy(true)
    const ok = await verifyPassword(pw)
    setLoginBusy(false)
    if (ok) { setPhase('settings'); setLoginError(false) }
    else setLoginError(true)
  }

  const save = async () => {
    setPwError('')
    let passwordHash = form._passwordHash
    if (newPw) {
      if (newPw !== confirmPw) { setPwError('Wachtwoorden komen niet overeen'); return }
      if (newPw.length < 6)    { setPwError('Minimaal 6 tekens vereist'); return }
      passwordHash = await hashPassword(newPw)
    }
    saveSettings({
      sumupAffiliateKey: form.sumupAffiliateKey.trim(),
      price:             Number(form.price) || 0,
      passportPrice:     Number(form.passportPrice) || 0,
      currency:          form.currency.trim().toUpperCase() || 'EUR',
      baseUrl:           form.baseUrl.trim(),
      totalPhotos:       Math.max(1, Math.min(8, parseInt(form.totalPhotos) || 4)),
      countdownSecs:     Math.max(1, Math.min(10, parseInt(form.countdownSecs) || 3)),
      autoRestartSecs:   Math.max(5, Math.min(120, parseInt(form.autoRestartSecs) || 15)),
      stripFooter:       form.stripFooter,
      stripBg:           form.stripBg,
      passwordHash,
    })
    setNewPw('')
    setConfirmPw('')
    clearTimeout(savedTimer.current)
    setSaved(true)
    savedTimer.current = setTimeout(() => setSaved(false), 2500)
  }

  if (phase === 'login') {
    return (
      <div style={s.root}>
        <div style={s.topBar}>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
          <span style={s.topTitle}>Admin</span>
          <div style={{ width: 44 }} />
        </div>
        <div style={s.loginWrap}>
          <div style={s.lockIcon}>🔒</div>
          <h2 style={s.loginTitle}>Admin toegang</h2>
          <input
            style={{ ...s.input, ...(loginError ? s.inputErr : {}) }}
            type="password"
            placeholder="Wachtwoord"
            value={pw}
            autoComplete="current-password"
            onChange={e => { setPw(e.target.value); setLoginError(false) }}
            onKeyDown={e => e.key === 'Enter' && !loginBusy && login()}
          />
          {loginError && <p style={s.errMsg}>Onjuist wachtwoord</p>}
          <button style={s.loginBtn} onClick={login} disabled={loginBusy}>
            {loginBusy ? 'Controleren…' : 'Inloggen'}
          </button>
          <p style={s.hint}>Standaard wachtwoord: photobooth</p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
        <span style={s.topTitle}>Instellingen</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={s.scroll}>
        <Section title="💳 Betaling">
          <Field label="SumUp Affiliate Key">
            <input style={s.input} type="text" value={form.sumupAffiliateKey}
              onChange={e => set('sumupAffiliateKey', e.target.value)}
              placeholder="Jouw SumUp affiliate key" autoComplete="off" />
          </Field>
          <Field label="Prijs fotostrip (€)">
            <input style={s.input} type="number" step="0.01" min="0"
              value={form.price} onChange={e => set('price', e.target.value)} />
          </Field>
          <Field label="Prijs pasfoto's — 4 stuks (€)">
            <input style={s.input} type="number" step="0.01" min="0"
              value={form.passportPrice} onChange={e => set('passportPrice', e.target.value)} />
          </Field>
          <Field label="Valuta">
            <input style={s.input} type="text" maxLength={3}
              value={form.currency} onChange={e => set('currency', e.target.value)} />
          </Field>
          <Field label="Callback basis-URL">
            <input style={s.input} type="url"
              value={form.baseUrl} onChange={e => set('baseUrl', e.target.value)}
              placeholder="https://achimpieters.github.io/photobooth" />
          </Field>
        </Section>

        <Section title="📷 Fotobooth">
          <Field label="Aantal foto's (1–8)">
            <input style={s.input} type="number" min="1" max="8"
              value={form.totalPhotos} onChange={e => set('totalPhotos', e.target.value)} />
          </Field>
          <Field label="Aftelling (1–10 sec)">
            <input style={s.input} type="number" min="1" max="10"
              value={form.countdownSecs} onChange={e => set('countdownSecs', e.target.value)} />
          </Field>
          <Field label="Auto-herstart (5–120 sec)">
            <input style={s.input} type="number" min="5" max="120"
              value={form.autoRestartSecs} onChange={e => set('autoRestartSecs', e.target.value)} />
          </Field>
        </Section>

        <Section title="🎞️ Fotostrip">
          <Field label="Footer tekst">
            <input style={s.input} type="text"
              value={form.stripFooter} onChange={e => set('stripFooter', e.target.value)} />
          </Field>
          <Field label="Achtergrondkleur">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input type="color" value={form.stripBg}
                onChange={e => set('stripBg', e.target.value)}
                style={s.colorPicker} />
              <input style={{ ...s.input, flex: 1 }} type="text"
                value={form.stripBg} onChange={e => set('stripBg', e.target.value)} />
            </div>
          </Field>
        </Section>

        <Section title="🔑 Wachtwoord wijzigen">
          <Field label="Nieuw wachtwoord">
            <input style={s.input} type="password" value={newPw}
              onChange={e => { setNewPw(e.target.value); setPwError('') }}
              placeholder="Leeg laten = geen wijziging" autoComplete="new-password" />
          </Field>
          <Field label="Bevestig wachtwoord">
            <input style={s.input} type="password" value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPwError('') }}
              placeholder="Herhaal nieuw wachtwoord" autoComplete="new-password" />
          </Field>
          {pwError && <p style={s.errMsg}>{pwError}</p>}
        </Section>

        <button style={saved ? s.savedBtn : s.saveBtn} onClick={save}>
          {saved ? '✓  Opgeslagen!' : 'Opslaan'}
        </button>

        <div style={{ height: 50 }} />
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={s.field}>
      <p style={s.label}>{label}</p>
      {children}
    </div>
  )
}

const s = {
  root: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'linear-gradient(135deg,#1a1a2e,#0f3460)',
    display: 'flex', flexDirection: 'column', overflowY: 'hidden',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 20px 0', flexShrink: 0,
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { color: '#fff', fontSize: 22, fontWeight: 700 },
  scroll: {
    flex: 1, overflowY: 'auto', padding: '20px 24px',
    WebkitOverflowScrolling: 'touch',
  },
  loginWrap: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 40px',
  },
  lockIcon: { fontSize: 64 },
  loginTitle: { color: '#fff', fontSize: 32, fontWeight: 700 },
  loginBtn: {
    width: '100%', padding: '20px', borderRadius: 16,
    background: 'linear-gradient(90deg,#e94560,#c0392b)',
    color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8,
  },
  hint: { color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 },
  section: { marginBottom: 28 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14,
  },
  field: { marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 6 },
  input: {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', fontSize: 16, boxSizing: 'border-box', outline: 'none',
  },
  inputErr: { borderColor: '#e94560' },
  errMsg: { color: '#e94560', fontSize: 14, marginTop: 2 },
  colorPicker: {
    width: 56, height: 44, borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', padding: 2,
    background: 'rgba(255,255,255,0.08)',
  },
  saveBtn: {
    width: '100%', padding: '22px', borderRadius: 16,
    background: 'linear-gradient(90deg,#e94560,#c0392b)',
    color: '#fff', fontSize: 20, fontWeight: 600,
    boxShadow: '0 6px 20px rgba(233,69,96,0.4)', marginTop: 8,
  },
  savedBtn: {
    width: '100%', padding: '22px', borderRadius: 16,
    background: 'linear-gradient(90deg,#27ae60,#1e8449)',
    color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 8,
  },
}
