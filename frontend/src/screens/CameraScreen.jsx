import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const TOTAL = 4
const COUNTDOWN = 3

export default function CameraScreen() {
  const navigate = useNavigate()
  const { config } = useApp()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [photos, setPhotos] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [phase, setPhase] = useState('init') // init | ready | countdown | flash | done | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setPhase('ready')
      } catch (err) {
        if (!cancelled) {
          setErrorMsg('Camera toegang geweigerd. Controleer de instellingen.')
          setPhase('error')
        }
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Auto-start after camera ready
  useEffect(() => {
    if (phase !== 'ready') return
    const t = setTimeout(() => { setPhase('countdown'); setCountdown(COUNTDOWN) }, 1200)
    return () => clearTimeout(t)
  }, [phase])

  // Countdown tick
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) { takePhoto(); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, phase])

  // Navigate after all photos
  useEffect(() => {
    if (photos.length !== TOTAL) return
    sessionStorage.setItem('photos', JSON.stringify(photos))
    const t = setTimeout(() => navigate(config.showFilters ? '/filter' : '/preview'), 600)
    return () => clearTimeout(t)
  }, [photos])

  function takePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    setPhase('flash')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 960
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setPhotos(prev => {
      const next = [...prev, dataUrl]
      setTimeout(() => {
        if (next.length < TOTAL) { setPhase('countdown'); setCountdown(COUNTDOWN) }
        else setPhase('done')
      }, 500)
      return next
    })
  }

  const accent = config.accentColor || '#e63946'

  if (phase === 'error') {
    return (
      <div style={{ ...s.container, gap: 24 }}>
        <div style={{ fontSize: 64 }}>📷</div>
        <p style={{ fontSize: 20, color: 'var(--text2)', textAlign: 'center', maxWidth: 320 }}>{errorMsg}</p>
        <button style={{ ...s.btn, background: accent }} onClick={() => navigate('/')}>Terug</button>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <video ref={videoRef} autoPlay playsInline muted style={s.video} />

      {/* Flash */}
      {phase === 'flash' && <div style={s.flash} />}

      {/* Countdown */}
      {phase === 'countdown' && countdown > 0 && (
        <div style={{ ...s.countdown, animation: 'pulse 0.6s ease' }}>{countdown}</div>
      )}

      {/* Progress bar */}
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${(photos.length / TOTAL) * 100}%`, background: accent }} />
      </div>

      {/* Thumbnails */}
      <div style={s.thumbnails}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} style={{
            ...s.thumb,
            borderColor: i < photos.length ? accent : 'rgba(255,255,255,0.15)',
          }}>
            {photos[i]
              ? <img src={photos[i]} alt="" style={s.thumbImg} />
              : <span style={s.thumbNum}>{i + 1}</span>
            }
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

const s = {
  container: {
    width: '100%', height: '100%',
    background: '#000',
    position: 'relative',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  video: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  flash: {
    position: 'absolute', inset: 0,
    background: '#fff',
    animation: 'flash 0.5s ease forwards',
    pointerEvents: 'none',
    zIndex: 10,
  },
  countdown: {
    position: 'absolute',
    fontSize: 180, fontWeight: 800,
    color: '#fff',
    textShadow: '0 4px 40px rgba(0,0,0,0.9)',
    pointerEvents: 'none',
    zIndex: 5,
    lineHeight: 1,
  },
  progressBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 4, background: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  progressFill: {
    height: '100%',
    transition: 'width 400ms ease',
  },
  thumbnails: {
    position: 'absolute', bottom: 28,
    display: 'flex', gap: 10, zIndex: 10,
  },
  thumb: {
    width: 64, height: 48, borderRadius: 8,
    overflow: 'hidden', border: '2px solid',
    background: '#111',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color 300ms',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbNum: { color: '#555', fontSize: 16, fontWeight: 600 },
  btn: {
    padding: '18px 48px', borderRadius: 'var(--radius)',
    fontSize: 18, fontWeight: 700, color: '#fff',
  },
}
