import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/baseUrl";

export default function robots() {
  const baseUrl = getBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/blogs-sitemap.xml`,
    ],
  };
}