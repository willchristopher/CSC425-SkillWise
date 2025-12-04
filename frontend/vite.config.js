import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Listen on all interfaces for Docker
    strictPort: true,
    watch: {
      usePolling: true, // Required for Docker/WSL
    },
    hmr: {
      port: 3000,
    },
  },
  
  // Preview server (for production build preview)
  preview: {
    port: 3000,
    host: true,
  },
  
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
  
  // Build configuration
  build: {
    outDir: 'build', // Keep 'build' for consistency with existing setup
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          charts: ['recharts'],
        },
      },
    },
  },
  
  // Define environment variable prefix (Vite uses VITE_ by default)
  envPrefix: 'VITE_',
  
  // CSS configuration
  css: {
    postcss: './postcss.config.js',
  },
  
  // Test configuration for Vitest (optional, if migrating from Jest)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
  },
});
