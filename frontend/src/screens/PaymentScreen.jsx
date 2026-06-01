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

import React, { useState, useEffect } from 'react'
import config from '../utils/config'
import { useLang } from '../context/LangContext'
import { t } from '../utils/i18n'

function buildSumUpUrl(txId, token, price, title) {
  const params = new URLSearchParams({
    'affiliate-key':       config.sumupAffiliateKey,
    amount:                price.toFixed(2),
    currency:              config.currency,
    title:                 title || 'Fotostrip',
    'foreign-tx-id':       txId,
    'skip-screen-success': 'true',
    callbacksuccess:       `${config.baseUrl}?payment=success&token=${token}`,
    callbackfail:          `${config.baseUrl}?payment=fail`,
  })
  return `sumupmerchant://pay/1.0?${params.toString()}`
}

function makeToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function PaymentScreen({ stripDataUrl, paymentStatus, onSuccess, onFail, onBack, price: priceProp, productTitle, licensed }) {
  const lang  = useLang()
  const price = priceProp ?? config.price
  const [txId]    = useState(() => `pb-${Date.now()}`)
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    if (paymentStatus === 'success') onSuccess()
    if (paymentStatus === 'failed')  setWaiting(false)
  }, [paymentStatus, onSuccess])

  const openSumUp = () => {
    const token = makeToken()
    localStorage.setItem('pb_pay_token', token)
    setWaiting(true)
    window.location.href = buildSumUpUrl(txId, token, price, productTitle)
  }

  return (
    <div style={s.root}>
      <div style={s.center}>
        <span style={s.icon}>💳</span>
        <h2 style={s.title}>{t('pay.title', lang)}</h2>
        <p style={s.amount}>€{price.toFixed(2)}</p>

        {!licensed && (
          <div style={s.demoBox}>
            <p style={s.demoText}>{t('pay.no_lic', lang)}</p>
            <p style={s.demoSub}>{t('pay.no_lic_sub', lang)}</p>
          </div>
        )}
        {licensed && waiting && (
          <p style={s.waiting}>{t('pay.waiting', lang)}</p>
        )}
        {licensed && paymentStatus === 'failed' && (
          <p style={s.error}>{t('pay.failed', lang)}</p>
        )}
      </div>

      <div style={s.actions}>
        <button
          style={{ ...s.payBtn, opacity: licensed ? 1 : 0.3 }}
          onClick={licensed ? openSumUp : undefined}
          disabled={!licensed}
        >
          {t('pay.btn', lang)}
        </button>
        <button style={s.backBtn} onClick={onBack}>
          {t('pay.back', lang)}
        </button>
      </div>
    </div>
  )
}

const s = {
  root: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', minHeight: '100vh', minHeight: '-webkit-fill-available', padding: '40px 0 50px' },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  icon: { fontSize: 80 },
  title: { color: '#fff', fontSize: 48, fontWeight: 700 },
  amount: { color: '#e94560', fontSize: 72, fontWeight: 900 },
  waiting: { color: 'rgba(255,255,255,0.6)', fontSize: 18, marginTop: 8 },
  error: { color: '#e94560', fontSize: 18, marginTop: 8 },
  demoBox: { marginTop: 16, background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.2)', borderRadius: 14, padding: '16px 20px', textAlign: 'center', maxWidth: 320 },
  demoText: { color: '#e94560', fontSize: 18, fontWeight: 700, marginBottom: 6 },
  demoSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.5 },
  actions: { padding: '0 50px', display: 'flex', flexDirection: 'column', gap: 16 },
  payBtn: { padding: '26px', borderRadius: 18, background: 'linear-gradient(90deg,#e94560,#c0392b)', color: '#fff', fontSize: 24, fontWeight: 600, boxShadow: '0 6px 20px rgba(233,69,96,0.4)' },
  backBtn: { padding: '18px', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 18 },
}
