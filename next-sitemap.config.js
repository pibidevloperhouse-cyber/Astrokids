module.exports = {
  siteUrl: "https://www.astrokids.ai/",
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
