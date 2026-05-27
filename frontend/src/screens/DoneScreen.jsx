import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DoneScreen() {
  const navigate = useNavigate()
  const hasPrinted = useRef(false)

  useEffect(() => {
    // Automatisch printen via AirPrint zodra betaling gelukt is
    if (!hasPrinted.current) {
      hasPrinted.current = true
      setTimeout(() => printStrip(), 800)
    }

    // Na 30 seconden automatisch terug naar welkomscherm
    const timer = setTimeout(() => {
      sessionStorage.clear()
      navigate('/')
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  function printStrip() {
    const strip = sessionStorage.getItem('strip')
    if (!strip) return

    // Open een printvenster met de fotostrip
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; background: #fff; }
            img {
              width: 10cm;
              display: block;
              margin: 0 auto;
            }
            @media print {
              @page { margin: 0; size: 10cm auto; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <img src="${strip}" />
          <script>
            window.onload = function() {
              window.print()
              window.close()
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  function printAgain() {
    hasPrinted.current = false
    printStrip()
  }

  return (
    <div style={styles.container}>
      <div style={styles.icon}>🎉</div>
      <h1 style={styles.title}>Gelukt!</h1>
      <p style={styles.subtitle}>Je fotostrip wordt geprint</p>

      <div style={styles.info}>
        <p style={styles.infoText}>De print komt er zo aan via de Canon SELPHY</p>
      </div>

      <div style={styles.buttons}>
        <button style={styles.btnSecondary} onClick={printAgain}>
          Opnieuw printen
        </button>
        <button style={styles.btnPrimary} onClick={() => { sessionStorage.clear(); navigate('/') }}>
          Klaar
        </button>
      </div>

      <p style={styles.countdown}>Keert automatisch terug over 30 seconden</p>
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
    gap: '20px',
    padding: '24px',
    textAlign: 'center',
  },
  icon: { fontSize: '80px' },
  title: { fontSize: '48px', fontWeight: '700' },
  subtitle: { fontSize: '22px', color: '#aaa' },
  info: {
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '16px 24px',
    marginTop: '8px',
  },
  infoText: { fontSize: '16px', color: '#888' },
  buttons: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
  },
  btnSecondary: {
    padding: '14px 24px',
    background: 'transparent',
    border: '1px solid #333',
    borderRadius: '12px',
    color: '#aaa',
    fontSize: '16px',
    cursor: 'pointer',
  },
  btnPrimary: {
    padding: '14px 32px',
    background: '#fff',
    border: 'none',
    borderRadius: '12px',
    color: '#000',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  countdown: {
    fontSize: '13px',
    color: '#444',
    marginTop: '8px',
  },
}
