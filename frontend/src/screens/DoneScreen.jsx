import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const COUNTDOWN = 30

export default function DoneScreen() {
  const navigate = useNavigate()
  const { config, API } = useApp()
  const hasPrinted = useRef(false)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [seconds, setSeconds] = useState(COUNTDOWN)

  const accent = config.accentColor || '#e63946'

  // Guard: must have paid
  useEffect(() => {
    if (!sessionStorage.getItem('paid')) { navigate('/'); return }
  }, [])

  // Auto-print once
  useEffect(() => {
    if (!hasPrinted.current) {
      hasPrinted.current = true
      const t = setTimeout(printStrip, 800)
      return () => clearTimeout(t)
    }
  }, [])

  // Fetch QR code for digital strip
  useEffect(() => {
    const strip = sessionStorage.getItem('strip')
    if (!strip) return
    // Upload strip to backend, get back a shareable URL
    // For now: use QR of the data URL length is too large — generate QR of a short session link
    const sessionId = sessionStorage.getItem('sessionId')
    if (sessionId) {
      const shareUrl = `${window.location.origin}/?session=${sessionId}`
      fetch(`${API}/api/qr?url=${encodeURIComponent(shareUrl)}`)
        .then(r => r.json())
        .then(d => d.qr && setQrDataUrl(d.qr))
        .catch(() => {})
    }
  }, [])

  // Countdown + auto-reset
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (seconds <= 0) reset()
  }, [seconds])

  function reset() {
    sessionStorage.clear()
    navigate('/')
  }

  function printStrip() {
    const strip = sessionStorage.getItem('strip')
    if (!strip) return
    const width = config.printWidth || '10cm'
    const w = window.open('', '_blank', 'width=400,height=800')
    if (!w) return
    const img = w.document.createElement('img')
    img.src = strip
    img.style.cssText = `width:${width};display:block;margin:0 auto;`
    const style = w.document.createElement('style')
    style.textContent = `body{margin:0;background:#fff;}@media print{@page{margin:0;size:${width} auto;}body{margin:0;}}`
    const script = w.document.createElement('script')
    script.textContent = 'window.onload=function(){window.print();window.close()}'
    w.document.head.appendChild(style)
    w.document.body.appendChild(img)
    w.document.body.appendChild(script)
    w.document.close()
  }

  return (
    <div style={s.container}>
      {/* Success icon */}
      <div style={{ ...s.successRing, borderColor: accent }}>
        <span style={s.successIcon}>🎉</span>
      </div>

      <div style={s.textBlock}>
        <h1 style={s.title}>Gelukt!</h1>
        <p style={s.sub}>Je fotostrip wordt geprint via de Canon SELPHY</p>
      </div>

      {/* QR code */}
      {qrDataUrl && (
        <div style={s.qrCard}>
          <img src={qrDataUrl} alt="QR code" style={s.qrImg} />
          <div style={s.qrText}>
            <p style={s.qrTitle}>Scan voor jouw digitale strip</p>
            <p style={s.qrSub}>Bewaar hem op je telefoon</p>
          </div>
        </div>
      )}

      <div style={s.buttons}>
        <button style={s.btnSecondary} onClick={printStrip}>
          🖨️ Opnieuw printen
        </button>
        <button style={{ ...s.btnPrimary, background: accent }} onClick={reset}>
          Klaar
        </button>
      </div>

      {/* Countdown bar */}
      <div style={s.countdownWrap}>
        <div style={s.countdownBar}>
          <div style={{
            ...s.countdownFill,
            width: `${(seconds / COUNTDOWN) * 100}%`,
            background: accent,
          }} />
        </div>
        <p style={s.countdownLabel}>Terug naar start over {seconds}s</p>
      </div>
    </div>
  )
}

const s = {
  container: {
    width: '100%', height: '100%',
    background: 'var(--bg)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 24, padding: '32px 24px',
    textAlign: 'center',
  },
  successRing: {
    width: 100, height: 100, borderRadius: 50,
    border: '3px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  successIcon: { fontSize: 48 },
  textBlock: { display: 'flex', flexDirection: 'column', gap: 8 },
  title: { fontSize: 44, fontWeight: 800 },
  sub: { fontSize: 17, color: 'var(--text2)' },
  qrCard: {
    display: 'flex', alignItems: 'center', gap: 20,
    background: 'var(--bg2)',
    borderRadius: 20, padding: '20px 28px',
    border: '1px solid var(--border)',
  },
  qrImg: { width: 90, height: 90, borderRadius: 8 },
  qrText: { textAlign: 'left' },
  qrTitle: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  qrSub: { fontSize: 13, color: 'var(--text2)' },
  buttons: { display: 'flex', gap: 12, width: '100%', maxWidth: 420 },
  btnSecondary: {
    flex: 1, padding: '16px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text2)', fontSize: 15,
  },
  btnPrimary: {
    flex: 2, padding: '16px',
    borderRadius: 'var(--radius)',
    color: '#fff', fontSize: 17, fontWeight: 700,
  },
  countdownWrap: {
    width: '100%', maxWidth: 420,
    display: 'flex', flexDirection: 'column', gap: 6,
    marginTop: 8,
  },
  countdownBar: {
    height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden',
  },
  countdownFill: {
    height: '100%', borderRadius: 2,
    transition: 'width 1s linear',
  },
  countdownLabel: { fontSize: 12, color: 'var(--text3)' },
}
