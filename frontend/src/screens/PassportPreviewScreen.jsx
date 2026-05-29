import React, { useState } from 'react'
import config from '../utils/config'

const CHECKS = [
  'Neutrale uitdrukking, mond gesloten',
  'Beide ogen volledig open, recht in de lens',
  'Hoofd recht — niet gekanteld of gedraaid',
  'Beide oren volledig zichtbaar',
  'Geen bril of hoofdbedekking',
  'Geen schaduwen op het gezicht of achtergrond',
]

export default function PassportPreviewScreen({ photoDataUrl, onPay, onRetake }) {
  const [checks,   setChecks]   = useState(() => Array(CHECKS.length).fill(false))
  const [paying,   setPaying]   = useState(false)
  const allChecked = checks.every(Boolean)

  const toggle = i => setChecks(c => c.map((v, j) => (j === i ? !v : v)))

  const handlePay = async () => {
    if (paying) return
    setPaying(true)
    try { await onPay() } finally { setPaying(false) }
  }

  return (
    <div style={s.root}>
      <h2 style={s.title}>Controleer je pasfoto</h2>

      {/* Foto + label */}
      <div style={s.photoWrap}>
        <img src={photoDataUrl} alt="Pasfoto" style={s.photo} />
        <p style={s.photoLabel}>35 × 45 mm</p>
      </div>

      {/* Checklist */}
      <div style={s.checklist}>
        <p style={s.checkHeader}>Vink alles af voor je betaalt:</p>
        {CHECKS.map((item, i) => (
          <button key={i} style={s.row} onClick={() => toggle(i)}>
            <span style={{ ...s.box, ...(checks[i] ? s.boxChecked : {}) }}>
              {checks[i] ? '✓' : ''}
            </span>
            <span style={{ ...s.label, opacity: checks[i] ? 1 : 0.65 }}>{item}</span>
          </button>
        ))}
      </div>

      {/* Acties */}
      <div style={s.actions}>
        <button
          style={{ ...s.payBtn, opacity: (allChecked && !paying) ? 1 : 0.35 }}
          disabled={!allChecked || paying}
          onClick={handlePay}
        >
          {paying ? 'Bezig…' : `Betalen & printen — €${config.passportPrice.toFixed(2)}`}
        </button>
        <button style={s.retakeBtn} onClick={onRetake}>↩  Opnieuw maken</button>
      </div>
    </div>
  )
}

const s = {
  root: {
    flex: 1, display: 'flex', flexDirection: 'column',
    background: 'linear-gradient(135deg,#1a1a2e,#0f3460)',
    minHeight: '100vh', minHeight: '-webkit-fill-available',
    padding: '30px 0 50px',
  },
  title: {
    color: '#fff', fontSize: 32, fontWeight: 700,
    textAlign: 'center', margin: '0 0 16px',
  },
  photoWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  photo: {
    width: '38%', maxWidth: 200, borderRadius: 8,
    boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
  },
  photoLabel: {
    color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600,
  },
  checklist: {
    flex: 1, overflowY: 'auto', padding: '16px 28px',
    WebkitOverflowScrolling: 'touch',
  },
  checkHeader: {
    color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },
  row: {
    width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14,
    background: 'none', padding: '10px 0', textAlign: 'left',
  },
  box: {
    flexShrink: 0, width: 28, height: 28, borderRadius: 8,
    border: '2px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 16, fontWeight: 700, transition: 'all 0.15s',
  },
  boxChecked: {
    background: '#27ae60', borderColor: '#27ae60',
  },
  label: { color: '#fff', fontSize: 16, lineHeight: 1.4, transition: 'opacity 0.15s' },
  actions: { padding: '0 40px', display: 'flex', flexDirection: 'column', gap: 16 },
  payBtn: {
    padding: '24px', borderRadius: 18,
    background: 'linear-gradient(90deg,#e94560,#c0392b)',
    color: '#fff', fontSize: 20, fontWeight: 600,
    boxShadow: '0 6px 20px rgba(233,69,96,0.4)',
    transition: 'opacity 0.2s',
  },
  retakeBtn: {
    padding: '18px', borderRadius: 18,
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: 500,
  },
}
