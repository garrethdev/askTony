import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*'],
      exclude: ['src/server.ts', 'src/db/migrations/**'],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 24,
        lines: 60
      }
    }
  }
});

