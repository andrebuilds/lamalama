import type { NextRequest } from "next/server"

import { getAvatarKey } from "@/features/account"
import { getSession } from "@/features/auth"
import { signedFileUrl } from "@/shared/storage"

/**
 * A user's uploaded profile photo. `user.image` stores this stable URL
 * (with a version query); the file itself stays private and is reached
 * through a short-lived signed URL. Signed-in visitors only.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/avatar/[userId]">
) {
  if (!(await getSession())) {
    return new Response("Sign in to see this photo.", { status: 401 })
  }
  const { userId } = await context.params
  const key = await getAvatarKey(userId)
  if (!key) return new Response("Not found", { status: 404 })

  const url = await signedFileUrl(key, 60 * 60)
  return new Response(null, {
    status: 302,
    // Shorter than the signature, so a cached redirect never points at an
    // expired URL. A new photo gets a new ?v= and skips this cache.
    headers: { Location: url, "Cache-Control": "private, max-age=3000" },
  })
}
