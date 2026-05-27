import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// Vul hier je SumUp affiliate key in (dashboard.sumup.com → Developers)
const SUMUP_AFFILIATE_KEY = 'JOUW_AFFILIATE_KEY_HIER'
const PRICE = 3.00
const CURRENCY = 'EUR'

export default function PaymentScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('waiting') // waiting | opening | success | fail

  // Terugkeer van SumUp app via callback URL
  useEffect(() => {
    const result = searchParams.get('payment')
    if (result === 'success') {
      setStatus('success')
      setTimeout(() => navigate('/done'), 1500)
    } else if (result === 'fail') {
      setStatus('fail')
    }
  }, [searchParams])

  function openSumUp() {
    setStatus('opening')

    // Unieke transactie ID
    const txId = `photobooth-${Date.now()}`

    // Callback URLs — vervang door jouw domeinnaam
    const baseUrl = window.location.origin
    const callbackSuccess = `${baseUrl}/payment?payment=success`
    const callbackFail = `${baseUrl}/payment?payment=fail`

    // SumUp URL scheme — opent de SumUp app op de iPad
    const sumupUrl = [
      `sumupmerchant://pay/1.0`,
      `?affiliate-key=${SUMUP_AFFILIATE_KEY}`,
      `&amount=${PRICE.toFixed(2)}`,
      `&currency=${CURRENCY}`,
      `&title=Fotostrip`,
      `&foreign-tx-id=${txId}`,
      `&skip-screen-success=true`,
      `&callbacksuccess=${encodeURIComponent(callbackSuccess)}`,
      `&callbackfail=${encodeURIComponent(callbackFail)}`,
    ].join('')

    window.location.href = sumupUrl
  }

  if (status === 'success') {
    return (
      <div style={{ ...styles.container, gap: '16px' }}>
        <div style={{ fontSize: '80px' }}>✅</div>
        <p style={{ fontSize: '24px' }}>Betaling geslaagd!</p>
      </div>
    )
  }

  if (status === 'fail') {
    return (
      <div style={{ ...styles.container, gap: '16px' }}>
        <div style={{ fontSize: '80px' }}>❌</div>
        <p style={{ fontSize: '24px' }}>Betaling mislukt</p>
        <button style={styles.btn} onClick={() => setStatus('waiting')}>
          Probeer opnieuw
        </button>
        <button style={{ ...styles.btn, background: 'transparent', color: '#666', border: '1px solid #333' }}
          onClick={() => navigate('/preview')}>
          Terug
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.priceBox}>
        <p style={styles.priceLabel}>Te betalen</p>
        <p style={styles.price}>€{PRICE.toFixed(2)}</p>
      </div>

      <div style={styles.instructions}>
        <p style={styles.step}>1. Tik op "Betalen"</p>
        <p style={styles.step}>2. SumUp opent automatisch</p>
        <p style={styles.step}>3. Houd je pas bij de terminal</p>
      </div>

      <button
        style={styles.btn}
        onClick={openSumUp}
        disabled={status === 'opening'}
      >
        {status === 'opening' ? 'SumUp opent...' : '💳 Betalen'}
      </button>

      <button
        style={{ background: 'none', border: 'none', color: '#555', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}
        onClick={() => navigate('/preview')}
      >
        Terug
      </button>
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
    justifyContent: 'center',
    gap: '32px',
    padding: '24px',
  },
  priceBox: {
    textAlign: 'center',
  },
  priceLabel: {
    fontSize: '16px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  price: {
    fontSize: '72px',
    fontWeight: '700',
    letterSpacing: '-2px',
  },
  instructions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    textAlign: 'center',
  },
  step: {
    fontSize: '18px',
    color: '#888',
  },
  btn: {
    padding: '18px 48px',
    background: '#fff',
    border: 'none',
    borderRadius: '14px',
    color: '#000',
    fontSize: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '240px',
  },
}
