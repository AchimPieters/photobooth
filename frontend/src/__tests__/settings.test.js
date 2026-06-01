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

import { describe, it, expect, beforeEach } from 'vitest'
import { getSettings, saveSettings } from '../utils/settings'

const KEY = 'pb_settings'

describe('settings — stripTemplates per papierformaat', () => {
  beforeEach(() => localStorage.clear())

  it('default heeft een lege stripTemplates-map', () => {
    const s = getSettings()
    expect(s.stripTemplates).toEqual({})
  })

  it('migreert oude losse stripTemplate naar de map onder het strip-papier', () => {
    // Simuleer opgeslagen oude data (losse template + L-printer).
    localStorage.setItem(KEY, JSON.stringify({
      stripTemplate: 'data:image/png;base64,OLD',
      printers: [{ id: 'p1', name: 'SELPHY', paper: 'L' }],
      stripPrinterId: 'p1',
    }))
    const s = getSettings()
    expect(s.stripTemplates).toEqual({ L: 'data:image/png;base64,OLD' })
    expect(s.stripTemplate).toBeUndefined()
  })

  it('bewaart aparte templates per papierformaat', () => {
    saveSettings({ stripTemplates: { L: 'data:L', postcard: 'data:PC' } })
    const s = getSettings()
    expect(s.stripTemplates.L).toBe('data:L')
    expect(s.stripTemplates.postcard).toBe('data:PC')
  })
})
