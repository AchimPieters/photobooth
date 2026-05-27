import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TOTAL_PHOTOS = 4
const COUNTDOWN_START = 3

export default function CameraScreen() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [photos, setPhotos] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [phase, setPhase] = useState('ready') // ready | countdown | flash | done

  // Camera opstarten
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        console.error('Camera toegang geweigerd:', err)
      }
    }
    startCamera()
    return () => streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  // Start de sessie automatisch
  useEffect(() => {
    if (phase === 'ready') {
      const t = setTimeout(() => startCountdown(), 1500)
      return () => clearTimeout(t)
    }
  }, [phase])

  // Sla foto's op in sessionStorage en ga naar preview
  useEffect(() => {
    if (photos.length === TOTAL_PHOTOS) {
      sessionStorage.setItem('photos', JSON.stringify(photos))
      setTimeout(() => navigate('/preview'), 800)
    }
  }, [photos])

  function startCountdown() {
    setPhase('countdown')
    setCountdown(COUNTDOWN_START)
  }

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) {
      takePhoto()
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, phase])

  function takePhoto() {
    setPhase('flash')
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

    setPhotos(prev => {
      const next = [...prev, dataUrl]
      setTimeout(() => {
        if (next.length < TOTAL_PHOTOS) {
          setPhase('countdown')
          setCountdown(COUNTDOWN_START)
        } else {
          setPhase('done')
        }
      }, 600)
      return next
    })
  }

  return (
    <div style={styles.container}>
      {/* Live camera beeld */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={styles.video}
      />

      {/* Flits overlay */}
      {phase === 'flash' && <div style={styles.flash} />}

      {/* Countdown */}
      {phase === 'countdown' && countdown > 0 && (
        <div style={styles.countdown}>{countdown}</div>
      )}

      {/* Voortgang: thumbnails onderin */}
      <div style={styles.thumbnails}>
        {Array.from({ length: TOTAL_PHOTOS }).map((_, i) => (
          <div key={i} style={styles.thumb}>
            {photos[i]
              ? <img src={photos[i]} alt="" style={styles.thumbImg} />
              : <div style={styles.thumbEmpty}>{i + 1}</div>
            }
          </div>
        ))}
      </div>

      {/* Verborgen canvas voor opname */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    background: '#000',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // spiegel
  },
  flash: {
    position: 'absolute',
    inset: 0,
    background: '#fff',
    animation: 'none',
    opacity: 0.9,
    pointerEvents: 'none',
  },
  countdown: {
    position: 'absolute',
    fontSize: '160px',
    fontWeight: '700',
    color: '#fff',
    textShadow: '0 0 40px rgba(0,0,0,0.8)',
    pointerEvents: 'none',
  },
  thumbnails: {
    position: 'absolute',
    bottom: '24px',
    display: 'flex',
    gap: '12px',
  },
  thumb: {
    width: '64px',
    height: '48px',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbEmpty: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#555',
    fontSize: '18px',
    background: '#111',
  },
}
