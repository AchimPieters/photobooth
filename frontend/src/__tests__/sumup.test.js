import { describe, it, expect } from 'vitest'
import config from '../utils/config'

describe('SumUp URL opbouw', () => {
  function buildUrl(txId) {
    const base = `${config.baseUrl}?payment=`
    const params = new URLSearchParams({
      'affiliate-key':       config.sumupAffiliateKey,
      amount:                config.price.toFixed(2),
      currency:              config.currency,
      title:                 'Fotostrip',
      'foreign-tx-id':       txId,
      'skip-screen-success': 'true',
      callbacksuccess:       `${base}success`,
      callbackfail:          `${base}fail`,
    })
    return `sumupmerchant://pay/1.0?${params.toString()}`
  }

  it('URL begint met sumupmerchant://', () => {
    expect(buildUrl('tx-123')).toMatch(/^sumupmerchant:\/\//)
  })

  it('URL bevat het juiste bedrag', () => {
    const url = buildUrl('tx-123')
    expect(url).toContain(`amount=${config.price.toFixed(2)}`)
  })

  it('URL bevat currency EUR', () => {
    expect(buildUrl('tx-123')).toContain('currency=EUR')
  })

  it('URL bevat success-callback', () => {
    expect(buildUrl('tx-abc')).toContain('callbacksuccess=')
  })

  it('URL bevat fail-callback', () => {
    expect(buildUrl('tx-abc')).toContain('callbackfail=')
  })

  it('success en fail callback bevatten baseUrl', () => {
    const url = buildUrl('tx-xyz')
    expect(url).toContain(encodeURIComponent(config.baseUrl))
  })
})
