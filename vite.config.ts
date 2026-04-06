// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],

  // Pre-bundle heavy dependencies for faster dev server
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@mui/material/Tooltip',
      '@mui/material/Unstable_Grid2',
      'framer-motion',
      'react-router-dom',
      'leaflet',
      'react-leaflet',
      'swiper',
      'swiper/react',
      '@emailjs/browser',
      'notistack',
    ],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    open: true,
    // Proxy API requests to backend (avoids CORS in dev)
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },

  // Preview server (for testing production builds)
  preview: {
    port: 4173,
    open: true,
  },

  // Production build optimizations
  build: {
    // Generate sourcemaps for error tracking (hidden from users)
    sourcemap: 'hidden',

    // Reasonable chunk size warning (helps catch bloat early)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split vendor code for better caching as you grow
        manualChunks: {
          // Core React libraries (changes rarely)
          'react-core': ['react', 'react-dom', 'react-router-dom'],

          // MUI components (large, changes with updates)
          mui: ['@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],

          // Heavy feature libraries (only loaded when needed)
          maps: ['leaflet', 'react-leaflet', 'react-simple-maps'],
          animations: ['framer-motion', '@tsparticles/react', '@tsparticles/engine'],
        },
      },
    },
  },
});
