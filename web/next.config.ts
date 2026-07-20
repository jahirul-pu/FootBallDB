import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: false, // Enable when stable
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.footballdb.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === 'development' },
  },
};

export default nextConfig;
