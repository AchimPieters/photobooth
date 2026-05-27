import { useNavigate } from 'react-router-dom'

export default function WelcomeScreen() {
  const navigate = useNavigate()

  return (
    <div style={styles.container} onClick={() => navigate('/camera')}>
      <div style={styles.content}>
        <div style={styles.icon}>📸</div>
        <h1 style={styles.title}>Photobooth</h1>
        <p style={styles.subtitle}>Tik om te beginnen</p>
      </div>
      <p style={styles.hint}>4 foto's · fotostrip · direct printen</p>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  icon: {
    fontSize: '80px',
  },
  title: {
    fontSize: '48px',
    fontWeight: '700',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '24px',
    color: '#aaa',
    fontWeight: '300',
  },
  hint: {
    position: 'absolute',
    bottom: '40px',
    fontSize: '14px',
    color: '#555',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
}
