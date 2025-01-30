// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: {}
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: "process/browser"
    }
  }
})