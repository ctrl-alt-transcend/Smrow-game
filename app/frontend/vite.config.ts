/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const sharedPath = fileURLToPath(
  new URL('../../shared', import.meta.url),
)

export default defineConfig({
  plugins: [react()]
  ,server: {
    proxy: {
      '/api': {
        target: 'http://nestjs:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
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
