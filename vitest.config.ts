import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Playwright corre aparte (pnpm test:e2e); aqui solo tests unitarios.
    include: ['packages/*/tests/**/*.test.ts'],
    coverage: {
      include: ['packages/core/src/**'],
      thresholds: { lines: 85, functions: 85, branches: 85, statements: 85 },
    },
  },
});
