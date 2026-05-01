import { MetadataRoute } from "next";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: [
      "https://astrokids.ai/sitemap.xml",
      "https://astrokids.ai/blogs-sitemap.xml",
    ],
  };
}