import { configDefaults, defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@domains': fileURLToPath(new URL('./src/domains', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: [...configDefaults.exclude, 'tests/a11y/**', 'tests/visual/**'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html']
    }
  }
})
