import "server-only"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { auth } from "./lib/auth"

/** The current session, or null. Cached for the duration of one request. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await currentHeaders() })
)

/**
 * The request headers, with the cookies as they are now. After a Server
 * Action, Next re-renders the page with the cookies the action set, but
 * headers() still holds the original ones: without this, a refreshed
 * session cookie (new mascot, name or photo) is ignored until a reload.
 */
async function currentHeaders() {
  const requestHeaders = new Headers(await headers())
  requestHeaders.set("cookie", (await cookies()).toString())
  return requestHeaders
}

/**
 * The real access check for pages and actions. proxy.ts only does a fast
 * cookie-presence redirect; Next 16 docs say never to rely on it alone.
 */
export async function requireUser() {
  const session = await getSession()
  if (!session) redirect("/sign-in")
  return session
}
