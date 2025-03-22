/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This allows builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;