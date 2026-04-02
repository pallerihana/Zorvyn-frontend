import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',  // CHANGE THIS - use 'esbuild' instead of 'terser'
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'bootstrap-vendor': ['react-bootstrap', 'bootstrap'],
          'chart-vendor': ['recharts', 'chart.js', 'react-chartjs-2'],
          'icon-vendor': ['react-icons']
        }
      }
    }
  }
})