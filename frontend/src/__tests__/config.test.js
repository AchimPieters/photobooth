import { describe, it, expect, afterEach } from 'vitest'
import config, { getConfig } from '../utils/config'
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
