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

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages: https://achimpieters.github.io/photobooth/
  base: '/photobooth/',

  plugins: [
    react(),

    // iOS 12 Safari compatibiliteit
    legacy({
      targets: ['ios >= 12', 'safari >= 12'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),

    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Verouderde caches direct opruimen + nieuwe service-worker meteen
        // activeren, zodat een deploy niet achter een oude cache blijft hangen.
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // NetworkFirst: probeer altijd eerst de nieuwste versie van het
            // netwerk; val alleen terug op de cache als er geen verbinding is.
            // Voorkomt dat de PWA een verouderde app-versie blijft tonen.
            urlPattern: /^https:\/\/achimpieters\.github\.io\/photobooth\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'photobooth-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50 },
            },
          },
        ],
      },
      manifest: {
        name: 'Photobooth',
        short_name: 'Photobooth',
        description: '4 foto\'s, direct printen',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/photobooth/',
        start_url: '/photobooth/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon.svg',     sizes: 'any',     type: 'image/svg+xml' },
        ],
      },
    }),
  ],

  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
})
