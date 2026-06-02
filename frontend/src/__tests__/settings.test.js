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

describe('settings — template-model', () => {
  beforeEach(() => localStorage.clear())

  it('default heeft een strip- én pasfoto-template met geldige actieve ids', () => {
    const s = getSettings()
    const strip = s.templates.find(t => t.id === s.activeStripTemplateId)
    const pass  = s.templates.find(t => t.id === s.activePassportTemplateId)
    expect(strip.product).toBe('strip')
    expect(pass.product).toBe('passport')
    expect(strip.photoCount).toBeGreaterThan(0)
  })

  it('migreert oude printers + per-papier template naar het template-model', () => {
    localStorage.setItem(KEY, JSON.stringify({
      stripTemplate: 'data:image/png;base64,OLD',
      printers: [{ id: 'p1', name: 'SELPHY', paper: 'card' }],
      stripPrinterId: 'p1',
      passportPrinterId: 'p1',
      stripFooter: 'Oud event',
      stripBg: '#112233',
    }))
    const s = getSettings()
    // Oude losse keys zijn opgeruimd.
    expect(s.printers).toBeUndefined()
    expect(s.stripTemplates).toBeUndefined()
    expect(s.stripFooter).toBeUndefined()
    // Strip-template overgenomen van de oude strip-printer (card).
    const strip = s.templates.find(t => t.product === 'strip')
    expect(strip.paper).toBe('card')
    expect(strip.photoCount).toBe(3)          // stripPhotoCount('card')
    expect(strip.footer).toBe('Oud event')
    expect(strip.bg).toBe('#112233')
    expect(strip.overlay).toBe('data:image/png;base64,OLD')
    // Pasfoto-template aanwezig.
    expect(s.templates.some(t => t.product === 'passport')).toBe(true)
  })

  it('bewaart en herleest templates + actieve ids', () => {
    saveSettings({
      templates: [
        { id: 's1', name: 'A', product: 'strip', paper: 'postcard', photoCount: 5, footer: '', bg: '#000', overlay: null, overlayOpacity: 1, designedFor: null },
        { id: 'p1', name: 'P', product: 'passport', paper: 'postcard', photoCount: 6 },
      ],
      activeStripTemplateId: 's1',
      activePassportTemplateId: 'p1',
    })
    const s = getSettings()
    expect(s.templates).toHaveLength(2)
    expect(s.activeStripTemplateId).toBe('s1')
    expect(s.templates.find(t => t.id === 's1').photoCount).toBe(5)
  })

  it('corrigeert een ongeldige actieve id naar de eerste van het product', () => {
    saveSettings({
      templates: [
        { id: 's1', name: 'A', product: 'strip', paper: 'L', photoCount: 4, footer: '', bg: '#000', overlay: null, overlayOpacity: 1, designedFor: null },
        { id: 'p1', name: 'P', product: 'passport', paper: 'postcard', photoCount: 6 },
      ],
      activeStripTemplateId: 'does-not-exist',
      activePassportTemplateId: 'p1',
    })
    const s = getSettings()
    expect(s.activeStripTemplateId).toBe('s1')
  })
})
