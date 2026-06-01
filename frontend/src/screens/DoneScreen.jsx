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

import React, { useEffect, useState, useRef } from 'react'
import config from '../utils/config'
import { useLang } from '../context/LangContext'
import { t } from '../utils/i18n'

export default function DoneScreen({ stripDataUrl, onRestart, licensed }) {
  const lang = useLang()
  const [secs, setSecs] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    // Lees config vers bij mount zodat admin-wijzigingen direct effect hebben
    const total = config.autoRestartSecs
    setSecs(total)

    if (stripDataUrl && licensed) {
      setTimeout(() => window.print(), 800)
    }

    timerRef.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current); onRestart(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [stripDataUrl, licensed, onRestart])

  return (
    <div style={s.root}>
      <div style={s.top}>
        <div style={s.check}>✓</div>
        <h2 style={s.title}>{t('done.title', lang)}</h2>
        <p style={s.sub}>{t('done.sub', lang)}</p>
      </div>

      {stripDataUrl && (
        <img src={stripDataUrl} alt="strip" style={s.strip} />
      )}

      {!licensed && (
        <div style={s.demoBox}>
          <p style={s.demoText}>{t('done.no_print', lang)}</p>
          <p style={s.demoSub}>{t('done.no_print_sub', lang)}</p>
        </div>
      )}

      <div style={s.actions}>
        {licensed && (
          <button style={s.reprintBtn} onClick={() => window.print()}>
            {t('done.reprint', lang)}
          </button>
        )}
        <button style={s.restartBtn} onClick={() => { clearInterval(timerRef.current); onRestart() }}>
          {t('done.restart', lang, { secs })}
        </button>
      </div>
    </div>
  )
}

const s = {
  root: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', minHeight: '100vh', minHeight: '-webkit-fill-available', padding: '40px 0 50px', gap: 20 },
  top: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  check: { width: 120, height: 120, borderRadius: '50%', background: 'rgba(39,174,96,0.15)', color: '#27ae60', fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  title: { color: '#fff', fontSize: 52, fontWeight: 900 },
  sub: { color: 'rgba(255,255,255,0.7)', fontSize: 24, fontWeight: 300 },
  strip: { width: '45%', maxWidth: 280, borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', flexShrink: 0 },
  actions: { width: '100%', padding: '0 50px', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 'auto' },
  demoBox: { background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 14, padding: '14px 20px', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
  demoText: { color: '#e94560', fontSize: 17, fontWeight: 700, marginBottom: 4 },
  demoSub: { color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.4 },
  reprintBtn: { padding: '22px', borderRadius: 18, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 20, fontWeight: 600 },
  restartBtn: { padding: '22px', borderRadius: 18, background: 'linear-gradient(90deg,#e94560,#c0392b)', color: '#fff', fontSize: 22, fontWeight: 600, boxShadow: '0 6px 20px rgba(233,69,96,0.4)' },
}
