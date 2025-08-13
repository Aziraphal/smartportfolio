import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google OAuth
      'avatars.githubusercontent.com', // GitHub OAuth
      'cdn.dribbble.com', // Dribbble
      'mir-s3-cdn-cf.behance.net', // Behance
      'a5.behance.net', // Behance
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/stripe/webhooks',
        destination: '/api/stripe/webhooks',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/stripe/webhooks',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig
