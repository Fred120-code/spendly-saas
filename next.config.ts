import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Indispensable pour Docker : Next.js copie uniquement les fichiers
  // nécessaires à l'exécution (pas tout node_modules) dans .next/standalone.
  output: "standalone",
};

export default nextConfig;
