import { MetadataRoute } from "next";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: [
      "https://www.astrokids.ai/sitemap.xml",
      "https://www.astrokids.ai/blogs-sitemap.xml",
    ],
  };
}