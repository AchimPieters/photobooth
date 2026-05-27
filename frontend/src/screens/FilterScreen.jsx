import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export const FILTERS = [
  { id: 'none',    label: 'Origineel',  css: 'none' },
  { id: 'bw',      label: 'Zwart-wit',  css: 'grayscale(1)' },
  { id: 'vintage', label: 'Vintage',    css: 'sepia(0.6) contrast(1.1) brightness(1.05)' },
  { id: 'vivid',   label: 'Vivid',      css: 'saturate(1.8) contrast(1.1)' },
  { id: 'cool',    label: 'Cool',       css: 'hue-rotate(200deg) saturate(1.2)' },
  { id: 'warm',    label: 'Warm',       css: 'sepia(0.25) saturate(1.4) brightness(1.05)' },
]

export default function FilterScreen() {
  const navigate = useNavigate()
  const { config } = useApp()
  const photos = JSON.parse(sessionStorage.getItem('photos') || '[]')
  const [selected, setSelected] = useState('none')

  if (photos.length < 4) { navigate('/'); return null }

  const accent = config.accentColor || '#e63946'
  const preview = photos[0]
  const activeFilter = FILTERS.find(f => f.id === selected)

  function confirm() {
    sessionStorage.setItem('filter', selected)
    navigate('/preview')
  }

  return (
    <div style={s.container}>
      <p style={s.label}>Kies een filter</p>

      {/* Big preview */}
      <div style={s.previewWrap}>
        <img
          src={preview}
          alt=""
          style={{ ...s.previewImg, filter: activeFilter.css }}
        />
      </div>

      {/* Filter strip */}
      <div style={s.strip}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            style={{
              ...s.filterBtn,
              borderColor: selected === f.id ? accent : 'transparent',
            }}
            onClick={() => setSelected(f.id)}
          >
            <img
              src={preview}
              alt={f.label}
              style={{ ...s.filterThumb, filter: f.css }}
            />
            <span style={{
              ...s.filterLabel,
              color: selected === f.id ? accent : 'var(--text2)',
              fontWeight: selected === f.id ? 700 : 400,
            }}>
              {f.label}
            </span>
          </button>
        ))}
      </div>

      <button style={{ ...s.confirmBtn, background: accent }} onClick={confirm}>
        Doorgaan →
      </button>
    </div>
  )
}

const s = {
  container: {
    width: '100%', height: '100%',
    background: 'var(--bg)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 24px 28px',
    gap: 20,
  },
  label: {
    fontSize: 14, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600,
  },
  previewWrap: {
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    maxHeight: 'calc(100% - 260px)',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
  },
  previewImg: {
    maxWidth: '100%', maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: 'var(--radius)',
    transition: 'filter 250ms ease',
  },
  strip: {
    display: 'flex', gap: 12,
    overflowX: 'auto', paddingBottom: 4,
    width: '100%',
  },
  filterBtn: {
    flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6,
    background: 'var(--bg2)',
    border: '2px solid',
    borderRadius: 'var(--radius-sm)',
    padding: 6,
    cursor: 'pointer',
    transition: 'border-color 200ms',
  },
  filterThumb: {
    width: 72, height: 54,
    objectFit: 'cover',
    borderRadius: 6,
  },
  filterLabel: {
    fontSize: 11,
    transition: 'color 200ms',
  },
  confirmBtn: {
    width: '100%', maxWidth: 400,
    padding: '18px',
    borderRadius: 'var(--radius)',
    fontSize: 18, fontWeight: 700, color: '#fff',
  },
}
