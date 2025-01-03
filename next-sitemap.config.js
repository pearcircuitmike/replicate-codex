// next-sitemap.js
const siteUrl = "https://www.aimodels.fyi";

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  exclude: ["/components/*"],
  generateIndexSitemap: true,
  sitemapSize: 20000,
  robotsTxtOptions: {
    // This creates custom rules
    policies: [
      {
        userAgent: "bingbot",
        // Use a wildcard so it covers query strings like /api/og?title=...
        disallow: ["/api/og*"],
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    // Optionally add your Host and any additional sitemaps
    additionalSitemaps: ["https://www.aimodels.fyi/sitemap.xml"],
  },
};
