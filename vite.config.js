import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/breakdownReports': { target: 'http://localhost:8090', changeOrigin: true },
      '/api/breakdownReasonReports': { target: 'http://localhost:8090', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:8085', changeOrigin: true },
    },
  },
})
