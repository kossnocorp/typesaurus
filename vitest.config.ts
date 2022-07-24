import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: 'test/setupAdmin.ts',
    include: ['**/tests/*.ts']
  }
})
