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
