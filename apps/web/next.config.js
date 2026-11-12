//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow all local network origins to connect to dev server and HMR sockets
  allowedDevOrigins: [
    '192.168.0.111:4200',
    'localhost:4200',
    '127.0.0.1:4200',
    '192.168.*:*',
    '10.*.*.*:*',
  ],
  reactStrictMode: false,

  // Automatically proxy all frontend /api requests to the NestJS backend.
  // In development, this points to localhost:3000/api.
  // In production on Vercel, this points to API_URL or NEXT_PUBLIC_API_URL.
  async rewrites() {
    const rawTarget =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3000/api';
    const apiTarget = rawTarget.replace(/\/$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
