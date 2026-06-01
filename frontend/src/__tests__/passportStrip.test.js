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
import { passportGrid, passportCount } from '../utils/passportStrip'

describe('passportGrid / passportCount', () => {
  it('L-formaat (89×119 mm) → 2×2 = 4 pasfoto\'s', () => {
    expect(passportGrid('L')).toMatchObject({ cols: 2, rows: 2, count: 4 })
    expect(passportCount('L')).toBe(4)
  })

  it('Postcard (100×148 mm) → meer foto\'s dan L', () => {
    expect(passportCount('postcard')).toBeGreaterThan(passportCount('L'))
  })

  it('Card (54×86 mm) → past maar één pasfoto', () => {
    expect(passportCount('card')).toBe(1)
  })

  it('max 2 kolommen, ongeacht velbreedte', () => {
    expect(passportGrid('postcard').cols).toBeLessThanOrEqual(2)
  })

  it('onbekend formaat valt terug op default (L) → 4', () => {
    expect(passportCount(undefined)).toBe(4)
  })
})
