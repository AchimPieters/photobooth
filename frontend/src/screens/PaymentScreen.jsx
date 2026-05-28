import React, { useState, useEffect } from 'react'
import config from '../utils/config'

function buildSumUpUrl(txId) {
  const base = `${config.baseUrl}?payment=`
  const params = new URLSearchParams({
    'affiliate-key':     config.sumupAffiliateKey,
    amount:              config.price.toFixed(2),
    currency:            config.currency,
    title:               'Fotostrip',
    'foreign-tx-id':     txId,
    'skip-screen-success': 'true',
    callbacksuccess:     `${base}success`,
    callbackfail:        `${base}fail`,
  })
  return `sumupmerchant://pay/1.0?${params.toString()}`
}

export default function PaymentScreen({ stripDataUrl, paymentStatus, onSuccess, onFail, onBack }) {
  const [txId]    = useState(() => `pb-${Date.now()}`)
  const [waiting, setWaiting] = useState(false)

  // Als de pagina terug laadt na SumUp-callback (via App.jsx)
  useEffect(() => {
    if (paymentStatus === 'success') onSuccess()
    if (paymentStatus === 'failed')  setWaiting(false)
  }, [paymentStatus, onSuccess])

  const openSumUp = () => {
    setWaiting(true)
    window.location.href = buildSumUpUrl(txId)
  }

  return (
    <div style={s.root}>
      <div style={s.center}>
        <span style={s.icon}>💳</span>
        <h2 style={s.title}>Betaling</h2>
        <p style={s.amount}>€{config.price.toFixed(2)}</p>

        {waiting && (
          <p style={s.waiting}>Wachten op bevestiging…</p>
        )}
        {paymentStatus === 'failed' && (
          <p style={s.error}>⚠️  Betaling mislukt — probeer opnieuw</p>
        )}
      </div>

      <div style={s.actions}>
        <button style={s.payBtn} onClick={openSumUp}>
          Betalen met SumUp  ↗
        </button>
        <button style={s.backBtn} onClick={onBack}>
          ← Terug naar preview
        </button>
      </div>
    </div>
  )
}

const s = {
  root: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', minHeight: '100vh', minHeight: '-webkit-fill-available', padding: '40px 0 50px' },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  icon: { fontSize: 80 },
  title: { color: '#fff', fontSize: 48, fontWeight: 700 },
  amount: { color: '#e94560', fontSize: 72, fontWeight: 900 },
  waiting: { color: 'rgba(255,255,255,0.6)', fontSize: 18, marginTop: 8 },
  error: { color: '#e94560', fontSize: 18, marginTop: 8 },
  actions: { padding: '0 50px', display: 'flex', flexDirection: 'column', gap: 16 },
  payBtn: { padding: '26px', borderRadius: 18, background: 'linear-gradient(90deg,#e94560,#c0392b)', color: '#fff', fontSize: 24, fontWeight: 600, boxShadow: '0 6px 20px rgba(233,69,96,0.4)' },
  backBtn: { padding: '18px', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 18 },
}
