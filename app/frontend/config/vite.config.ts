/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()]
  ,server: {
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
      target: 'http://backend:3000', // OK ici : le proxy tourne dans le conteneur
      ws: true,
      },
    },
  },
  test: {
    pool: 'threads',
    maxWorkers: 1,
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
})

console.log('Vite config loaded successfully.')
