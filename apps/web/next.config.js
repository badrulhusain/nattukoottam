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

  // Automatically proxy all frontend /api requests to the local NestJS backend on port 3000.
  // This allows any external device on the local network (mobile, friend's laptop) to access
  // the entire API seamlessly without opening port 3000 in Windows Firewall or facing CORS blocks!
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
