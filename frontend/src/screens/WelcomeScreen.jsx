import React, { useEffect, useRef, useState } from 'react'
import config from '../utils/config'

const styles = {
  root: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: '100vh', minHeight: '-webkit-fill-available',
    padding: '40px 0 50px',
  },
  top: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  icon: { fontSize: 100, lineHeight: 1, transition: 'transform 1.8s ease-in-out', cursor: 'default', userSelect: 'none' },
  title: { fontSize: 64, fontWeight: 700, color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 24, fontWeight: 300, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 },
  bottom: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '0 60px' },
  btn: {
    width: '100%', padding: '28px 0', borderRadius: 20,
    background: 'linear-gradient(90deg, #e94560, #c0392b)',
    color: '#fff', fontSize: 30, fontWeight: 600,
    boxShadow: '0 8px 30px rgba(233,69,96,0.5)',
    transition: 'transform 0.1s, opacity 0.1s',
  },
  price: { fontSize: 18, fontWeight: 300, color: 'rgba(255,255,255,0.4)' },
}

export default function WelcomeScreen({ onStart, onAdmin }) {
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
    <div style={styles.root}>
      <div style={styles.top}>
        <div
          style={{ ...styles.icon, transform: `scale(${pulse ? 1.06 : 1.0})` }}
          onClick={handleIconTap}
        >
          ⦿
        </div>
        <h1 style={styles.title}>Photobooth</h1>
        <p style={styles.subtitle}>4 foto's · direct printen</p>
      </div>
      <div style={styles.bottom}>
        <button style={styles.btn} onClick={onStart}>
          Tik om te beginnen
        </button>
        <p style={styles.price}>€{config.price.toFixed(2)} per strip</p>
      </div>
    </div>
  )
}
