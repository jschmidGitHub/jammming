import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ensures it binds to all interfaces (same as --host)
    port: 5175,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'jonathan-schmid.redirectme.net'
    ]
  }
})
