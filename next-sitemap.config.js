const siteUrl = "https://www.aimodels.fyi";

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  exclude: ["/components/*"], // don't include these pages in the sitemap
  generateIndexSitemap: true,
  sitemapSize: 20000,
  robotsTxtOptions: {
    policies: [
      // Bingbot policy
      {
        userAgent: "bingbot",
        disallow: ["/api/og*"],
      },
      // General policy for all other crawlers
      {
        userAgent: "*",
        // allow root and everything else by default
        allow: "/",
        // disallow dashboard and API routes
        disallow: ["/dashboard/"],
      },
    ],
    // Optionally add your Host and any additional sitemaps
    additionalSitemaps: ["https://www.aimodels.fyi/sitemap.xml"],
  },
};
