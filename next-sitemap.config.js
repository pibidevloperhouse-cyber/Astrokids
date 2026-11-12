const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_URL ||
  process.env.NEXTAUTH_URL ||
  "https://astrokids-six.vercel.app";

let siteUrl = String(rawUrl).trim();
if (!siteUrl.startsWith("http://") && !siteUrl.startsWith("https://")) {
  siteUrl = `https://${siteUrl}`;
}
siteUrl = siteUrl.replace(/\/+$/, "");

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: ["/Admin@w0rk/**"],
  sitemapSize: 5000,
  additionalPaths: async (config) => {
    return [
      { loc: "/", changefreq: "daily", priority: 1.0 },
      {
        loc: "/child-details",
        changefreq: "daily",
        priority: 0.9,
      },
      { loc: "/confirm-order", changefreq: "daily", priority: 0.8 },
      { loc: "/blogs", changefreq: "daily", priority: 0.7 },
    ];
  },
};
