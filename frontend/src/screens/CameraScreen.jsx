import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useCamera } from '../hooks/useCamera'
import config from '../utils/config'
import { useLang } from '../context/LangContext'
import { t } from '../utils/i18n'

export default function CameraScreen({ onComplete, onCancel }) {
  const lang = useLang()
  const { videoRef, ready, error, startCamera, stopCamera, takePhoto } = useCamera()
  const [photos,    setPhotos]    = useState([])
  const [countdown, setCountdown] = useState(0)
  const [flash,     setFlash]     = useState(false)
  const [busy,      setBusy]      = useState(false)
  const timerRef = useRef(null)

  useEffect(() => { startCamera() }, [startCamera])

  // Zodra alle foto's klaar zijn → door naar preview
  useEffect(() => {
    if (photos.length >= config.totalPhotos) {
      stopCamera()
      setTimeout(() => onComplete(photos), 700)
    }
  }, [photos, stopCamera, onComplete])

  const shoot = useCallback(() => {
    if (busy || photos.length >= config.totalPhotos) return
    setBusy(true)
    setCountdown(config.countdownSecs)

    let c = config.countdownSecs
    timerRef.current = setInterval(() => {
      c--
      setCountdown(c)
      if (c <= 0) {
        clearInterval(timerRef.current)
        setFlash(true)
        const dataUrl = takePhoto()
        setTimeout(() => {
          setFlash(false)
          if (dataUrl) setPhotos(prev => [...prev, dataUrl])
          setBusy(false)
          setCountdown(0)
        }, 400)
      }
    }, 1000)
  }, [busy, photos.length, takePhoto])

  useEffect(() => () => clearInterval(timerRef.current), [])

  return (
    <div style={s.root}>
      {/* Camera preview */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={s.video}
      />

      {/* Flash overlay */}
      <div style={{ ...s.flash, opacity: flash ? 1 : 0 }} />

      {/* Geen camera toegang */}
      {error && (
        <div style={s.errorBox}>
          <p style={s.errorText}>
            {error === 'camera-denied' ? t('cam.no_access', lang) : t('cam.unavailable', lang)}
          </p>
        </div>
      )}

      {/* Aftelling */}
      {countdown > 0 && (
        <div style={s.countdown}>{countdown}</div>
      )}

      {/* Bovenbalk */}
      <div style={s.topBar}>
        <button style={s.closeBtn} onClick={() => { stopCamera(); onCancel() }}>✕</button>
        <div style={s.progress}>
          {t('cam.progress', lang, { n: Math.min(photos.length + 1, config.totalPhotos), total: config.totalPhotos })}
        </div>
        <div style={{ width: 44 }} />
      </div>

      {/* Thumbnails */}
      <div style={s.thumbRow}>
        {Array.from({ length: config.totalPhotos }).map((_, i) => (
          <div key={i} style={{
            ...s.thumb,
            borderColor: i === photos.length ? '#fff' : 'rgba(255,255,255,0.3)',
            borderWidth: i === photos.length ? 2 : 1,
          }}>
            {photos[i]
              ? <img src={photos[i]} alt="" style={s.thumbImg} />
              : <span style={{ fontSize: 20, opacity: i === photos.length ? 1 : 0.3 }}>📷</span>
            }
          </div>
        ))}
      </div>

      {/* Sluiterknop */}
      <div style={s.bottomBar}>
        <button
          style={{ ...s.shutter, opacity: busy ? 0.5 : 1 }}
          onClick={shoot}
          disabled={busy || !ready}
        />
        <p style={s.hint}>{busy ? t('cam.smile', lang) : t('cam.hint', lang)}</p>
      </div>
    </div>
  )
}

const s = {
  root: { position: 'relative', flex: 1, background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '100vh', minHeight: '-webkit-fill-available' },
  video: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
  flash: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: '#fff', pointerEvents: 'none', transition: 'opacity 0.15s', zIndex: 10 },
  countdown: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 220, fontWeight: 900, color: '#fff', zIndex: 11, lineHeight: 1, textShadow: '0 0 40px rgba(0,0,0,0.5)' },
  topBar: { position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' },
  closeBtn: { width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  progress: { background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 17, fontWeight: 600, padding: '8px 16px', borderRadius: 14 },
  thumbRow: { position: 'relative', zIndex: 5, display: 'flex', gap: 10, justifyContent: 'center', padding: '0 20px', marginTop: 'auto', marginBottom: 16 },
  thumb: { width: 90, height: 68, borderRadius: 8, borderStyle: 'solid', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  bottomBar: { position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingBottom: 50 },
  shutter: { width: 90, height: 90, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 6px rgba(255,255,255,0.4)', transition: 'opacity 0.2s, transform 0.1s' },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: 500 },
  errorBox: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6, padding: 40 },
  errorText: { color: 'rgba(255,255,255,0.8)', fontSize: 20, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.6 },
}
