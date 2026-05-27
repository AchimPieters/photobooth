import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'

export default function AdminPin() {
  const navigate = useNavigate()
  const { verifyPin } = useApp()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  async function submit(value) {
    if (value.length < 4) return
    setChecking(true)
    const ok = await verifyPin(value)
    setChecking(false)
    if (ok) {
      sessionStorage.setItem('adminPin', value)
      navigate('/admin/dashboard')
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 1200)
    }
  }

  function press(d) {
    if (pin.length >= 6) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) submit(next)
  }

  function del() { setPin(p => p.slice(0, -1)) }

  return (
    <div style={s.container}>
      <button style={s.back} onClick={() => navigate('/')}>← Terug</button>

      <div style={s.card}>
        <p style={s.label}>Admin toegang</p>

        {/* PIN dots */}
        <div style={s.dots}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              ...s.dot,
              background: error
                ? '#ef4444'
                : i < pin.length ? '#fff' : 'var(--bg3)',
              transform: error ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 200ms',
            }} />
          ))}
        </div>

        {error && <p style={s.errorMsg}>Onjuiste PIN</p>}
        {checking && <p style={s.checking}>Controleren…</p>}

        {/* Numpad */}
        <div style={s.numpad}>
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((d, i) => (
            <button
              key={i}
              style={{
                ...s.key,
                opacity: d === '' ? 0 : 1,
                pointerEvents: d === '' ? 'none' : 'auto',
              }}
              onClick={() => d === '⌫' ? del() : d !== '' && press(String(d))}
            >
              {d}
            </button>
          ))}
        </div>
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
    padding: 24,
  },
  back: {
    position: 'absolute', top: 24, left: 24,
    background: 'none', color: 'var(--text3)', fontSize: 16,
  },
  card: {
    width: '100%', maxWidth: 320,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 28,
  },
  label: { fontSize: 14, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px' },
  dots: { display: 'flex', gap: 16 },
  dot: { width: 18, height: 18, borderRadius: 50 },
  errorMsg: { fontSize: 14, color: '#ef4444', marginTop: -12 },
  checking: { fontSize: 14, color: 'var(--text2)', marginTop: -12 },
  numpad: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12, width: '100%',
  },
  key: {
    aspectRatio: '1',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)', fontSize: 24, fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 150ms',
  },
}
