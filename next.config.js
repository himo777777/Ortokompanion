/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization to avoid localStorage issues during build
  output: 'standalone',
  // Enable SWC minification
  swcMinify: true,
}

module.exports = nextConfig
