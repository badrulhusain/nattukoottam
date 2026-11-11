//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow all local network origins to connect to dev server and HMR sockets
  allowedDevOrigins: ['192.168.0.111:4200', 'localhost:4200', '127.0.0.1:4200'],
  reactStrictMode: false,
};

module.exports = nextConfig;
