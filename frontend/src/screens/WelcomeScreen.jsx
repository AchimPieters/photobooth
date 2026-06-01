import React, { useEffect, useRef, useState } from 'react'
import config, { paperForProduct } from '../utils/config'
import { passportCount } from '../utils/passportStrip'
import { t } from '../utils/i18n'

const BASE = import.meta.env.BASE_URL

export default function WelcomeScreen({ onStartStrip, onStartPassport, onAdmin, licensed, lang, onChangeLang }) {
  const [pulse, setPulse] = useState(false)
  const tapCount = useRef(0)
  const tapTimer = useRef(null)
  const passportN = passportCount(paperForProduct('passport'))

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
    <div style={s.root}>
      {/* Taalswitch */}
      <div style={s.langBar}>
        <button style={{ ...s.langBtn, ...(lang === 'nl' ? s.langActive : {}) }} onClick={() => onChangeLang('nl')}>
          🇳🇱 NL
        </button>
        <button style={{ ...s.langBtn, ...(lang === 'en' ? s.langActive : {}) }} onClick={() => onChangeLang('en')}>
          🇬🇧 EN
        </button>
      </div>

      {/* Logo */}
      <div style={s.top}>
        <img
          src={`${BASE}icons/icon.svg`}
          alt="Photobooth"
          style={{ ...s.icon, transform: `scale(${pulse ? 1.06 : 1.0})` }}
          onClick={handleIconTap}
          draggable={false}
        />
        <h1 style={s.title}>Photobooth</h1>
      </div>

      {/* Status: alleen de demo-melding tonen; bij een geldige licentie geen
          (groene) licentienaam meer op het startscherm. */}
      {!licensed && <p style={s.demoBadge}>{t('demo.badge', lang)}</p>}

      {/* Keuze-knoppen */}
      <div style={s.modes}>
        <button style={s.modeCard} onClick={onStartStrip}>
          <span style={s.modeIcon}>📸</span>
          <span style={s.modeTitle}>{t('strip.title', lang)}</span>
          <span style={s.modeSub}>{t('strip.sub', lang, { n: config.totalPhotos })}</span>
          <span style={s.modePrice}>€{config.price.toFixed(2)}</span>
        </button>

        <button style={{ ...s.modeCard, ...s.modeCardPassport }} onClick={onStartPassport}>
          <span style={s.modeIcon}>🪪</span>
          <span style={s.modeTitle}>{t('passport.title', lang)}</span>
          <span style={s.modeSub}>{t('passport.sub', lang)}</span>
          <span style={s.modePrice}>€{config.passportPrice.toFixed(2)} — {passportN} {lang === 'en' ? 'photos' : "foto's"}</span>
        </button>
      </div>
    </div>
  )
}

const s = {
  root: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: '100vh', minHeight: '-webkit-fill-available',
    padding: '16px 0 50px',
  },
  langBar: {
    alignSelf: 'flex-end', display: 'flex', gap: 8, padding: '0 20px',
  },
  langBtn: {
    padding: '8px 14px', borderRadius: 20,
    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)',
    fontSize: 14, fontWeight: 600,
  },
  langActive: {
    background: 'rgba(255,255,255,0.18)', color: '#fff',
  },
  top: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  },
  icon: {
    width: 110, height: 110,
    transition: 'transform 1.8s ease-in-out',
    cursor: 'default', userSelect: 'none',
    borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 56, fontWeight: 700, color: '#fff', letterSpacing: -1, margin: 0,
  },
  modes: {
    width: '100%', padding: '0 40px', display: 'flex', flexDirection: 'column', gap: 20,
  },
  modeCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    gap: 4, padding: '28px 30px', borderRadius: 22,
    background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)',
    textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  modeCardPassport: {
    background: 'rgba(233,69,96,0.08)', border: '1.5px solid rgba(233,69,96,0.25)',
  },
  modeIcon:  { fontSize: 44, lineHeight: 1, marginBottom: 4 },
  modeTitle: { color: '#fff', fontSize: 30, fontWeight: 700 },
  modeSub:   { color: 'rgba(255,255,255,0.55)', fontSize: 17 },
  modePrice: { marginTop: 8, color: '#e94560', fontSize: 20, fontWeight: 700 },
  demoBadge: {
    background: 'rgba(233,69,96,0.12)', color: '#e94560',
    fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
    padding: '8px 18px', borderRadius: 20, border: '1px solid rgba(233,69,96,0.3)',
  },
}
