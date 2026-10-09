/** Uploaded images (logos, profile photos): raster only. SVG can carry scripts. */
export const rasterImageRules = {
  maxBytes: 2 * 1024 * 1024,
  types: ["image/png", "image/jpeg", "image/webp"],
  extensions: { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" },
} as const

export type RasterImageType = (typeof rasterImageRules.types)[number]

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, i) => bytes[offset + i] === byte)

/** The real image type from the file's first bytes, ignoring what it claims. */
export function sniffRasterImage(bytes: Uint8Array): RasterImageType | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png"
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg"
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && // RIFF
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8) // WEBP
  ) {
    return "image/webp"
  }
  return null
}
