import { defineConfig } from "vitest/config";
import path from "node:path";
import { config } from "dotenv";

config({ path: [".env.test", ".env.local", ".env"] });

export default defineConfig({
  test: {
    include: ["tests/db/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
  resolve: { alias: { "@": path.resolve(__dirname) } },
});
