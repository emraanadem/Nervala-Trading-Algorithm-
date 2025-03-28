/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable automatic static optimization
  trailingSlash: false,
  // Configure history settings
  experimental: {
    // Disable excessive URL changes
    scrollRestoration: true,
    // Batch router state updates
    optimisticClientCache: true,
  }
}

module.exports = nextConfig 