import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/whatsscale-api': {
        target: 'https://proxy.whatsscale.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/whatsscale-api/, ''),
      },
    },
  },
})
