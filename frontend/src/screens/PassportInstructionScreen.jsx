import React, { useState } from 'react'
import { useLang } from '../context/LangContext'
import { t } from '../utils/i18n'

const STEP_ICONS = ['🪑', '↕️', '👁️', '😐', '👂', '🚫', '💡']
const STEP_KEYS  = ['s1', 's2', 's3', 's4', 's5', 's6', 's7']

export default function PassportInstructionScreen({ onReady, onBack }) {
  const lang  = useLang()
  const [step, setStep] = useState(0)
  const total  = STEP_KEYS.length
  const isLast = step === total - 1
  const fillPct = ((step + 1) / total) * 100

  return (
    <div style={s.root}>
      <div style={s.topBar}>
        <button style={s.navBtn} onClick={step === 0 ? onBack : () => setStep(n => n - 1)}>←</button>
        <span style={s.counter}>{t('pi.step', lang, { n: step + 1, total })}</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={s.track}>
        <div style={{ ...s.fill, width: `${fillPct}%`, transition: 'width 0.3s ease' }} />
      </div>

      <div style={s.card}>
        <div style={s.icon}>{STEP_ICONS[step]}</div>
        <h2 style={s.title}>{t(`pi.${STEP_KEYS[step]}.title`, lang)}</h2>
        <p style={s.body}>{t(`pi.${STEP_KEYS[step]}.body`, lang)}</p>
      </div>

      <div style={s.actions}>
        {isLast
          ? <button style={s.readyBtn} onClick={onReady}>{t('pi.open_cam', lang)}</button>
          : <button style={s.nextBtn}  onClick={() => setStep(n => n + 1)}>{t('pi.next', lang)}</button>
        }
      </div>
    </div>
  )
}

const s = {
  root: { flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', minHeight: '100vh', minHeight: '-webkit-fill-available' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' },
  navBtn: { width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  counter: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600 },
  track: { margin: '16px 24px 0', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)' },
  fill: { height: '100%', borderRadius: 2, background: '#e94560' },
  card: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', gap: 20 },
  icon: { fontSize: 90, lineHeight: 1 },
  title: { color: '#fff', fontSize: 36, fontWeight: 700, textAlign: 'center', margin: 0 },
  body: { color: 'rgba(255,255,255,0.7)', fontSize: 20, lineHeight: 1.6, textAlign: 'center', margin: 0 },
  actions: { padding: '0 40px 50px' },
  nextBtn: { width: '100%', padding: '26px', borderRadius: 18, background: 'linear-gradient(90deg,#e94560,#c0392b)', color: '#fff', fontSize: 22, fontWeight: 600, boxShadow: '0 6px 20px rgba(233,69,96,0.4)' },
  readyBtn: { width: '100%', padding: '26px', borderRadius: 18, background: 'linear-gradient(90deg,#27ae60,#1e8449)', color: '#fff', fontSize: 22, fontWeight: 600, boxShadow: '0 6px 20px rgba(39,174,96,0.4)' },
}
