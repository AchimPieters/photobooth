import React, { useEffect, useRef, useState } from 'react'
import config from '../utils/config'

export default function WelcomeScreen({ onStartStrip, onStartPassport, onAdmin, licensed, licenseInfo }) {
  const [pulse, setPulse] = useState(false)
  const tapCount = useRef(0)
  const tapTimer = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1800)
    return () => clearInterval(id)
  }, [])

  useEffect(() => () => clearTimeout(tapTimer.current), [])

  const handleIconTap = () => {
    tapCount.current += 1
    clearTimeout(tapTimer.current)
    if (tapCount.current >= 5) {
      tapCount.current = 0
      onAdmin()
      return
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0 }, 3000)
  }

  return (
    <div style={s.root}>
      {/* Logo */}
      <div style={s.top}>
        <div
          style={{ ...s.icon, transform: `scale(${pulse ? 1.06 : 1.0})` }}
          onClick={handleIconTap}
        >
          ⦿
        </div>
        <h1 style={s.title}>Photobooth</h1>
      </div>

      {/* Licentie-status */}
      {licensed
        ? <p style={s.licBadge}>✓ {licenseInfo?.licensee}</p>
        : <p style={s.demoBadge}>DEMO — betalen &amp; printen uitgeschakeld</p>
      }

      {/* Keuze-knoppen */}
      <div style={s.modes}>
        <button style={s.modeCard} onClick={onStartStrip}>
          <span style={s.modeIcon}>📸</span>
          <span style={s.modeTitle}>Fotostrip</span>
          <span style={s.modeSub}>4 foto's · direct printen</span>
          <span style={s.modePrice}>€{config.price.toFixed(2)}</span>
        </button>

        <button style={{ ...s.modeCard, ...s.modeCardPassport }} onClick={onStartPassport}>
          <span style={s.modeIcon}>🪪</span>
          <span style={s.modeTitle}>Pasfoto's</span>
          <span style={s.modeSub}>Officieel formaat 35×45 mm</span>
          <span style={s.modePrice}>€{config.passportPrice.toFixed(2)} voor 4 stuks</span>
        </button>
      </div>
    </div>
  )
}

const s = {
  root: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: '100vh', minHeight: '-webkit-fill-available',
    padding: '40px 0 50px',
  },
  top: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12,
  },
  icon: {
    fontSize: 80, lineHeight: 1,
    transition: 'transform 1.8s ease-in-out',
    cursor: 'default', userSelect: 'none',
  },
  title: {
    fontSize: 56, fontWeight: 700, color: '#fff', letterSpacing: -1, margin: 0,
  },
  modes: {
    width: '100%', padding: '0 40px',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  modeCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    gap: 4, padding: '28px 30px', borderRadius: 22,
    background: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(255,255,255,0.12)',
    textAlign: 'left',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  modeCardPassport: {
    background: 'rgba(233,69,96,0.08)',
    border: '1.5px solid rgba(233,69,96,0.25)',
  },
  modeIcon: { fontSize: 44, lineHeight: 1, marginBottom: 4 },
  modeTitle: { color: '#fff', fontSize: 30, fontWeight: 700 },
  modeSub: { color: 'rgba(255,255,255,0.55)', fontSize: 17, fontWeight: 400 },
  modePrice: {
    marginTop: 8, color: '#e94560',
    fontSize: 20, fontWeight: 700,
  },
  demoBadge: {
    background: 'rgba(233,69,96,0.12)', color: '#e94560',
    fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
    padding: '8px 18px', borderRadius: 20,
    border: '1px solid rgba(233,69,96,0.3)',
  },
  licBadge: {
    color: 'rgba(39,174,96,0.8)', fontSize: 14, fontWeight: 600,
  },
}
