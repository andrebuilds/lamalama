"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect, unstable_rethrow } from "next/navigation"
import { z } from "zod"

import { requireUser } from "@/features/auth"
import { site } from "@/shared/config/site"
import type { MemberRole } from "@/shared/db"
import { sendEmail } from "@/shared/email"
import { AppError } from "@/shared/lib/errors"
import { err, ok, toResultError, type Result } from "@/shared/lib/result"
import { consumeRateLimit } from "@/shared/rate-limit"
import { deleteFolder } from "@/shared/storage"

import { InvitationEmail } from "./emails/invitation-email"
import { ACTIVE_WORKSPACE_COOKIE, requireWorkspaceAccess } from "./queries"
import {
  changeMemberAccessSchema,
  createWorkspaceSchema,
  invitationIdSchema,
  inviteMemberSchema,
  membershipIdSchema,
  renameWorkspaceSchema,
} from "./schema"
import * as service from "./service"

const cookieOptions = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
  httpOnly: true,
} as const

/**
 * The server action pattern:
 * validate → authorize → service → revalidate, returning a Result.
 * Never throws to the client, except Next's own redirects.
 */
export async function renameWorkspace(
  _previous: Result<{ name: string }> | null,
  formData: FormData
): Promise<Result<{ name: string }>> {
  try {
    const parsed = renameWorkspaceSchema.safeParse({
      name: formData.get("name"),
    })
    if (!parsed.success) {
      throw new AppError("VALIDATION", "Check the workspace name.", {
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      })
    }

    const { workspace } = await requireWorkspaceAccess("workspace:manage")
    const renamed = await service.renameWorkspace(
      workspace.id,
      parsed.data.name
    )

    // The name shows in the app layout (Part F), so refresh everything.
    revalidatePath("/", "layout")
    return ok({ name: renamed.name })
  } catch (error) {
    // Let Next's redirect (signed out) and not-found signals through.
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

/** Creates a shared workspace and switches the browser to it. */
export async function createWorkspace(
  _previous: Result<{ id: string; name: string }> | null,
  formData: FormData
): Promise<Result<{ id: string; name: string }>> {
  try {
    const parsed = createWorkspaceSchema.safeParse({
      name: formData.get("name"),
    })
    if (!parsed.success) {
      throw new AppError("VALIDATION", "Check the workspace name.", {
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      })
    }

    const { user } = await requireUser()
    const created = await service.createWorkspace(user.id, parsed.data.name)
    ;(await cookies()).set(ACTIVE_WORKSPACE_COOKIE, created.id, cookieOptions)

    revalidatePath("/", "layout")
    return ok(created)
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

/** Points the browser at another of the user's workspaces. */
export async function switchWorkspace(workspaceId: unknown): Promise<void> {
  const parsed = z.string().min(1).safeParse(workspaceId)
  if (!parsed.success) redirect("/dashboard")

  const { user } = await requireUser()
  const context = await service.getWorkspaceForUser(user.id, parsed.data)
  // Not a member (anymore): fall back to the personal workspace.
  const jar = await cookies()
  if (context) jar.set(ACTIVE_WORKSPACE_COOKIE, parsed.data, cookieOptions)
  else jar.delete(ACTIVE_WORKSPACE_COOKIE)

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

/**
 * Deletes the active shared workspace (owner only; the personal one is
 * refused by the service) and falls back to the personal workspace.
 */
export async function deleteWorkspace(): Promise<Result<{ deleted: true }>> {
  try {
    const { workspace } = await requireWorkspaceAccess("workspace:delete")
    await service.deleteWorkspace(workspace.id)

    // Storage cleanup is best-effort: a leftover folder costs cents; a
    // deleted row is what guarantees nobody can reach the files.
    await deleteFolder(`workspaces/${workspace.id}/`).catch((error: unknown) =>
      console.warn("Couldn't delete workspace storage", error)
    )
    ;(await cookies()).delete(ACTIVE_WORKSPACE_COOKIE)
    revalidatePath("/", "layout")
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
  redirect("/dashboard")
}

// ─── Members and invitations ────────────────────────────────────────────────

const invitesPerDay = 20

/** Member managers: creates/refreshes the invitation and emails the link. */
export async function inviteMember(
  _previous: Result<{ email: string }> | null,
  formData: FormData
): Promise<Result<{ email: string }>> {
  try {
    const parsed = inviteMemberSchema.safeParse({
      email: formData.get("email"),
      permissions: formData.getAll("permissions"),
    })
    if (!parsed.success) {
      throw new AppError("VALIDATION", "Check the invitation.", {
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      })
    }

    const { user, workspace, role } =
      await requireWorkspaceAccess("members:manage")
    await consumeRateLimit({
      key: `invites:${workspace.id}`,
      limit: invitesPerDay,
      windowSeconds: 24 * 60 * 60,
      message: `You’ve sent ${invitesPerDay} invitations today. Try again tomorrow.`,
    })

    const invitation = await service.createInvitation({
      workspaceId: workspace.id,
      email: parsed.data.email,
      permissions: parsed.data.permissions,
      invitedBy: { userId: user.id, isOwner: role === "OWNER" },
    })
    await sendEmail({
      to: invitation.email,
      subject: `${user.name || user.email} invited you to ${workspace.name} on ${site.name}`,
      react: (
        <InvitationEmail
          url={`${site.url}/invite/${invitation.token}`}
          workspaceName={workspace.name}
          inviterName={user.name || user.email}
          role={invitation.role}
        />
      ),
    })

    revalidatePath("/settings/workspace")
    return ok({ email: invitation.email })
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

export async function revokeInvitation(
  invitationId: unknown
): Promise<Result<{ revoked: true }>> {
  try {
    const parsed = invitationIdSchema.safeParse(invitationId)
    if (!parsed.success)
      throw new AppError("NOT_FOUND", "That invitation is gone.")

    const { workspace } = await requireWorkspaceAccess("members:manage")
    await service.revokeInvitation(workspace.id, parsed.data)

    revalidatePath("/settings/workspace")
    return ok({ revoked: true })
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

/** Replaces a member's permissions; their role label follows. */
export async function changeMemberAccess(
  input: unknown
): Promise<Result<{ role: MemberRole }>> {
  try {
    const parsed = changeMemberAccessSchema.safeParse(input)
    if (!parsed.success)
      throw new AppError("VALIDATION", "Check the permissions.")

    const { user, workspace, role } =
      await requireWorkspaceAccess("members:manage")
    const updated = await service.setMemberPermissions(
      workspace.id,
      parsed.data.membershipId,
      parsed.data.permissions,
      { userId: user.id, isOwner: role === "OWNER" }
    )

    revalidatePath("/", "layout")
    return ok({ role: updated.role })
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

export async function removeMember(
  membershipId: unknown
): Promise<Result<{ removed: true }>> {
  try {
    const parsed = membershipIdSchema.safeParse(membershipId)
    if (!parsed.success) throw new AppError("NOT_FOUND", "That member is gone.")

    const { user, workspace, role } =
      await requireWorkspaceAccess("members:manage")
    await service.removeMember(workspace.id, parsed.data, {
      userId: user.id,
      isOwner: role === "OWNER",
    })

    revalidatePath("/settings/workspace")
    return ok({ removed: true })
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

/** A non-owner member leaves; the browser falls back to their personal. */
export async function leaveWorkspace(): Promise<Result<{ left: true }>> {
  try {
    const { user, workspace } = await requireWorkspaceAccess("workspace:view")
    await service.leaveWorkspace(workspace.id, user.id)
    ;(await cookies()).delete(ACTIVE_WORKSPACE_COOKIE)
    revalidatePath("/", "layout")
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
  redirect("/dashboard")
}

/** From /invite/[token]: joins the workspace and switches to it. */
export async function acceptInvitation(
  token: unknown
): Promise<Result<{ accepted: true }>> {
  try {
    const parsed = z.string().min(1).safeParse(token)
    if (!parsed.success)
      throw new AppError("NOT_FOUND", "This invitation doesn’t exist.")

    const { user } = await requireUser()
    const workspace = await service.acceptInvitation(parsed.data, user)
    ;(await cookies()).set(ACTIVE_WORKSPACE_COOKIE, workspace.id, cookieOptions)
    revalidatePath("/", "layout")
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
  redirect("/dashboard")
}
