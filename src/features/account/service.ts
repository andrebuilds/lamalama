import "server-only"

import { db, MemberRole } from "@/shared/db"

/** The user's uploaded profile photo key, or null. */
export async function getAvatarKey(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { avatarKey: true },
  })
  return user?.avatarKey ?? null
}

/**
 * Points the profile photo at a new file (or none) and returns the replaced
 * key so its file can be deleted. `image` is what Better Auth and the UI
 * show; `avatarKey` is the private file behind it.
 */
export async function setAvatar(
  userId: string,
  avatar: { key: string; image: string } | null
) {
  return db.$transaction(async (tx) => {
    const { avatarKey: previousKey } = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { avatarKey: true },
    })
    await tx.user.update({
      where: { id: userId },
      data: { avatarKey: avatar?.key ?? null, image: avatar?.image ?? null },
    })
    return { previousKey }
  })
}

export async function setMascot(userId: string, mascot: string | null) {
  await db.user.update({ where: { id: userId }, data: { mascot } })
}

/**
 * Deletes the user and every workspace they own: the personal one and any
 * shared ones, for everyone in them. Memberships, sessions, sign-in
 * accounts and sent invitations go with the user (cascade). Returns the
 * deleted workspace ids for storage cleanup.
 */
export async function deleteUserAccount(userId: string) {
  return db.$transaction(async (tx) => {
    const owned = await tx.workspace.findMany({
      where: {
        OR: [
          { personalOwnerId: userId },
          { memberships: { some: { userId, role: MemberRole.OWNER } } },
        ],
      },
      select: { id: true },
    })
    const workspaceIds = owned.map((workspace) => workspace.id)
    await tx.workspace.deleteMany({ where: { id: { in: workspaceIds } } })
    await tx.user.delete({ where: { id: userId } })
    return { workspaceIds }
  })
}
