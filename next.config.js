/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
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
  },
};

module.exports = nextConfig;
