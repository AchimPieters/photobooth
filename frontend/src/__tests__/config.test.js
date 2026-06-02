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
import config, {
  getConfig, getActiveTemplate, paperForProduct,
  stripOverlayActive, stripTemplateStatus,
} from '../utils/config'
import { saveSettings, DEFAULT_STRIP_TEMPLATE, DEFAULT_PASSPORT_TEMPLATE } from '../utils/settings'

describe('AppConfig', () => {
  afterEach(() => localStorage.clear())

  it('prijs is groter dan 0',        () => expect(config.price).toBeGreaterThan(0))
  it('currency is EUR',              () => expect(config.currency).toBe('EUR'))
  it('countdownSecs is positief',    () => expect(config.countdownSecs).toBeGreaterThan(0))
  it('autoRestartSecs is positief',  () => expect(config.autoRestartSecs).toBeGreaterThan(0))
  it('baseUrl is automatisch afgeleid (url)', () => expect(config.baseUrl).toMatch(/^https?:\/\//))

  it('default: totalPhotos = aantal van de actieve strip-template (4)', () => {
    expect(getConfig().totalPhotos).toBe(DEFAULT_STRIP_TEMPLATE.photoCount)
    expect(getConfig().totalPhotos).toBe(4)
  })

  it('papier komt uit de actieve template per product', () => {
    expect(paperForProduct('strip')).toBe(DEFAULT_STRIP_TEMPLATE.paper)       // L
    expect(paperForProduct('passport')).toBe(DEFAULT_PASSPORT_TEMPLATE.paper) // postcard
  })

  it('actieve template wisselen verandert totalPhotos + papier', () => {
    saveSettings({
      templates: [
        { id: 's1', name: 'A', product: 'strip', paper: 'card', photoCount: 3, footer: '', bg: '#000', overlay: null, overlayOpacity: 1, designedFor: null },
        { id: 'p1', name: 'P', product: 'passport', paper: 'postcard', photoCount: 6 },
      ],
      activeStripTemplateId: 's1',
      activePassportTemplateId: 'p1',
    })
    expect(getConfig().totalPhotos).toBe(3)
    expect(paperForProduct('strip')).toBe('card')
    expect(getConfig().passportPhotoCount).toBe(6)
  })
})

describe('overlay-waarborg (stripOverlayActive / stripTemplateStatus)', () => {
  afterEach(() => localStorage.clear())

  const withOverlay = (designedFor, footer = 'Event 2026') => ({
    templates: [
      { id: 's1', name: 'A', product: 'strip', paper: 'L', photoCount: 4, footer, bg: '#000',
        overlay: 'data:image/png;base64,AAAA', overlayOpacity: 1, designedFor },
      { id: 'p1', name: 'P', product: 'passport', paper: 'postcard', photoCount: 6 },
    ],
    activeStripTemplateId: 's1', activePassportTemplateId: 'p1',
  })

  it('past de overlay toe als designedFor matcht', () => {
    saveSettings(withOverlay({ photoCount: 4, hasFooter: true }))
    expect(stripTemplateStatus().matches).toBe(true)
    expect(stripOverlayActive()).toMatch(/^data:/)
  })

  it('laat de overlay weg als de footer-status afwijkt', () => {
    saveSettings(withOverlay({ photoCount: 4, hasFooter: false }))
    expect(stripTemplateStatus().matches).toBe(false)
    expect(stripOverlayActive()).toBeNull()
  })

  it('onbekende designedFor = passend (backwards compatible)', () => {
    saveSettings(withOverlay(null))
    expect(stripOverlayActive()).toMatch(/^data:/)
  })

  it('geen overlay → null', () => {
    saveSettings({
      templates: [
        { id: 's1', name: 'A', product: 'strip', paper: 'L', photoCount: 4, footer: '', bg: '#000', overlay: null, overlayOpacity: 1, designedFor: null },
        { id: 'p1', name: 'P', product: 'passport', paper: 'postcard', photoCount: 6 },
      ],
      activeStripTemplateId: 's1', activePassportTemplateId: 'p1',
    })
    expect(stripOverlayActive()).toBeNull()
  })
})
