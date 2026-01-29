import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/iam': {
        target: 'https://techgazzeta.org',
        changeOrigin: true,
        secure: false,
      },
      '/buildings': {
        target: 'https://techgazzeta.org',
        changeOrigin: true,
        secure: false,
      },
      '/community': {
        target: 'https://techgazzeta.org',
        changeOrigin: true,
        secure: false,
      },
      '/tickets': {
        target: 'https://techgazzeta.org',
        changeOrigin: true,
        secure: false,
      },
      '/notifications': {
        target: 'https://techgazzeta.org',
        changeOrigin: true,
        secure: false,
      },
      '/access': {
        target: 'https://techgazzeta.org',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
