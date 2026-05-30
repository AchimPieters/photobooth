import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useCamera } from '../hooks/useCamera'
import { useLang } from '../context/LangContext'
import { t } from '../utils/i18n'

// ── Gids-proporties (35:45 passport) ────────────────────────────────────────
const GUIDE_W_FRAC = 0.62   // 62% van schermbreedte

// Posities binnen de gids (als fractie van gidshoogte)
const EYE_FRAC   = 1 / 3   // ogen op ⅓ van boven (NL regelgeving)
const CROWN_FRAC = 0.08     // bovenkant hoofd op 8% van gids
const CHIN_FRAC  = 0.72     // kin op 72% van gids

function computeGuide() {
  const sw = window.innerWidth  || 768
  const sh = window.innerHeight || 1024
  const gW = Math.round(sw * GUIDE_W_FRAC)
  const gH = Math.round(gW * (45 / 35))          // exacte 35:45 verhouding
  const gX = Math.round((sw - gW) / 2)            // horizontaal gecentreerd
  const gY = Math.round(sh * 0.05)               // 5% van boven
  return { sw, sh, gX, gY, gW, gH }
}

// ── Exacte crop op basis van gidspositie ────────────────────────────────────
function cropToPassport(dataUrl, guide) {
  return new Promise(resolve => {
    if (!dataUrl) { resolve(null); return }
    const img = new Image()
    img.onerror = () => resolve(null)
    img.onload  = () => {
      const vw = img.width
      const vh = img.height
      const { sw, sh, gX, gY, gW, gH } = guide

      // objectFit:cover — bereken schaal en overflow
      const scaleFactor = Math.max(vw / sw, vh / sh)
      const displayW    = vw / scaleFactor
      const displayH    = vh / scaleFactor
      const overflowX   = (displayW - sw) / 2
      const overflowY   = (displayH - sh) / 2

      // Gids → videopixels
      let cropW = Math.round(gW * scaleFactor)
      let cropH = Math.round(gH * scaleFactor)
      const cropX = Math.round((vw - cropW) / 2)
      const cropY = Math.max(0, Math.round((gY + Math.max(0, overflowY)) * scaleFactor))

      // Klem binnen videogrenzen met behoud van 35:45 verhouding
      const maxH = vh - cropY
      const maxW = vw - Math.max(0, cropX)
      if (cropH > maxH) { cropH = maxH; cropW = Math.round(cropH * 35 / 45) }
      if (cropW > maxW) { cropW = maxW; cropH = Math.round(cropW * 45 / 35) }

      const finalX = Math.max(0, Math.round((vw - cropW) / 2))
      const finalY = cropY

      // Uitvoer op printresolutie (700×900 = 35×45mm op 20px/mm)
      const canvas = document.createElement('canvas')
      canvas.width  = 700
      canvas.height = 900
      canvas.getContext('2d').drawImage(img, finalX, finalY, cropW, cropH, 0, 0, 700, 900)
      resolve(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.src = dataUrl
  })
}

// ── Component ────────────────────────────────────────────────────────────────
export default function PassportCameraScreen({ onComplete, onBack }) {
  const lang = useLang()
  const { videoRef, ready, error, startCamera, stopCamera, takePhoto } = useCamera()
  const [busy,      setBusy]      = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [flash,     setFlash]     = useState(false)
  const guideRef = useRef(computeGuide())
  const guide    = guideRef.current

  useEffect(() => { startCamera() }, [startCamera])

  const shoot = useCallback(() => {
    if (busy || !ready) return
    setBusy(true)
    setCountdown(3)
    let c = 3
    const id = setInterval(() => {
      c--
      setCountdown(c)
      if (c <= 0) {
        clearInterval(id)
        setFlash(true)
        const raw = takePhoto()
        setTimeout(async () => {
          setFlash(false)
          const passport = raw ? await cropToPassport(raw, guideRef.current) : null
          if (passport) { stopCamera(); onComplete(passport) }
          else { setBusy(false); setCountdown(0) }
        }, 400)
      }
    }, 1000)
  }, [busy, ready, takePhoto, stopCamera, onComplete])

  // ── SVG-gids berekeningen ──────────────────────────────────────────────────
  const { sw, sh, gX, gY, gW, gH } = guide
  const eyeY    = gY + gH * EYE_FRAC
  const crownY  = gY + gH * CROWN_FRAC
  const chinY   = gY + gH * CHIN_FRAC
  const ovalCX  = gX + gW / 2
  const ovalCY  = gY + gH * (CROWN_FRAC + CHIN_FRAC) / 2   // midden hoofd-ovaal
  const ovalRX  = gW * 0.38
  const ovalRY  = gH * (CHIN_FRAC - CROWN_FRAC) / 2

  const isEn  = lang === 'en'
  const eyeLbl = isEn ? 'eye level' : 'oognivaeu'

  return (
    <div style={s.root}>
      <video ref={videoRef} playsInline muted autoPlay style={s.video} />

      {/* Flits */}
      <div style={{ ...s.flash, opacity: flash ? 1 : 0 }} />

      {/* SVG-gidsoverlay */}
      {!flash && (
        <svg
          style={s.svg}
          viewBox={`0 0 ${sw} ${sh}`}
        >
          <defs>
            {/* Masker: wit = donkere overlay; zwart = transparant venster */}
            <mask id="pmask">
              <rect x="0" y="0" width={sw} height={sh} fill="white" />
              <rect x={gX} y={gY} width={gW} height={gH} rx="6" ry="6" fill="black" />
            </mask>
          </defs>

          {/* Donkere overlay buiten gids */}
          <rect x="0" y="0" width={sw} height={sh}
            fill="rgba(0,0,0,0.55)" mask="url(#pmask)" />

          {/* Gidsrechthoek */}
          <rect x={gX} y={gY} width={gW} height={gH} rx="6" ry="6"
            fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />

          {/* Hoekmarkeringen */}
          {[
            `M${gX+18},${gY} L${gX},${gY} L${gX},${gY+18}`,
            `M${gX+gW-18},${gY} L${gX+gW},${gY} L${gX+gW},${gY+18}`,
            `M${gX},${gY+gH-18} L${gX},${gY+gH} L${gX+18},${gY+gH}`,
            `M${gX+gW-18},${gY+gH} L${gX+gW},${gY+gH} L${gX+gW},${gY+gH-18}`,
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          ))}

          {/* Hoofd-ovaal (hoofd inclusief haar) */}
          <ellipse cx={ovalCX} cy={ovalCY} rx={ovalRX} ry={ovalRY}
            fill="none" stroke="rgba(255,255,255,0.30)"
            strokeWidth="1.5" strokeDasharray="7 5" />

          {/* Kruin-markering */}
          <line x1={gX + gW * 0.28} y1={crownY} x2={gX + gW * 0.72} y2={crownY}
            stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Kin-markering */}
          <line x1={gX + gW * 0.22} y1={chinY} x2={gX + gW * 0.78} y2={chinY}
            stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Oog-niveau lijn (goud/geel) — NL vereiste: ⅓ van boven */}
          <line x1={gX + 12} y1={eyeY} x2={gX + gW - 12} y2={eyeY}
            stroke="rgba(255,210,0,0.90)" strokeWidth="1.8" strokeDasharray="9 5" />

          {/* Oog-niveau label */}
          <text x={gX + gW / 2} y={eyeY - 7}
            textAnchor="middle" fill="rgba(255,210,0,0.85)"
            fontSize={Math.round(gW * 0.055)} fontFamily="system-ui,sans-serif" fontWeight="600">
            {eyeLbl}
          </text>

          {/* Oog-icoontjes op de lijn */}
          <text x={gX + 22} y={eyeY + 5}
            textAnchor="middle" fill="rgba(255,210,0,0.85)"
            fontSize={Math.round(gW * 0.065)} fontFamily="system-ui,sans-serif">
            👁
          </text>
          <text x={gX + gW - 22} y={eyeY + 5}
            textAnchor="middle" fill="rgba(255,210,0,0.85)"
            fontSize={Math.round(gW * 0.065)} fontFamily="system-ui,sans-serif">
            👁
          </text>

          {/* Afmeting-label rechts van gids */}
          <text x={gX + gW + 10} y={gY + gH / 2 - 8}
            fill="rgba(255,255,255,0.40)" fontSize="12"
            fontFamily="system-ui,sans-serif">
            35×45
          </text>
          <text x={gX + gW + 10} y={gY + gH / 2 + 8}
            fill="rgba(255,255,255,0.40)" fontSize="12"
            fontFamily="system-ui,sans-serif">
            mm
          </text>
        </svg>
      )}

      {/* Aftelling */}
      {countdown > 0 && (
        <div style={s.countdown}>{countdown}</div>
      )}

      {/* Camera-fout */}
      {error && (
        <div style={s.errorBox}>
          <p style={s.errorText}>
            {error === 'camera-denied' ? t('pc.no_access', lang) : t('pc.unavailable', lang)}
          </p>
        </div>
      )}

      {/* Topbalk */}
      <div style={s.topBar}>
        <button style={s.closeBtn} onClick={() => { stopCamera(); onBack() }}>←</button>
        <span style={s.topLabel}>{t('pc.label', lang)}</span>
        <div style={{ width: 44 }} />
      </div>

      {/* Onderkant */}
      <div style={s.bottom}>
        <p style={s.hint}>
          {busy
            ? (countdown > 0 ? t('pc.still', lang) : t('pc.processing', lang))
            : t('pc.hint', lang)}
        </p>
        <button
          style={{ ...s.shutter, opacity: (busy || !ready) ? 0.35 : 1 }}
          onClick={shoot}
          disabled={busy || !ready}
        />
      </div>
    </div>
  )
}

const s = {
  root: {
    position: 'relative', flex: 1, background: '#000',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    minHeight: '100vh', minHeight: '-webkit-fill-available',
  },
  video: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover', transform: 'scaleX(-1)',
  },
  flash: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    background: '#fff', pointerEvents: 'none',
    transition: 'opacity 0.15s', zIndex: 10,
  },
  svg: {
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
    zIndex: 5, pointerEvents: 'none',
  },
  countdown: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    fontSize: 200, fontWeight: 900, color: '#fff', zIndex: 11,
    lineHeight: 1, textShadow: '0 0 40px rgba(0,0,0,0.5)',
  },
  topBar: {
    position: 'relative', zIndex: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 20px 0',
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  topLabel: {
    background: 'rgba(0,0,0,0.4)', color: '#fff',
    fontSize: 17, fontWeight: 600, padding: '8px 16px', borderRadius: 14,
  },
  bottom: {
    position: 'relative', zIndex: 6, marginTop: 'auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 14, paddingBottom: 50, paddingTop: 16,
  },
  hint: { color: 'rgba(255,255,255,0.85)', fontSize: 17, fontWeight: 500, textAlign: 'center', paddingHorizontal: 20 },
  shutter: {
    width: 90, height: 90, borderRadius: '50%', background: '#fff',
    boxShadow: '0 0 0 6px rgba(255,255,255,0.35)',
    transition: 'opacity 0.2s',
  },
  errorBox: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  errorText: {
    color: 'rgba(255,255,255,0.85)', fontSize: 20,
    textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.6,
  },
}
