import React, { useEffect, useCallback, useState } from 'react'
import { useCamera } from '../hooks/useCamera'

const GUIDE_W_PCT = 65  // % van schermbreedte

function cropToPassport(dataUrl) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const vw = img.width
      const vh = img.height
      // Maximaal 52% breedte, begrensd door hoogte (35:45 ratio)
      const cropW = Math.min(vw * 0.52, vh * (35 / 45))
      const cropH = cropW * (45 / 35)
      const cropX = (vw - cropW) / 2
      // 12% van de resterende verticale ruimte als bovenmarge (hoofd aan bovenkant)
      const cropY = Math.max(0, (vh - cropH) * 0.12)

      const canvas = document.createElement('canvas')
      canvas.width  = 700   // 35 mm × 20 px/mm
      canvas.height = 900   // 45 mm × 20 px/mm
      canvas.getContext('2d').drawImage(img, cropX, cropY, cropW, cropH, 0, 0, 700, 900)
      resolve(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.src = dataUrl
  })
}

export default function PassportCameraScreen({ onComplete, onBack }) {
  const { videoRef, ready, error, startCamera, stopCamera, takePhoto } = useCamera()
  const [busy,      setBusy]      = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [flash,     setFlash]     = useState(false)

  useEffect(() => { startCamera() }, [startCamera])

  const shoot = useCallback(() => {
    if (busy || !ready) return
    setBusy(true)
    setCountdown(3)
    let c = 3
    const id = setInterval(() => {
      c--
      setCountdown(c)
      if (c <= 0) {
        clearInterval(id)
        setFlash(true)
        const raw = takePhoto()
        setTimeout(async () => {
          setFlash(false)
          if (raw) {
            const passport = await cropToPassport(raw)
            stopCamera()
            onComplete(passport)
          } else {
            setBusy(false)
            setCountdown(0)
          }
        }, 400)
      }
    }, 1000)
  }, [busy, ready, takePhoto, stopCamera, onComplete])

  const guideHPct = GUIDE_W_PCT * (45 / 35)  // voor padding-bottom truc

  return (
    <div style={s.root}>
      <video ref={videoRef} playsInline muted autoPlay style={s.video} />

      {/* Flits-overlay */}
      <div style={{ ...s.flash, opacity: flash ? 1 : 0 }} />

      {/* Gezichtskader — box-shadow dekt alles buiten het kader af */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left:   `${(100 - GUIDE_W_PCT) / 2}%`,
          top:    '4%',
          width:  `${GUIDE_W_PCT}%`,
          paddingBottom: `${guideHPct}%`,
          border:        '2px solid rgba(255,255,255,0.8)',
          borderRadius:  10,
          boxShadow:     '0 0 0 9999px rgba(0,0,0,0.5)',
          zIndex:        5,
          pointerEvents: 'none',
        }}
      />

      {/* Aftelling */}
      {countdown > 0 && (
        <div style={s.countdown}>{countdown}</div>
      )}

      {/* Camera-fout */}
      {error && (
        <div style={s.errorBox}>
          <p style={s.errorText}>
            {error === 'camera-denied'
              ? '📵  Geen camera-toegang\n\nGa naar Instellingen → Safari → Camera → Toestaan'
              : '📷  Camera niet beschikbaar'}
          </p>
        </div>
      )}

      {/* Topbalk */}
      <div style={s.topBar}>
        <button style={s.closeBtn} onClick={() => { stopCamera(); onBack() }}>←</button>
        <span style={s.topLabel}>🪪  Pasfoto</span>
        <div style={{ width: 44 }} />
      </div>

      {/* Onderkant */}
      <div style={s.bottom}>
        <p style={s.hint}>
          {busy
            ? (countdown > 0 ? '⚠️  Niet bewegen…' : 'Verwerken…')
            : 'Positioneer je hoofd in het kader'}
        </p>
        <button
          style={{ ...s.shutter, opacity: (busy || !ready) ? 0.35 : 1 }}
          onClick={shoot}
          disabled={busy || !ready}
        />
      </div>
    </div>
  )
}

const s = {
  root: {
    position: 'relative', flex: 1, background: '#000',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    minHeight: '100vh', minHeight: '-webkit-fill-available',
  },
  video: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', transform: 'scaleX(-1)',
  },
  flash: {
    position: 'absolute', inset: 0, background: '#fff',
    pointerEvents: 'none', transition: 'opacity 0.15s', zIndex: 10,
  },
  countdown: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    fontSize: 200, fontWeight: 900, color: '#fff', zIndex: 11,
    lineHeight: 1, textShadow: '0 0 40px rgba(0,0,0,0.5)',
  },
  topBar: {
    position: 'relative', zIndex: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 20px 0',
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  topLabel: {
    background: 'rgba(0,0,0,0.4)', color: '#fff',
    fontSize: 17, fontWeight: 600, padding: '8px 16px', borderRadius: 14,
  },
  bottom: {
    position: 'relative', zIndex: 6, marginTop: 'auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 14, paddingBottom: 50, paddingTop: 16,
  },
  hint: { color: 'rgba(255,255,255,0.8)', fontSize: 17, fontWeight: 500 },
  shutter: {
    width: 90, height: 90, borderRadius: '50%', background: '#fff',
    boxShadow: '0 0 0 6px rgba(255,255,255,0.35)',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  errorBox: {
    position: 'absolute', inset: 0, zIndex: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  errorText: {
    color: 'rgba(255,255,255,0.85)', fontSize: 20,
    textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.6,
  },
}
