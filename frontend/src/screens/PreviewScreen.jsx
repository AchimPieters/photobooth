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

import React, { useEffect, useState } from 'react'
import { buildPrintSheet } from '../utils/photoStrip'
import config, { paperForProduct, stripOverlayForPaper, stripTemplateOpacityForPaper } from '../utils/config'
import { useLang } from '../context/LangContext'
import { t } from '../utils/i18n'

export default function PreviewScreen({ photos, onPay, onRetry }) {
  const lang = useLang()
  const [stripUrl, setStripUrl]   = useState(null)
  const [loading,  setLoading]    = useState(true)

  useEffect(() => {
    const paper = paperForProduct('strip')
    // stripOverlayForPaper laat de overlay weg als de template niet (meer) bij
    // de huidige strip-instellingen past → liever een schone strip dan scheef.
    buildPrintSheet(photos, {
      paper,
      footerText: config.stripFooter,
      bgColor: config.stripBg,
      overlay: stripOverlayForPaper(paper),
      overlayOpacity: stripTemplateOpacityForPaper(paper),
    })
      .then(url => { setStripUrl(url); setLoading(false) })
  }, [photos])

  return (
    <div style={s.root}>
      <h2 style={s.title}>{t('prev.title', lang)}</h2>

      <div style={s.preview}>
        {loading
          ? <div style={s.spinner}><div style={s.spin} />{t('prev.building', lang)}</div>
          : stripUrl && <img src={stripUrl} alt="Fotostrip" style={s.img} />
        }
      </div>

      <div style={s.actions}>
        <button style={s.payBtn} onClick={() => onPay(stripUrl)} disabled={loading}>
          {t('prev.pay', lang, { price: config.price.toFixed(2) })}
        </button>
        <button style={s.retryBtn} onClick={onRetry}>
          {t('prev.retry', lang)}
        </button>
      </div>
    </div>
  )
}

const s = {
  root: { flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', minHeight: '100vh', minHeight: '-webkit-fill-available', padding: '40px 0 50px' },
  title: { color: '#fff', fontSize: 40, fontWeight: 700, textAlign: 'center', marginBottom: 20 },
  preview: { flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 40px' },
  img: { width: '100%', maxWidth: 400, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.6)' },
  spinner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: 'rgba(255,255,255,0.6)', fontSize: 18 },
  spin: { width: 48, height: 48, border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#e94560', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  actions: { padding: '20px 50px 0', display: 'flex', flexDirection: 'column', gap: 16 },
  payBtn: { padding: '24px', borderRadius: 18, background: 'linear-gradient(90deg,#e94560,#c0392b)', color: '#fff', fontSize: 22, fontWeight: 600, boxShadow: '0 6px 20px rgba(233,69,96,0.4)' },
  retryBtn: { padding: '18px', borderRadius: 18, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: 500 },
}
