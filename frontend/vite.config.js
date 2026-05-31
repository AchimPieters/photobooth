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
