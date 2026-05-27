import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { FILTERS } from './FilterScreen.jsx'

export default function PreviewScreen() {
  const navigate = useNavigate()
  const { config } = useApp()
  const canvasRef = useRef(null)
  const [stripUrl, setStripUrl] = useState(null)
  const [building, setBuilding] = useState(true)

  useEffect(() => {
    const photos = JSON.parse(sessionStorage.getItem('photos') || '[]')
    if (photos.length < 4) { navigate('/'); return }
    buildStrip(photos)
  }, [])

  async function buildStrip(photos) {
    const canvas = canvasRef.current
    const filterId = sessionStorage.getItem('filter') || 'none'
    const filterDef = FILTERS.find(f => f.id === filterId) || FILTERS[0]

    const W = 600
    const PHOTO_H = 400
    const GAP = 10
    const PAD = 20
    const FOOTER = 56
    const H = PAD + PHOTO_H * 4 + GAP * 3 + PAD + FOOTER

    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')

    // Background + white card
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#fff'
    roundRect(ctx, 10, 10, W - 20, H - 20, 10)
    ctx.fill()

    // Draw photos with filter
    for (let i = 0; i < 4; i++) {
      const img = await loadImage(photos[i], filterDef.css)
      const y = PAD + i * (PHOTO_H + GAP)
      ctx.save()
      ctx.beginPath()
      roundRect(ctx, PAD, y, W - PAD * 2, PHOTO_H, 6)
      ctx.clip()
      const scale = Math.max((W - PAD * 2) / img.naturalWidth, PHOTO_H / img.naturalHeight)
      const sw = (W - PAD * 2) / scale
      const sh = PHOTO_H / scale
      const sx = (img.naturalWidth - sw) / 2
      const sy = (img.naturalHeight - sh) / 2
      ctx.drawImage(img, sx, sy, sw, sh, PAD, y, W - PAD * 2, PHOTO_H)
      ctx.restore()
    }

    // Brand text / logo in footer
    const footerY = PAD + 4 * PHOTO_H + 3 * GAP + PAD
    ctx.fillStyle = '#333'
    ctx.font = '600 16px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    const dateStr = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
    const brand = config.brandText || config.eventName
    ctx.fillText(`${brand} · ${dateStr}`, W / 2, footerY + 20)

    // Accent stripe at bottom
    ctx.fillStyle = config.accentColor || '#e63946'
    ctx.fillRect(10, H - 16, W - 20, 6)

    const url = canvas.toDataURL('image/jpeg', 0.95)
    sessionStorage.setItem('strip', url)
    setStripUrl(url)
    setBuilding(false)
  }

  function loadImage(src, cssFilter) {
    return new Promise((resolve, reject) => {
      if (!cssFilter || cssFilter === 'none') {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
        return
      }
      // Apply CSS filter via offscreen canvas
      const tmp = document.createElement('canvas')
      const img = new Image()
      img.onload = () => {
        tmp.width = img.naturalWidth
        tmp.height = img.naturalHeight
        const tctx = tmp.getContext('2d')
        tctx.filter = cssFilter
        tctx.drawImage(img, 0, 0)
        const filtered = new Image()
        filtered.onload = () => resolve(filtered)
        filtered.onerror = reject
        filtered.src = tmp.toDataURL('image/jpeg', 0.95)
      }
      img.onerror = reject
      img.src = src
    })
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  function retake() {
    sessionStorage.removeItem('photos')
    sessionStorage.removeItem('strip')
    sessionStorage.removeItem('filter')
    navigate('/camera')
  }

  const accent = config.accentColor || '#e63946'

  return (
    <div style={s.container}>
      <p style={s.label}>Jouw fotostrip</p>

      <div style={s.stripWrap}>
        {building && <div style={s.skeleton} className="shimmer" />}
        <canvas ref={canvasRef} style={{ ...s.canvas, opacity: building ? 0 : 1 }} />
      </div>

      <div style={s.buttons}>
        <button style={s.btnSecondary} onClick={retake}>
          ↩ Opnieuw
        </button>
        <button style={{ ...s.btnPrimary, background: accent }} onClick={() =>
          navigate(config.showEmailCapture ? '/email' : '/payment')
        }>
          Printen — €{Number(config.price).toFixed(2)}
        </button>
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
    padding: '28px 24px',
  },
  label: {
    fontSize: 13, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600,
  },
  stripWrap: {
    flex: 1, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '12px 0',
    maxHeight: 'calc(100% - 120px)',
    position: 'relative',
    width: '100%',
  },
  skeleton: {
    position: 'absolute',
    width: 180, height: 560,
    borderRadius: 'var(--radius)',
  },
  canvas: {
    maxHeight: '100%', maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: 'var(--radius)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
    transition: 'opacity 300ms',
  },
  buttons: {
    display: 'flex', gap: 12,
    width: '100%', maxWidth: 440,
  },
  btnSecondary: {
    flex: 1, padding: '16px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text2)', fontSize: 16,
  },
  btnPrimary: {
    flex: 2, padding: '16px',
    borderRadius: 'var(--radius)',
    color: '#fff', fontSize: 17, fontWeight: 700,
  },
}
