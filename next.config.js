/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.emojidex.com',
        port: '80',
        pathname: '/emoji/*',
      },
    ],
  }
}

module.exports = nextConfig
