import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PreviewScreen() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [stripUrl, setStripUrl] = useState(null)

  useEffect(() => {
    const photos = JSON.parse(sessionStorage.getItem('photos') || '[]')
    if (photos.length < 4) { navigate('/'); return }
    buildStrip(photos)
  }, [])

  async function buildStrip(photos) {
    const canvas = canvasRef.current

    // Fotostrip formaat: 4 foto's verticaal (verhouding 1:4)
    const W = 600
    const PHOTO_H = 400
    const GAP = 8
    const PADDING = 16
    const FOOTER = 48
    const H = PADDING + PHOTO_H * 4 + GAP * 3 + PADDING + FOOTER

    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Achtergrond
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, W, H)

    // Witte rand (retro strip stijl)
    ctx.fillStyle = '#fff'
    ctx.roundRect(8, 8, W - 16, H - 16, 8)
    ctx.fill()

    // Foto's tekenen
    for (let i = 0; i < 4; i++) {
      const img = await loadImage(photos[i])
      const y = PADDING + i * (PHOTO_H + GAP)
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(PADDING, y, W - PADDING * 2, PHOTO_H, 4)
      ctx.clip()
      // Centreer en crop de foto
      const scale = Math.max((W - PADDING * 2) / img.width, PHOTO_H / img.height)
      const sw = (W - PADDING * 2) / scale
      const sh = PHOTO_H / scale
      const sx = (img.width - sw) / 2
      const sy = (img.height - sh) / 2
      ctx.drawImage(img, sx, sy, sw, sh, PADDING, y, W - PADDING * 2, PHOTO_H)
      ctx.restore()
    }

    // Footer tekst
    ctx.fillStyle = '#333'
    ctx.font = '500 18px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('photobooth • ' + new Date().toLocaleDateString('nl-NL'), W / 2, H - 16)

    const url = canvas.toDataURL('image/jpeg', 0.95)
    sessionStorage.setItem('strip', url)
    setStripUrl(url)
  }

  function loadImage(src) {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = src
    })
  }

  function retake() {
    sessionStorage.removeItem('photos')
    sessionStorage.removeItem('strip')
    navigate('/camera')
  }

  return (
    <div style={styles.container}>
      <p style={styles.label}>Jouw fotostrip</p>

      <div style={styles.stripWrap}>
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>

      <div style={styles.buttons}>
        <button style={styles.btnSecondary} onClick={retake}>
          Opnieuw
        </button>
        <button style={styles.btnPrimary} onClick={() => navigate('/payment')}>
          Printen → €3,00
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    background: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 20px',
  },
  label: {
    fontSize: '18px',
    color: '#888',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  stripWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 0',
    maxHeight: 'calc(100% - 120px)',
  },
  canvas: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    maxWidth: '400px',
  },
  btnSecondary: {
    flex: 1,
    padding: '16px',
    background: 'transparent',
    border: '1px solid #333',
    borderRadius: '12px',
    color: '#aaa',
    fontSize: '16px',
    cursor: 'pointer',
  },
  btnPrimary: {
    flex: 2,
    padding: '16px',
    background: '#fff',
    border: 'none',
    borderRadius: '12px',
    color: '#000',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
