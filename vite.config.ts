import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages URL: https://<GitHubユーザー名>.github.io/team-link/
  base: '/team-link/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg'],
      manifest: {
        id: '/team-link/',
        name: 'TEAM LINK',
        short_name: 'TEAM LINK',
        description: 'バスケットボールチーム運営・試合記録アプリ',
        lang: 'ja',
        start_url: '/team-link/',
        scope: '/team-link/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1d4ed8',
        icons: [
          { src: '/team-link/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/team-link/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      }
    })
  ]
})
