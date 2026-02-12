// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  webpack: (config: any, { isServer }: any) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'node:fs': false,
        'node:fs/promises': false,
        'node:path': false,
        'node:events': false,
        'node:stream': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
