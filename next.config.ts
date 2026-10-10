import type { NextConfig } from "next"

/**
 * Baseline security headers for every response. A Content-Security-Policy
 * (needs nonces for Next's inline scripts) and HSTS (needs the production
 * HTTPS domain) are added at deployment, after M12.
 */
const securityHeaders = [
  // Nobody may embed LamaLama in a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
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
