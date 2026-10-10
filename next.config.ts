import type { NextConfig } from "next"

/**
 * Baseline security headers for every response. A full
 * Content-Security-Policy for scripts needs nonces for Next's inline
 * scripts (every page dynamic), so it stays a later step; this one only
 * covers what needs no nonce.
 */
const securityHeaders = [
  // Nobody may embed LamaLama in a frame (clickjacking). X-Frame-Options
  // for older browsers, frame-ancestors for current ones.
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  },
  // Browsers must not guess content types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the origin to other sites, never full URLs.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Only our own pages may capture the screen (footage recording, M2).
  // Camera and microphone stay off: recordings have no sound.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), display-capture=(self)",
  },
  // HTTPS only, for a year, once the app runs on HTTPS (not on localhost,
  // where it would stick to every local project).
  ...(process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
]

// The app's own host. www.<host> redirects to it: one canonical address
// for search engines and one set of auth cookies.
const appHost = new URL(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).hostname

const nextConfig: NextConfig = {
  devIndicators: false,
  // Don't advertise the framework in an X-Powered-By header.
  poweredByHeader: false,
  images: {
    // The footer's author avatar. next/image fetches it server-side, so
    // visitors' browsers (and IP addresses) never reach GitHub.
    // Object form, not new URL(): avatar URLs carry a query (?v=4) and a
    // URL pattern would only match an empty one.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Logo uploads are up to 2 MB; the limit counts the raw multipart
      // body, so leave room for its boundaries and headers.
      bodySizeLimit: 2 * 1024 * 1024 + 64 * 1024,
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        // `value` is a regex: escape the dots.
        has: [
          { type: "host", value: `www\\.${appHost.replaceAll(".", "\\.")}` },
        ],
        destination: `https://${appHost}/:path*`,
        permanent: true,
      },
    ]
  },
}

export default nextConfig
