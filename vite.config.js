import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable code splitting for better performance
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['bootstrap', '@fortawesome/react-fontawesome', '@popperjs/core'],
          utils: ['axios', 'react-toastify', 'react-phone-input-2']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    // Enable hot reload
    hmr: true,
    // Optimize dev server
    host: true,
    port: 5173,
    // Force dependency re-optimization
    force: true
  },
  // Optimize dependencies - force re-optimization
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react/jsx-dev-runtime',
      'react-router-dom',
      'axios',
      'bootstrap',
      '@popperjs/core',
      '@fortawesome/react-fontawesome',
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-brands-svg-icons',
      'react-toastify',
      'react-phone-input-2'
    ]
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: true
  },
  // Clear cache on startup
  cacheDir: 'node_modules/.vite'
})
