import { describe, it, expect } from 'vitest'
import config from '../utils/config'

describe('AppConfig', () => {
  it('prijs is groter dan 0',        () => expect(config.price).toBeGreaterThan(0))
  it('currency is EUR',              () => expect(config.currency).toBe('EUR'))
  it('totalPhotos is 4',             () => expect(config.totalPhotos).toBe(4))
  it('countdownSecs is positief',    () => expect(config.countdownSecs).toBeGreaterThan(0))
  it('autoRestartSecs is positief',  () => expect(config.autoRestartSecs).toBeGreaterThan(0))
  it('stripFooter is niet leeg',     () => expect(config.stripFooter.length).toBeGreaterThan(0))
  it('baseUrl begint met https',     () => expect(config.baseUrl).toMatch(/^https/))
})
