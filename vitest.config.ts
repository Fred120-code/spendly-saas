import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [tsconfigPaths()],
    test: {
      environment: "node",
      globals: false,
      setupFiles: ["./vitest.setup.ts"],
    },
  };
});
