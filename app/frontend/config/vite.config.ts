/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


/**
 * The Vite proxy acts as an intermediary between the client and the backend.
 * In production, Nginx fulfils this role.
 *
 * Using the Vite proxy allows us to replicate production behaviour more closely and also avoids the need to enable CORS.
 *
 * @remarks: We use `backend` instead of `localhost` in the address because communication takes place between containers.
 *
 * @Warning: The Vite proxy is only used in development !
 */
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
