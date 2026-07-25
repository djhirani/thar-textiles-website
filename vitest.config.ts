import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    exclude: ["tests/e2e/**", "node_modules/**"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
