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

import { describe, it, expect, afterEach } from 'vitest'
import config, { getConfig, stripOverlayForPaper, stripTemplateStatus } from '../utils/config'
import { saveSettings } from '../utils/settings'

describe('AppConfig', () => {
  it('prijs is groter dan 0',        () => expect(config.price).toBeGreaterThan(0))
  it('currency is EUR',              () => expect(config.currency).toBe('EUR'))
  it('totalPhotos is 4 (default L)', () => expect(config.totalPhotos).toBe(4))
  it('countdownSecs is positief',    () => expect(config.countdownSecs).toBeGreaterThan(0))
  it('autoRestartSecs is positief',  () => expect(config.autoRestartSecs).toBeGreaterThan(0))
  it('stripFooter is niet leeg',     () => expect(config.stripFooter.length).toBeGreaterThan(0))
  it('baseUrl begint met https',     () => expect(config.baseUrl).toMatch(/^https/))

  it('totalPhotos volgt het papierformaat van de strip-printer', () => {
    saveSettings({
      printers: [{ id: 'p1', name: 'SELPHY', paper: 'card' }],
      stripPrinterId: 'p1',
    })
    expect(getConfig().totalPhotos).toBe(3) // card → 3

    saveSettings({
      printers: [{ id: 'p1', name: 'SELPHY', paper: 'postcard' }],
      stripPrinterId: 'p1',
    })
    expect(getConfig().totalPhotos).toBe(5) // postcard → 5
  })

  afterEach(() => localStorage.clear())
})

describe('template-waarborg (stripOverlayForPaper / stripTemplateStatus)', () => {
  afterEach(() => localStorage.clear())

  const base = {
    printers: [{ id: 'p1', name: 'SELPHY', paper: 'L' }],
    stripPrinterId: 'p1',
    stripFooter: 'Event 2026', // footer aan
    stripTemplates: { L: 'data:image/png;base64,AAAA' },
  }

  it('past de overlay toe als meta matcht', () => {
    saveSettings({ ...base, stripTemplateMeta: { L: { photoCount: 4, hasFooter: true } } })
    expect(stripTemplateStatus('L').matches).toBe(true)
    expect(stripOverlayForPaper('L')).toMatch(/^data:/)
  })

  it('laat de overlay weg als de footer-status afwijkt', () => {
    saveSettings({ ...base, stripTemplateMeta: { L: { photoCount: 4, hasFooter: false } } })
    expect(stripTemplateStatus('L').matches).toBe(false)
    expect(stripOverlayForPaper('L')).toBeNull()
  })

  it('onbekende meta = passend (backwards compatible)', () => {
    saveSettings({ ...base, stripTemplateMeta: {} })
    expect(stripOverlayForPaper('L')).toMatch(/^data:/)
  })

  it('geen template → geen overlay', () => {
    saveSettings({ printers: base.printers, stripPrinterId: 'p1', stripTemplates: {} })
    expect(stripOverlayForPaper('L')).toBeNull()
  })
})
