/**
   Copyright 2026 Achim Pieters | StudioPieters®

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

   for more information visit https://www.studiopieters.nl
 **/

import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useCamera } from '../hooks/useCamera'
import { useLang } from '../context/LangContext'
import { t } from '../utils/i18n'

// ── Gids-proporties ──────────────────────────────────────────────────────────
const GUIDE_W_PCT  = 62    // % van schermbreedte
const GUIDE_TOP_PC = 5     // % van schermhoogte (bovenmarge)
const EYE_PC       = 33.3  // % van gidshoogte   (NL: ogen op ⅓ van boven)
const CROWN_PC     = 8     // % van gidshoogte   (bovenkant hoofd)
const CHIN_PC      = 72    // % van gidshoogte   (kin)

// ── Exacte crop — rekening houdend met objectFit:cover ───────────────────────
function cropToPassport(dataUrl) {
  return new Promise(resolve => {
    if (!dataUrl) { resolve(null); return }
    const img = new Image()
    img.onerror = () => resolve(null)
    img.onload  = () => {
      const vw = img.width
      const vh = img.height
      const sw = window.innerWidth  || 768
      const sh = window.innerHeight || 1024

      // objectFit:cover schaalt de video zodat deze het scherm volledig bedekt.
      // displayScale = hoe groot 1 videopixel op het scherm verschijnt (in CSS px).
      const displayScale = Math.max(sw / vw, sh / vh)

      // Hoeveel steekt de video buiten het scherm (in CSS px)?
      const overflowX = Math.max(0, (vw * displayScale - sw) / 2)
      const overflowY = Math.max(0, (vh * displayScale - sh) / 2)

      // Gids in schermcoördinaten (CSS px)
      const gW_px = sw * GUIDE_W_PCT / 100
      const gH_px = gW_px * (45 / 35)           // exacte 35:45 verhouding
      const gY_px = sh * GUIDE_TOP_PC / 100

      // Gids → videopixels (deel door displayScale, corrigeer voor overflow)
      const cropW = Math.round(gW_px / displayScale)
      const cropH = Math.round(gH_px / displayScale)
      const cropX = Math.round((vw - cropW) / 2)              // altijd gecentreerd
      const cropY = Math.round((gY_px + overflowY) / displayScale)

      // Klem binnen videogrenzen met behoud van 35:45 verhouding
      const availH = vh - Math.max(0, cropY)
      let finalW = cropW
      let finalH = cropH
      if (finalH > availH) { finalH = availH; finalW = Math.round(finalH * 35 / 45) }
      if (finalW > vw)     { finalW = vw;     finalH = Math.round(finalW * 45 / 35) }

      const finalX = Math.round((vw - finalW) / 2)
      const finalY = Math.max(0, cropY)

      // Uitvoer: 700×900px = 35×45mm bij 20px/mm printresolutie
      const canvas = document.createElement('canvas')
      canvas.width  = 700
      canvas.height = 900
      canvas.getContext('2d').drawImage(img, finalX, finalY, finalW, finalH, 0, 0, 700, 900)
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
          const passport = raw ? await cropToPassport(raw) : null
          if (passport) { stopCamera(); onComplete(passport) }
          else { setBusy(false); setCountdown(0) }
        }, 400)
      }
    }, 1000)
  }, [busy, ready, takePhoto, stopCamera, onComplete])

  const isEn = lang === 'en'

  return (
    <div style={s.root}>
      <video ref={videoRef} playsInline muted autoPlay style={s.video} />

      {/* Flits */}
      <div style={{ ...s.flash, opacity: flash ? 1 : 0 }} />

      {/* ── Gids-overlay ────────────────────────────────────────────────── */}
      {!flash && (
        <div style={s.guideWrap} aria-hidden>

          {/* Paspoortfoto-kader — box-shadow dekt alles buiten het kader af */}
          <div style={s.guide}>

            {/* Binnenste positionerings-container (100%×100% van het kader) */}
            <div style={s.guideInner}>

              {/* Hoofd-ovaal */}
              <svg style={s.ovalSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
                <ellipse
                  cx="50" cy={((CROWN_PC + CHIN_PC) / 2).toFixed(1)}
                  rx="38" ry={((CHIN_PC - CROWN_PC) / 2).toFixed(1)}
                  fill="none"
                  stroke="rgba(255,255,255,0.30)"
                  strokeWidth="1.2"
                  strokeDasharray="5 4"
                />
              </svg>

              {/* Kruin-marker */}
              <div style={{ ...s.dashLine, top: `${CROWN_PC}%`, left: '20%', right: '20%' }} />

              {/* Kin-marker */}
              <div style={{ ...s.dashLine, top: `${CHIN_PC}%`, left: '15%', right: '15%' }} />

              {/* Oog-niveau lijn (goud, NL vereiste: ⅓ van boven) */}
              <div style={{ ...s.eyeLine, top: `${EYE_PC}%` }}>
                <span style={s.eyeLabel}>
                  {isEn ? '👁 eye level' : '👁 oogniveau'}
                </span>
              </div>

            </div>

            {/* Hoekmarkeringen */}
            {['tl','tr','bl','br'].map(c => <Corner key={c} pos={c} />)}
          </div>

          {/* 35×45mm label rechts van het kader */}
          <div style={s.sizeLabel}>35×45<br/>mm</div>
        </div>
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

// Hoekmarkering-component
function Corner({ pos }) {
  const t = pos[0] === 't'  // top
  const l = pos[1] === 'l'  // left
  const size = 18
  return (
    <div style={{
      position: 'absolute',
      top:    t ? 0 : 'auto', bottom: t ? 'auto' : 0,
      left:   l ? 0 : 'auto', right:  l ? 'auto' : 0,
      width: size, height: size,
      borderTop:    t ? '2.5px solid rgba(255,255,255,0.9)' : 'none',
      borderBottom: t ? 'none' : '2.5px solid rgba(255,255,255,0.9)',
      borderLeft:   l ? '2.5px solid rgba(255,255,255,0.9)' : 'none',
      borderRight:  l ? 'none' : '2.5px solid rgba(255,255,255,0.9)',
    }} />
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const GUIDE_LEFT = `${(100 - GUIDE_W_PCT) / 2}%`
const GUIDE_H_PB = `${GUIDE_W_PCT * 45 / 35}%`  // padding-bottom truc voor 35:45

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

  // Wrapper voor de gids (absolute, zindex 5)
  guideWrap: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 5, pointerEvents: 'none',
    display: 'flex', alignItems: 'flex-start',
  },

  // Paspoortfoto-kader: width=GUIDE_W_PCT%, hoogte via paddingBottom, gecentreerd
  guide: {
    position: 'absolute',
    left: GUIDE_LEFT,
    top: `${GUIDE_TOP_PC}%`,
    width: `${GUIDE_W_PCT}%`,
    paddingBottom: GUIDE_H_PB,
    border: '1.5px solid rgba(255,255,255,0.8)',
    borderRadius: 6,
    // Donkere overlay buiten het kader
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
  },

  // Positionerings-container die 100%×100% van het kader vult
  guideInner: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
  },

  // SVG voor de ovale hoofdcontour
  ovalSvg: {
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
  },

  // Gestippelde horizontale markerlijn
  dashLine: {
    position: 'absolute',
    height: 0,
    borderTop: '1px dashed rgba(255,255,255,0.25)',
  },

  // Oog-niveaulijn (goud/geel)
  eyeLine: {
    position: 'absolute',
    left: '8%', right: '8%',
    borderTop: '1.5px dashed rgba(255,210,0,0.90)',
    display: 'flex', justifyContent: 'center',
  },
  eyeLabel: {
    position: 'absolute',
    top: -18,
    color: 'rgba(255,210,0,0.90)',
    fontSize: 11, fontWeight: 700,
    whiteSpace: 'nowrap',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  },

  // 35×45mm label rechts van het kader
  sizeLabel: {
    position: 'absolute',
    top: `${GUIDE_TOP_PC}%`,
    left: `${(100 + GUIDE_W_PCT) / 2 + 1}%`,
    color: 'rgba(255,255,255,0.40)',
    fontSize: 11, lineHeight: 1.4, fontWeight: 600,
    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
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
  hint: {
    color: 'rgba(255,255,255,0.85)', fontSize: 17, fontWeight: 500,
    textAlign: 'center', paddingLeft: 20, paddingRight: 20,
  },
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
