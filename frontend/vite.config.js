import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.VITE_STATIC === 'true' ? '/yomou/' : '/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Yomou',
        short_name: 'Yomou',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#42b883',
        icons: [
          {
            src: 'vite.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/screen1.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshots/screen2.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'screenshots/screen3.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshots/screen4.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
