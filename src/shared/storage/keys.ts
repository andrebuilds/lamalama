/** Bucket declared in neon.ts. Keep the two in sync. */
export const MEDIA_BUCKET = "media"

const segmentPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

/**
 * Object key for a workspace's file: `workspaces/<id>/<...segments>`.
 * Every file lives under its workspace prefix, so a key can never point into
 * another workspace. Segments are single path parts: no slashes or dot-dots.
 */
export function workspaceFileKey(workspaceId: string, ...segments: string[]) {
  return scopedKey("workspaces", workspaceId, segments)
}

/**
 * Object key for a user's own file (profile photo): `users/<id>/<...segments>`.
 * Same rules as workspaceFileKey.
 */
export function userFileKey(userId: string, ...segments: string[]) {
  return scopedKey("users", userId, segments)
}

function scopedKey(scope: string, ownerId: string, segments: string[]) {
  if (segments.length === 0) {
    throw new Error(`A file key needs at least one segment after the ${scope}`)
  }
  const parts = [ownerId, ...segments]
  for (const part of parts) {
    if (!segmentPattern.test(part) || part.includes("..")) {
      throw new Error(`Invalid storage key segment: ${JSON.stringify(part)}`)
    }
  }
  return `${scope}/${parts.join("/")}`
}

/** True when `key` belongs to `workspaceId` (check before signing or deleting). */
export function isWorkspaceFileKey(key: string, workspaceId: string) {
  return key.startsWith(`workspaces/${workspaceId}/`)
}
