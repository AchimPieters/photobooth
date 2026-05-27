import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function PaymentScreen() {
  const navigate = useNavigate()
  const { config } = useApp()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('idle') // idle | opening | success | fail

  const accent = config.accentColor || '#e63946'

  useEffect(() => {
    const result = searchParams.get('payment')
    if (result === 'success') {
      sessionStorage.setItem('paid', '1')
      setStatus('success')
      setTimeout(() => navigate('/done'), 1200)
    } else if (result === 'fail') {
      setStatus('fail')
    }
  }, [searchParams])

  function openSumUp() {
    if (!config.sumupKey) {
      // Dev mode: skip payment
      sessionStorage.setItem('paid', '1')
      navigate('/done')
      return
    }
    setStatus('opening')
    const txId = sessionStorage.getItem('sessionId')
      ? `photobooth-${sessionStorage.getItem('sessionId')}`
      : `photobooth-${Date.now()}`

    const base = window.location.origin
    const url = [
      'sumupmerchant://pay/1.0',
      `?affiliate-key=${encodeURIComponent(config.sumupKey)}`,
      `&amount=${Number(config.price).toFixed(2)}`,
      `&currency=${config.currency || 'EUR'}`,
      `&title=${encodeURIComponent(config.eventName || 'Fotostrip')}`,
      `&foreign-tx-id=${encodeURIComponent(txId)}`,
      `&skip-screen-success=true`,
      `&callbacksuccess=${encodeURIComponent(`${base}/payment?payment=success`)}`,
      `&callbackfail=${encodeURIComponent(`${base}/payment?payment=fail`)}`,
    ].join('')
    window.location.href = url
  }

  if (status === 'success') {
    return (
      <div style={{ ...s.container, gap: 20 }}>
        <div style={{ ...s.iconCircle, background: '#22c55e22', border: '2px solid #22c55e' }}>
          <span style={{ fontSize: 48 }}>✓</span>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>Betaling geslaagd!</h2>
        <p style={{ color: 'var(--text2)' }}>Je strip wordt nu gedrukt…</p>
      </div>
    )
  }

  if (status === 'fail') {
    return (
      <div style={{ ...s.container, gap: 20 }}>
        <div style={{ ...s.iconCircle, background: '#ef444422', border: '2px solid #ef4444' }}>
          <span style={{ fontSize: 48 }}>✕</span>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>Betaling mislukt</h2>
        <p style={{ color: 'var(--text2)', textAlign: 'center', maxWidth: 300 }}>
          Probeer opnieuw of gebruik een andere betaalmethode.
        </p>
        <button style={{ ...s.btnPrimary, background: accent }} onClick={() => setStatus('idle')}>
          Opnieuw proberen
        </button>
        <button style={s.btnGhost} onClick={() => navigate('/preview')}>← Terug</button>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <div style={s.priceCard}>
        <p style={s.priceLabel}>Te betalen</p>
        <p style={{ ...s.price, color: accent }}>
          €{Number(config.price).toFixed(2)}
        </p>
      </div>

      <div style={s.steps}>
        {[
          ['1', 'Tik op "Betalen"'],
          ['2', 'SumUp opent automatisch'],
          ['3', 'Houd je pas bij de terminal'],
        ].map(([n, txt]) => (
          <div key={n} style={s.step}>
            <span style={{ ...s.stepNum, background: accent }}>{n}</span>
            <span style={s.stepTxt}>{txt}</span>
          </div>
        ))}
      </div>

      <button
        style={{ ...s.btnPrimary, background: status === 'opening' ? '#333' : accent }}
        onClick={openSumUp}
        disabled={status === 'opening'}
      >
        {status === 'opening' ? 'SumUp opent…' : '💳 Betalen'}
      </button>

      <button style={s.btnGhost} onClick={() => navigate('/preview')}>← Terug</button>
    </div>
  )
}

const s = {
  container: {
    width: '100%', height: '100%',
    background: 'var(--bg)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 32, padding: 32,
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  priceCard: {
    textAlign: 'center', padding: '24px 48px',
    background: 'var(--bg2)', borderRadius: 20,
    border: '1px solid var(--border)',
  },
  priceLabel: { fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 },
  price: { fontSize: 72, fontWeight: 800, letterSpacing: '-2px' },
  steps: { display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 360 },
  step: { display: 'flex', alignItems: 'center', gap: 16 },
  stepNum: {
    width: 28, height: 28, borderRadius: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  stepTxt: { fontSize: 17, color: 'var(--text2)' },
  btnPrimary: {
    width: '100%', maxWidth: 360, padding: '20px',
    borderRadius: 'var(--radius)', fontSize: 20, fontWeight: 700, color: '#fff',
    transition: 'background 200ms',
  },
  btnGhost: {
    background: 'none', color: 'var(--text3)', fontSize: 15,
  },
}
