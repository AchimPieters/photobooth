import React, { useEffect, useState, useRef } from 'react'
import config from '../utils/config'

export default function DoneScreen({ stripDataUrl, onRestart }) {
  const [secs, setSecs] = useState(config.autoRestartSecs)
  const timerRef = useRef(null)

  useEffect(() => {
    // Auto-print bij openen
    if (stripDataUrl) {
      // Geef Safari even tijd om de DOM te renderen
      setTimeout(() => window.print(), 800)
    }

    // Aftellen voor auto-restart
    timerRef.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current); onRestart(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [stripDataUrl, onRestart])

  return (
    <div style={s.root}>
      <div style={s.top}>
        <div style={s.check}>✓</div>
        <h2 style={s.title}>Betaald!</h2>
        <p style={s.sub}>Je strip wordt nu geprint.</p>
      </div>

      {stripDataUrl && (
        <img src={stripDataUrl} alt="Fotostrip" style={s.strip} />
      )}

      <div style={s.actions}>
        <button style={s.reprintBtn} onClick={() => window.print()}>
          🖨  Opnieuw printen
        </button>
        <button style={s.restartBtn} onClick={() => { clearInterval(timerRef.current); onRestart() }}>
          ↩  Nieuwe sessie  ({secs}s)
        </button>
      </div>
    </div>
  )
}

const s = {
  root: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', minHeight: '100vh', minHeight: '-webkit-fill-available', padding: '40px 0 50px', gap: 20 },
  top: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  check: { width: 120, height: 120, borderRadius: '50%', background: 'rgba(39,174,96,0.15)', color: '#27ae60', fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  title: { color: '#fff', fontSize: 52, fontWeight: 900 },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 24, fontWeight: 300 },
  strip: { width: '45%', maxWidth: 280, borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', flexShrink: 0 },
  actions: { width: '100%', padding: '0 50px', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 'auto' },
  reprintBtn: { padding: '22px', borderRadius: 18, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 20, fontWeight: 600 },
  restartBtn: { padding: '22px', borderRadius: 18, background: 'linear-gradient(90deg,#e94560,#c0392b)', color: '#fff', fontSize: 22, fontWeight: 600, boxShadow: '0 6px 20px rgba(233,69,96,0.4)' },
}
