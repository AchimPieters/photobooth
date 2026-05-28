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
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/achimpieters\.github\.io\/photobooth\//,
            handler: 'CacheFirst',
            options: { cacheName: 'photobooth-cache', expiration: { maxEntries: 50 } },
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
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
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
