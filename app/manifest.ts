import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Being Lillian",
    short_name: "Lillian",
    description: "Makeup artistry, consulting, and the journal of Being Lillian.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#FAF9F6",
    icons: [
      {
        src: "/logo-mark.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo-mark.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
