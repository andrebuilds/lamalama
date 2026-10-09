import "server-only"

import { randomBytes } from "node:crypto"

import { db, MemberRole, Prisma } from "@/shared/db"
import { AppError } from "@/shared/lib/errors"

import {
  normalizePermissions,
  roleForPermissions,
  type Permission,
} from "./lib/permissions"
import { personalWorkspaceName } from "./lib/workspace-name"

type WorkspaceUser = { id: string; name: string }

const withOwnerMembership = (userId: string) =>
  ({
    memberships: { where: { userId }, select: { role: true } },
  }) satisfies Prisma.WorkspaceInclude

/**
 * Returns the user's personal workspace, creating it (with the user as
 * OWNER) on first use. Safe to call concurrently: the unique
 * personalOwnerId means only one insert can win; the loser reads it back.
 */
export async function ensurePersonalWorkspace(user: WorkspaceUser) {
  const include = withOwnerMembership(user.id)

  const existing = await db.workspace.findUnique({
    where: { personalOwnerId: user.id },
    include,
  })
  if (existing) return toContext(existing)

  try {
    const created = await db.workspace.create({
      data: {
        name: personalWorkspaceName(user.name),
        personalOwnerId: user.id,
        memberships: { create: { userId: user.id, role: MemberRole.OWNER } },
      },
      include,
    })
    return toContext(created)
  } catch (error) {
    const isRace =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    if (!isRace) throw error
    const winner = await db.workspace.findUniqueOrThrow({
      where: { personalOwnerId: user.id },
      include,
    })
    return toContext(winner)
  }
}

function toContext(
  workspace: Prisma.WorkspaceGetPayload<{
    include: ReturnType<typeof withOwnerMembership>
  }>
) {
  const { memberships, ...rest } = workspace
  const membership = memberships[0]
  // The owner membership is created in the same insert as the workspace.
  if (!membership)
    throw new Error(`Workspace ${rest.id} has no owner membership`)
  return { workspace: rest, role: membership.role }
}

export async function renameWorkspace(workspaceId: string, name: string) {
  return db.workspace.update({
    where: { id: workspaceId },
    data: { name },
    select: { id: true, name: true },
  })
}

/** Every workspace the user belongs to: personal first, then by age. */
export async function listWorkspaces(userId: string) {
  const memberships = await db.membership.findMany({
    where: { userId },
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          personalOwnerId: true,
          createdAt: true,
        },
      },
    },
  })
  return memberships
    .map(({ role, workspace }) => ({
      id: workspace.id,
      name: workspace.name,
      role,
      isPersonal: workspace.personalOwnerId !== null,
      createdAt: workspace.createdAt,
    }))
    .sort((a, b) =>
      a.isPersonal !== b.isPersonal
        ? Number(b.isPersonal) - Number(a.isPersonal)
        : a.createdAt.getTime() - b.createdAt.getTime()
    )
    .map(({ createdAt: _createdAt, ...workspace }) => workspace)
}

/** The workspace and the user's role in it, or null without a membership. */
export async function getWorkspaceForUser(userId: string, workspaceId: string) {
  const membership = await db.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    select: { role: true, permissions: true, workspace: true },
  })
  return membership
    ? {
        workspace: membership.workspace,
        role: membership.role,
        permissions: membership.permissions,
      }
    : null
}

/** A new shared workspace, with the creator as OWNER. */
export async function createWorkspace(userId: string, name: string) {
  return db.workspace.create({
    data: {
      name,
      memberships: { create: { userId, role: MemberRole.OWNER } },
    },
    select: { id: true, name: true },
  })
}

/** Deletes a shared workspace. The personal one is refused, never deleted. */
export async function deleteWorkspace(workspaceId: string) {
  const workspace = await db.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { personalOwnerId: true },
  })
  if (workspace.personalOwnerId) {
    throw new AppError("FORBIDDEN", "Your personal workspace can’t be deleted.")
  }
  await db.workspace.delete({ where: { id: workspaceId } })
}

// ─── Members and invitations ────────────────────────────────────────────────

const invitationTtlMs = 7 * 24 * 60 * 60 * 1000

export async function listMembers(workspaceId: string) {
  return db.membership.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      permissions: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })
}

export async function listInvitations(workspaceId: string) {
  return db.invitation.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      permissions: true,
      expiresAt: true,
    },
  })
}

/**
 * Who is changing access. Only the owner may hand out "members:manage" or
 * touch someone who holds it, so an admin can't promote themselves or
 * lock out another admin.
 */
type Actor = { userId: string; isOwner: boolean }

function assertMayGrant(actor: Actor, permissions: readonly Permission[]) {
  if (!actor.isOwner && permissions.includes("members:manage")) {
    throw new AppError(
      "FORBIDDEN",
      "Only the owner can give someone member management."
    )
  }
}

/**
 * Creates (or refreshes) a pending invitation. Re-inviting the same address
 * rotates the token and extends the expiry. Grants permissions, never
 * ownership: that doesn't travel by email.
 */
export async function createInvitation(input: {
  workspaceId: string
  email: string
  permissions: readonly Permission[]
  invitedBy: Actor
}) {
  const permissions = normalizePermissions(input.permissions)
  assertMayGrant(input.invitedBy, permissions)
  const email = input.email.toLowerCase()

  const member = await db.membership.findFirst({
    where: { workspaceId: input.workspaceId, user: { email } },
    select: { id: true },
  })
  if (member) {
    throw new AppError(
      "CONFLICT",
      "That person is already a member of this workspace."
    )
  }

  const fresh = {
    role: roleForPermissions(permissions),
    permissions,
    token: randomBytes(32).toString("base64url"),
    expiresAt: new Date(Date.now() + invitationTtlMs),
    invitedById: input.invitedBy.userId,
  }
  return db.invitation.upsert({
    where: {
      workspaceId_email: { workspaceId: input.workspaceId, email },
    },
    update: fresh,
    create: { workspaceId: input.workspaceId, email, ...fresh },
    select: { token: true, email: true, role: true, permissions: true },
  })
}

export async function revokeInvitation(
  workspaceId: string,
  invitationId: string
) {
  await db.invitation.deleteMany({
    where: { id: invitationId, workspaceId },
  })
}

/** The invitation behind a token, for the accept page. */
export async function getInvitation(token: string) {
  return db.invitation.findUnique({
    where: { token },
    select: {
      id: true,
      email: true,
      role: true,
      permissions: true,
      expiresAt: true,
      workspace: { select: { id: true, name: true } },
      invitedBy: { select: { name: true } },
    },
  })
}

/**
 * Turns an invitation into a membership. The signed-in account's email must
 * match the invited address, so a forwarded link grants nothing.
 */
export async function acceptInvitation(
  token: string,
  user: { id: string; email: string }
) {
  const invitation = await getInvitation(token)
  if (!invitation) {
    throw new AppError(
      "NOT_FOUND",
      "This invitation doesn’t exist or was revoked."
    )
  }
  if (invitation.expiresAt < new Date()) {
    throw new AppError(
      "VALIDATION",
      "This invitation has expired. Ask for a new one."
    )
  }
  if (invitation.email !== user.email.toLowerCase()) {
    throw new AppError(
      "FORBIDDEN",
      `This invitation was sent to ${invitation.email}. Sign in with that address to accept it.`
    )
  }

  await db.$transaction([
    db.membership.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: invitation.workspace.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        workspaceId: invitation.workspace.id,
        role: invitation.role,
        permissions: invitation.permissions,
      },
    }),
    db.invitation.delete({ where: { id: invitation.id } }),
  ])
  return invitation.workspace
}

/**
 * Loads a member someone else is about to change or remove, enforcing the
 * rules: the owner is untouchable, you don't edit yourself here, and only
 * the owner touches members who can manage members.
 */
async function managedMember(
  workspaceId: string,
  membershipId: string,
  actor: Actor
) {
  const membership = await db.membership.findFirst({
    where: { id: membershipId, workspaceId },
    select: { role: true, permissions: true, userId: true },
  })
  if (!membership) throw new AppError("NOT_FOUND", "That member is gone.")
  if (membership.role === MemberRole.OWNER) {
    throw new AppError("FORBIDDEN", "The owner’s access can’t be changed.")
  }
  if (membership.userId === actor.userId) {
    throw new AppError("FORBIDDEN", "You can’t change your own access.")
  }
  if (!actor.isOwner && membership.permissions.includes("members:manage")) {
    throw new AppError(
      "FORBIDDEN",
      "Only the owner can change members who manage members."
    )
  }
  return membership
}

/** Replaces a member's permissions; the role follows (preset or CUSTOM). */
export async function setMemberPermissions(
  workspaceId: string,
  membershipId: string,
  permissions: readonly Permission[],
  actor: Actor
) {
  const next = normalizePermissions(permissions)
  assertMayGrant(actor, next)
  await managedMember(workspaceId, membershipId, actor)
  return db.membership.update({
    where: { id: membershipId },
    data: { permissions: next, role: roleForPermissions(next) },
    select: { role: true, permissions: true },
  })
}

export async function removeMember(
  workspaceId: string,
  membershipId: string,
  actor: Actor
) {
  await managedMember(workspaceId, membershipId, actor)
  await db.membership.delete({ where: { id: membershipId } })
}

/** A member walks away. Owners delete the workspace instead. */
export async function leaveWorkspace(workspaceId: string, userId: string) {
  const membership = await db.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    select: { id: true, role: true },
  })
  if (!membership) {
    throw new AppError("NOT_FOUND", "You’re not a member of this workspace.")
  }
  if (membership.role === MemberRole.OWNER) {
    throw new AppError(
      "FORBIDDEN",
      "Owners can’t leave their own workspace. Delete it instead."
    )
  }
  await db.membership.delete({ where: { id: membership.id } })
}
