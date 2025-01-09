/** @type {import('next').NextConfig} */
const fs = require("fs");
const path = require("path");

// load the URL map from urlMap.json
const urlMap = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./urlMap.json"), "utf-8")
);

const nextConfig = {
  experimental: {
    ppr: true,
  },
  reactStrictMode: true,
  // Allow Next.js to optimize images from these domains
  images: {
    domains: [
      "tjzk.replicate.delivery",
      "pbxt.replicate.delivery",
      "replicate.delivery",
      "arxiv.org",
    ],
  },

  async redirects() {
    // existing redirects
    const existingRedirects = [
      {
        source: "/models/:id(\\d{3})",
        destination: "/models/replicate/:id",
        permanent: true,
      },
      {
        source: "/models/:id(\\d{2})",
        destination: "/models/replicate/:id",
        permanent: true,
      },
      {
        source: "/models/:id(\\d{1})",
        destination: "/models/replicate/:id",
        permanent: true,
      },
      {
        source: "/creators/:id",
        destination: "/creators/replicate/:id",
        permanent: true,
      },
    ];

    // new redirects based on urlMap
    const newRedirects = urlMap.map((mapping) => ({
      source: `/models/replicate/${mapping.old_id}`,
      destination: `/models/replicate/${mapping.id}`,
      permanent: true,
    }));

    // We removed the rearchitectureRedirects here

    // return the combined list of redirects
    return [...existingRedirects, ...newRedirects];
  },
};

module.exports = nextConfig;
