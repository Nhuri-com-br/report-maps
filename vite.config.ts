import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // O HMR é desligado no AI Studio pela variável DISABLE_HMR; no uso normal fica ligado.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});