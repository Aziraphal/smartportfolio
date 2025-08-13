import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true,
  },
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

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
}

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions)
