import React, { useState } from 'react'

const STEPS = [
  {
    icon: '🪑',
    title: 'Ga rechtop zitten',
    body: 'Zit recht voor de camera op ongeveer één armslengte afstand. Rug recht, schouders ontspannen.',
  },
  {
    icon: '↕️',
    title: 'Hoofd recht houden',
    body: 'Houd je hoofd recht — niet omhoog of omlaag kantelen. Kin evenwijdig aan de grond.',
  },
  {
    icon: '👁️',
    title: 'Kijk recht in de lens',
    body: 'Kijk direct in de camera. Draai je hoofd niet naar links of rechts — beide oren moeten even ver van de camera zijn.',
  },
  {
    icon: '😐',
    title: 'Neutrale uitdrukking',
    body: 'Ontspannen gezicht, mond gesloten. Geen glimlach. Dit is een officiële vereiste voor paspoort en rijbewijs.',
  },
  {
    icon: '👂',
    title: 'Maak je oren vrij',
    body: 'Haar achter de oren of opgebonden. Beide oren moeten volledig zichtbaar zijn op de foto.',
  },
  {
    icon: '🚫',
    title: 'Geen bril of hoofdbedekking',
    body: 'Verwijder bril, zonnebril, pet of hoed. Religieuze hoofdbedekking is toegestaan mits het gezicht volledig vrij blijft.',
  },
  {
    icon: '💡',
    title: 'Let op de belichting',
    body: 'Zorg voor gelijkmatige verlichting op je gezicht. Geen schaduwen op je gezicht of achter je hoofd. Witte of lichte achtergrond.',
  },
]

export default function PassportInstructionScreen({ onReady, onBack }) {
  const [step, setStep] = useState(0)
  const total   = STEPS.length
  const current = STEPS[step]
  const isLast  = step === total - 1
  const fillPct = ((step + 1) / total) * 100

  return (
    <div style={s.root}>
      {/* Topbalk */}
      <div style={s.topBar}>
        <button style={s.navBtn} onClick={step === 0 ? onBack : () => setStep(n => n - 1)}>
          ←
        </button>
        <span style={s.counter}>Stap {step + 1} van {total}</span>
        <div style={{ width: 44 }} />
      </div>

      {/* Voortgangsbalk */}
      <div style={s.track}>
        <div style={{ ...s.fill, width: `${fillPct}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* Instructie-kaart */}
      <div style={s.card}>
        <div style={s.icon}>{current.icon}</div>
        <h2 style={s.title}>{current.title}</h2>
        <p style={s.body}>{current.body}</p>
      </div>

      {/* Actie */}
      <div style={s.actions}>
        {isLast
          ? <button style={s.readyBtn} onClick={onReady}>📷  Camera openen</button>
          : <button style={s.nextBtn}  onClick={() => setStep(n => n + 1)}>Volgende  →</button>
        }
      </div>
    </div>
  )
}

const s = {
  root: {
    flex: 1, display: 'flex', flexDirection: 'column',
    background: 'linear-gradient(135deg,#1a1a2e,#0f3460)',
    minHeight: '100vh', minHeight: '-webkit-fill-available',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 20px 0',
  },
  navBtn: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  counter: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600 },
  track: {
    margin: '16px 24px 0',
    height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)',
  },
  fill: { height: '100%', borderRadius: 2, background: '#e94560' },
  card: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '0 40px', gap: 20,
  },
  icon: { fontSize: 90, lineHeight: 1 },
  title: { color: '#fff', fontSize: 36, fontWeight: 700, textAlign: 'center', margin: 0 },
  body: {
    color: 'rgba(255,255,255,0.7)', fontSize: 20, lineHeight: 1.6,
    textAlign: 'center', margin: 0,
  },
  actions: { padding: '0 40px 50px' },
  nextBtn: {
    width: '100%', padding: '26px', borderRadius: 18,
    background: 'linear-gradient(90deg,#e94560,#c0392b)',
    color: '#fff', fontSize: 22, fontWeight: 600,
    boxShadow: '0 6px 20px rgba(233,69,96,0.4)',
  },
  readyBtn: {
    width: '100%', padding: '26px', borderRadius: 18,
    background: 'linear-gradient(90deg,#27ae60,#1e8449)',
    color: '#fff', fontSize: 22, fontWeight: 600,
    boxShadow: '0 6px 20px rgba(39,174,96,0.4)',
  },
}
