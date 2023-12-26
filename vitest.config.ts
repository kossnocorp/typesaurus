import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout:
      typeof window !== "undefined" || process.env.BROWSER
        ? 25000
        : process.env.FIRESTORE_EMULATOR_HOST
          ? 15000
          : 25000,
    setupFiles: [
      typeof window !== "undefined" || process.env.BROWSER
        ? "./tests/setupWeb.ts"
        : "./tests/setupAdmin.ts",
    ],
    include: ["src/**/tests.ts", "src/tests/*.ts"],
    browser: {
      // Enable it via --browser
      // enabled: true,
      name: "chromium",
      provider: "playwright",
      headless: true,
    },
  },
});
