import "server-only"

import { safeFetch, type NetworkPolicy } from "@/shared/net"
import {
  rasterImageRules,
  sniffRasterImage,
  type RasterImageType,
} from "@/shared/lib/raster-image"

/** Logos: raster only. SVG can carry scripts, so it isn't accepted. */
export const logoRules = rasterImageRules

export type LogoType = RasterImageType

export const sniffLogoType = sniffRasterImage

/**
 * Downloads the first candidate that is a real PNG, JPEG or WebP under the
 * size cap. Returns null when none is usable; a kit is fine without a logo.
 */
export async function fetchLogo(
  urls: string[],
  options: { policy?: NetworkPolicy } = {}
) {
  for (const url of urls) {
    try {
      const { body } = await safeFetch(url, {
        accept: logoRules.types,
        maxBytes: logoRules.maxBytes,
        timeoutMs: 5_000,
        policy: options.policy,
      })
      const type = sniffLogoType(body)
      if (type) return { bytes: body, type }
    } catch {
      // Try the next candidate.
    }
  }
  return null
}
