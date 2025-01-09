/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable Next.js built-in optimization
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
