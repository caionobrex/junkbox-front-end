/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
})

const nextConfig = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com'],
  },
})

module.exports = nextConfig
