import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { version, dependencies, devDependencies } from './package.json'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    // Build metadata surfaced on the About page. Dependencies are injected so
    // the "Open Source Libraries" list stays in sync with package.json without
    // hand-maintaining it in the component.
    __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __APP_NODE_VERSION__: JSON.stringify(process.version),
    __APP_DEPENDENCIES__: JSON.stringify(dependencies),
    __APP_DEV_DEPENDENCIES__: JSON.stringify(devDependencies),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Split large, stable vendor code into their own long-cached chunks so
         * the app entry stays small and settings-only deps (dnd-kit, radix,
         * virtualizer) don't bloat the first paint.
         */
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          dnd: [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/modifiers',
            '@dnd-kit/utilities',
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      // Bing's HPImageArchive endpoint has no CORS headers; proxy it through
      // the dev server so the browser sees a same-origin request.
      '/bing-api': {
        target: 'https://www.bing.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/bing-api/, ''),
      },
    },
  },
})
