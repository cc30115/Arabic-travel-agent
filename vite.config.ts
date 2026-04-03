import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          'index-zh': path.resolve(__dirname, 'index-zh.html'),
          about: path.resolve(__dirname, 'about.html'),
          'about-zh': path.resolve(__dirname, 'about-zh.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          'contact-zh': path.resolve(__dirname, 'contact-zh.html'),
          'journey-1': path.resolve(__dirname, 'journey-1.html'),
          'journey-1-zh': path.resolve(__dirname, 'journey-1-zh.html'),
          'journey-2': path.resolve(__dirname, 'journey-2.html'),
          'journey-2-zh': path.resolve(__dirname, 'journey-2-zh.html'),
          'journey-3': path.resolve(__dirname, 'journey-3.html'),
          'journey-3-zh': path.resolve(__dirname, 'journey-3-zh.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
