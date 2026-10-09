import type { MetadataRoute } from "next"

import { site } from "@/shared/config/site"

/**
 * Crawlers may read the public pages only. Share links (/v) and invitations
 * stay crawlable on purpose: they carry their own noindex, and blocking them
 * here would hide that tag and break link previews (Twitterbot obeys
 * robots.txt).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/videos",
        "/footage",
        "/brand-kits",
        "/settings",
        "/welcome",
      ],
    },
    sitemap: new URL("/sitemap.xml", site.url).href,
    host: site.url,
  }
}
