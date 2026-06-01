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

import { describe, it, expect } from 'vitest'
import { PAPERS, DEFAULT_PAPER, getPaper, paperPx, mmToPx, paperLabel, stripPhotoCount } from '../utils/papers'

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

  it('strip-fotoaantal ligt vast per papierformaat', () => {
    expect(stripPhotoCount('L')).toBe(4)
    expect(stripPhotoCount('postcard')).toBe(5)
    expect(stripPhotoCount('card')).toBe(3)
  })

  it('onbekend formaat valt terug op default-aantal (L → 4)', () => {
    expect(stripPhotoCount('nope')).toBe(4)
    expect(stripPhotoCount(undefined)).toBe(4)
  })
})
