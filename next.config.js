/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep images optimized on Vercel; if deploying to Cloudflare Pages swap to: unoptimized: true
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
