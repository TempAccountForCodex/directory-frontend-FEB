// vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const normalizeDevProxyCookies = (cookies?: string[]) => {
  if (!Array.isArray(cookies)) return cookies;

  return cookies.map((cookie) =>
    cookie
      // Strip backend-owned domains so the browser stores a host-only localhost cookie.
      .replace(/;\s*Domain=[^;]+/gi, '')
      // Local Vite dev runs on http://localhost, so drop Secure for proxied cookies.
      .replace(/;\s*Secure/gi, '')
      // SameSite=None requires Secure; use Lax for same-origin localhost proxy traffic.
      .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
  );
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:5001/api';
  const rawProxyTarget =
    env.VITE_API_PROXY_TARGET ||
    (/^https?:\/\//.test(apiUrl) ? apiUrl.replace(/\/api\/?$/, '') : 'http://localhost:5001');
  const apiProxyTarget = rawProxyTarget.replace(/\/api\/?$/, '');

  return {
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
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['set-cookie'] = normalizeDevProxyCookies(
                proxyRes.headers['set-cookie'] as string[] | undefined
              );
            });
          },
        },
        '/ws': {
          target: apiProxyTarget,
          changeOrigin: true,
          ws: true,
        },
        '/uploads': {
          target: apiProxyTarget,
          changeOrigin: true,
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
      // Lighthouse expects referenced source maps to be served with production assets.
      sourcemap: true,

      // Reasonable chunk size warning (helps catch bloat early)
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {
          // Split vendor code for better caching as you grow
          manualChunks: {
            // Core React libraries (changes rarely)
            'react-core': ['react', 'react-dom', 'react-router-dom'],

            // Heavy feature libraries (only loaded when needed)
            maps: ['leaflet', 'react-leaflet', 'react-simple-maps'],
          },
        },
      },
    },
  };
});
