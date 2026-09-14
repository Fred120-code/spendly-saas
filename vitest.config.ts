import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./", import.meta.url)),
      },
    },
    test: {
      environment: "node",
      globals: false,
      setupFiles: ["./vitest.setup.ts"],
    },
  };
});
