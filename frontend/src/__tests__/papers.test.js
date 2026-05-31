import { describe, it, expect } from 'vitest'
import { PAPERS, DEFAULT_PAPER, getPaper, paperPx, mmToPx, paperLabel } from '../utils/papers'

describe('papers', () => {
  it('standaard is L-formaat 89×119 mm', () => {
    expect(DEFAULT_PAPER).toBe('L')
    expect(PAPERS.L.wmm).toBe(89)
    expect(PAPERS.L.hmm).toBe(119)
  })

  it('Postcard is 100×148 mm (printgebied)', () => {
    expect(PAPERS.postcard.wmm).toBe(100)
    expect(PAPERS.postcard.hmm).toBe(148)
  })

  it('Card is 54×86 mm', () => {
    expect(PAPERS.card.wmm).toBe(54)
    expect(PAPERS.card.hmm).toBe(86)
  })

  it('mmToPx rekent 300 dpi correct (89mm → 1051px)', () => {
    expect(mmToPx(89)).toBe(1051)
    expect(mmToPx(25.4)).toBe(300)
  })

  it('paperPx geeft pixelmaten voor L', () => {
    const px = paperPx('L')
    expect(px.w).toBe(mmToPx(89))
    expect(px.h).toBe(mmToPx(119))
    expect(px.id).toBe('L')
  })

  it('onbekend formaat valt terug op default', () => {
    expect(getPaper('nope').id).toBe(DEFAULT_PAPER)
    expect(paperPx(undefined).id).toBe(DEFAULT_PAPER)
  })

  it('label is tweetalig', () => {
    expect(paperLabel('L', 'nl')).toMatch(/L-formaat/)
    expect(paperLabel('L', 'en')).toMatch(/L size/)
  })
})
