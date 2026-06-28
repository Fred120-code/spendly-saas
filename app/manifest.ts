import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spendly AI",
    short_name: "Spendly",
    description:
      "Gérez vos budgets, suivez vos dépenses et obtenez des rapports financiers générés par IA.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#151425",
    theme_color: "#151425",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
