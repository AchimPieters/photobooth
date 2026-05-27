import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const { config, API } = useApp()
  const tapCount = useRef(0)
  const tapTimer = useRef(null)
  const [pressed, setPressed] = useState(false)

  function handleLogoTap() {
    tapCount.current += 1
    clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => { tapCount.current = 0 }, 2000)
    if (tapCount.current >= 5) {
      tapCount.current = 0
      navigate('/admin')
    }
  }

  async function handleStart() {
    setPressed(true)
    sessionStorage.clear()
    // Create a backend session and store the ID
    try {
      const res = await fetch(`${API}/api/sessions`, { method: 'POST' })
      const data = await res.json()
      if (data.sessionId) sessionStorage.setItem('sessionId', data.sessionId)
    } catch (_) {}
    navigate('/camera')
  }

  const accent = config.accentColor || '#e63946'

  return (
    <div style={s.container}>
      {/* Logo / brand header */}
      <div style={s.header} onClick={handleLogoTap}>
        {config.logoUrl ? (
          <img src={config.logoUrl} alt="logo" style={s.logo} />
        ) : (
          <div style={{ ...s.logoPlaceholder, background: accent }}>
            <span style={s.logoIcon}>📸</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={s.content}>
        <h1 style={s.title}>{config.eventName}</h1>
        <p style={s.tagline}>{config.tagline}</p>

        <button
          style={{
            ...s.startBtn,
            background: pressed ? accent + 'cc' : accent,
            transform: pressed ? 'scale(0.97)' : 'scale(1)',
          }}
          onClick={handleStart}
        >
          Begin
        </button>
      </div>

      {/* Footer info */}
      <div style={s.footer}>
        <span style={s.pill}>📷 4 foto's</span>
        <span style={s.pill}>🖨️ Direct printen</span>
        <span style={s.pill}>📱 Digitaal delen</span>
      </div>
    </div>
  )
}

const s = {
  container: {
    width: '100%', height: '100%',
    background: 'var(--bg)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '48px 32px 40px',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logo: {
    maxHeight: '80px', maxWidth: '240px', objectFit: 'contain',
  },
  logoPlaceholder: {
    width: 80, height: 80, borderRadius: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoIcon: { fontSize: 36 },
  content: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 56, fontWeight: 800,
    letterSpacing: '-2px', lineHeight: 1.05,
    color: 'var(--text)',
  },
  tagline: {
    fontSize: 22, color: 'var(--text2)',
    fontWeight: 300, letterSpacing: '0.5px',
  },
  startBtn: {
    marginTop: 16,
    padding: '22px 72px',
    borderRadius: 'var(--radius)',
    fontSize: 22, fontWeight: 700,
    color: '#fff',
    letterSpacing: '0.5px',
    transition: 'transform 150ms, background 150ms',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  footer: {
    display: 'flex', gap: 12,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  pill: {
    padding: '8px 16px',
    background: 'var(--bg3)',
    borderRadius: 100,
    fontSize: 13, color: 'var(--text2)',
    letterSpacing: '0.3px',
  },
}
