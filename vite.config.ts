/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      __MSW_ENABLED__: JSON.stringify(env.VITE_ENABLE_MSW === 'true'),
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      port: 3000,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@mui/material') || id.includes('node_modules/@mui/icons-material')) {
              return 'mui-core';
            }
            if (id.includes('node_modules/@mui/x-date-pickers')) {
              return 'mui-pickers';
            }
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
              return 'vendor';
            }
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  };
});
