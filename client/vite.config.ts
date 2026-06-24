/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@adapters': path.resolve(__dirname, 'src/adapters'),
      '@presentation': path.resolve(__dirname, 'src/presentation'),
      '@i18n': path.resolve(__dirname, 'src/i18n'),
      '@content': path.resolve(__dirname, 'src/content'),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  test: {
    environment: 'node',
    env: {
      VITE_API_URL: 'http://localhost:8080',
    },
  },
});
