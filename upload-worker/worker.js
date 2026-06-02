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

// Photobooth foto-upload Worker (Cloudflare + R2).
//
// - POST /            → slaat een JPEG op in R2, geeft { url } terug.
// - GET  /p/<id>      → mobiele downloadpagina (foto + downloadknop).
// - GET  /p/<id>?raw=1→ de ruwe JPEG.
//
// Foto's verlopen na RETENTION_HOURS (runtime-check + R2-lifecycle als backstop).
// Een optionele UPLOAD_KEY (secret) beschermt het uploaden tegen misbruik.

const MAX_BYTES = 8 * 1024 * 1024

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Key',
    'Access-Control-Max-Age': '86400',
  }
}
function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status, headers: { 'Content-Type': 'application/json', ...cors(origin) },
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) })

    // ── Upload ──
    if (request.method === 'POST' && url.pathname === '/') {
      if (env.UPLOAD_KEY && request.headers.get('X-Upload-Key') !== env.UPLOAD_KEY) {
        return json({ error: 'unauthorized' }, 401, origin)
      }
      const ct = request.headers.get('Content-Type') || ''
      if (!ct.startsWith('image/')) return json({ error: 'image only' }, 415, origin)
      const body = await request.arrayBuffer()
      if (body.byteLength === 0) return json({ error: 'empty' }, 400, origin)
      if (body.byteLength > MAX_BYTES) return json({ error: 'too large' }, 413, origin)

      const id = crypto.randomUUID().replace(/-/g, '')
      await env.PHOTOS.put(`p/${id}.jpg`, body, {
        httpMetadata: { contentType: 'image/jpeg' },
        customMetadata: { created: String(Date.now()) },
      })
      return json({ url: `${url.origin}/p/${id}` }, 200, origin)
    }

    // ── Ophalen ──
    if (request.method === 'GET' && url.pathname.startsWith('/p/')) {
      const id = url.pathname.slice(3).replace(/[^a-z0-9]/gi, '')
      const key = `p/${id}.jpg`
      const obj = await env.PHOTOS.get(key)
      if (!obj) return htmlResponse(gonePage(), 404)

      const created = Number(obj.customMetadata?.created || 0)
      const hours = Number(env.RETENTION_HOURS || 24)
      if (created && Date.now() - created > hours * 3600 * 1000) {
        await env.PHOTOS.delete(key)
        return htmlResponse(gonePage(), 410)
      }

      if (url.searchParams.get('raw') === '1') {
        return new Response(obj.body, {
          headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=3600' },
        })
      }
      return htmlResponse(viewerPage(id))
    }

    return new Response('Not found', { status: 404 })
  },
}

function htmlResponse(html, status = 200) {
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

function viewerPage(id) {
  return `<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Jouw foto</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;
       background:linear-gradient(135deg,#1a1a2e,#0f3460);font-family:-apple-system,system-ui,sans-serif;color:#fff;padding:24px}
  img{max-width:92vw;max-height:64vh;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.6)}
  a{display:inline-block;padding:16px 28px;border-radius:14px;background:linear-gradient(90deg,#e94560,#c0392b);
    color:#fff;font-size:18px;font-weight:600;text-decoration:none}
  p{opacity:.6;font-size:14px;margin:0}
</style></head><body>
  <img src="/p/${id}?raw=1" alt="Foto">
  <a href="/p/${id}?raw=1" download="photobooth.jpg">⬇ Foto downloaden</a>
  <p>Tip: lang indrukken om op te slaan in je fotorol.</p>
</body></html>`
}

function gonePage() {
  return `<!doctype html><html lang="nl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Foto niet meer beschikbaar</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#1a1a2e,#0f3460);font-family:-apple-system,system-ui,sans-serif;color:#fff;text-align:center;padding:24px}</style>
</head><body><div><h2>⏳ Foto niet meer beschikbaar</h2><p>Deze foto is verlopen en verwijderd.</p></div></body></html>`
}
