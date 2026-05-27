import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function EmailScreen() {
  const navigate = useNavigate()
  const { config, API } = useApp()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const accent = config.accentColor || '#e63946'

  function isValid(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  function skip() {
    navigate('/payment')
  }

  async function confirm() {
    if (email && !isValid(email)) {
      setError('Vul een geldig e-mailadres in')
      return
    }
    if (email) {
      sessionStorage.setItem('email', email)
      // Best-effort: persist to session on backend
      const sessionId = sessionStorage.getItem('sessionId')
      if (sessionId) {
        fetch(`${API}/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => {})
      }
    }
    navigate('/payment')
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={{ ...s.iconWrap, background: accent + '22' }}>
          <span style={s.icon}>📱</span>
        </div>

        <h2 style={s.title}>Ontvang je strip digitaal</h2>
        <p style={s.sub}>
          Laat je e-mailadres achter en ontvang je fotostrip in je inbox.
          Helemaal optioneel.
        </p>

        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="jouw@email.nl"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          style={{ ...s.input, borderColor: error ? '#e63946' : 'var(--border)' }}
        />
        {error && <p style={s.error}>{error}</p>}

        <button style={{ ...s.btnPrimary, background: accent }} onClick={confirm}>
          {email ? 'Bewaren & doorgaan' : 'Doorgaan zonder e-mail'}
        </button>

        <button style={s.btnSkip} onClick={skip}>
          Overslaan
        </button>
      </div>
    </div>
  )
}

const s = {
  container: {
    width: '100%', height: '100%',
    background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%', maxWidth: 440,
    background: 'var(--bg2)',
    borderRadius: 24,
    padding: '40px 32px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 16,
    border: '1px solid var(--border)',
  },
  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  icon: { fontSize: 36 },
  title: { fontSize: 24, fontWeight: 700, textAlign: 'center' },
  sub: {
    fontSize: 15, color: 'var(--text2)', textAlign: 'center', lineHeight: 1.6,
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    background: 'var(--bg3)',
    border: '1.5px solid',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', fontSize: 17,
    marginTop: 8,
  },
  error: { fontSize: 13, color: '#e63946', alignSelf: 'flex-start' },
  btnPrimary: {
    width: '100%', padding: '18px',
    borderRadius: 'var(--radius)',
    color: '#fff', fontSize: 17, fontWeight: 700,
    marginTop: 8,
  },
  btnSkip: {
    background: 'none',
    color: 'var(--text3)', fontSize: 14,
    padding: '8px',
  },
}
