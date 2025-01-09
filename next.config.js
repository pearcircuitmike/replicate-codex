/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // Keep if you're using this feature
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tjzk.replicate.delivery" },
      { protocol: "https", hostname: "pbxt.replicate.delivery" },
      { protocol: "https", hostname: "replicate.delivery" },
      { protocol: "https", hostname: "arxiv.org" },
    ],
    // Keep optimized images in cache for a long time
    minimumCacheTTL: 31536000, // 1 year (in seconds)
  },
};

module.exports = nextConfig;
