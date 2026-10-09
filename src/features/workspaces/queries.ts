import "server-only"

import { cookies } from "next/headers"
import { cache } from "react"

import { requireUser } from "@/features/auth"

import {
  assertCan,
  effectiveActions,
  type WorkspaceAction,
} from "./lib/permissions"
import { ensurePersonalWorkspace, getWorkspaceForUser } from "./service"

/** Which workspace the browser is working in; stale values fall back. */
export const ACTIVE_WORKSPACE_COOKIE = "active_workspace"

/**
 * The signed-in user's active workspace, role and what they may do in it
 * (`can`). The cookie picks among their memberships; without one (or when
 * it's stale: left or deleted workspace) the personal workspace wins,
 * created on first use. Redirects to sign-in when signed out. Cached for
 * the duration of one request.
 */
export const getCurrentWorkspace = cache(async () => {
  const { user } = await requireUser()

  const cookieId = (await cookies()).get(ACTIVE_WORKSPACE_COOKIE)?.value
  if (cookieId) {
    const context = await getWorkspaceForUser(user.id, cookieId)
    if (context) {
      const { workspace, role, permissions } = context
      return {
        user,
        workspace,
        role,
        actions: effectiveActions(role, permissions),
      }
    }
  }

  const { workspace, role } = await ensurePersonalWorkspace(user)
  return { user, workspace, role, actions: effectiveActions(role, []) }
})

/**
 * Start of every page and server action that touches workspace data:
 * signed in, has a workspace, and allowed every one of `required`. Throws
 * FORBIDDEN otherwise. Scope every query by the returned workspace.id.
 */
export async function requireWorkspaceAccess(
  ...required: [WorkspaceAction, ...WorkspaceAction[]]
) {
  const context = await getCurrentWorkspace()
  for (const action of required) assertCan(context.actions, action)
  return context
}
