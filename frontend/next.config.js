/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Enable strict mode in development
  reactStrictMode: true,
  // Configure transpile modules if needed
  transpilePackages: ['@social-content/shared'],
  // Configure images
  images: {
    domains: ['localhost'],
  },
  // CORS for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  // Environment variables
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
};

module.exports = nextConfig;