import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/NovoTaskManager/' : '/',
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
  server: {
    open: true,
  },
});
