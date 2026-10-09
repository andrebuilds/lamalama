"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect, unstable_rethrow } from "next/navigation"

import { auth, requireUser } from "@/features/auth"
import { AppError } from "@/shared/lib/errors"
import { rasterImageRules, sniffRasterImage } from "@/shared/lib/raster-image"
import { err, ok, toResultError, type Result } from "@/shared/lib/result"
import {
  deleteFile,
  deleteFolder,
  putFile,
  userFileKey,
} from "@/shared/storage"

import { deleteAccountSchema, mascotSchema } from "./schema"
import {
  deleteUserAccount,
  setAvatar,
  setMascot as saveMascot,
} from "./service"

const photoTooBig = `Your photo is larger than ${rasterImageRules.maxBytes / 1024 / 1024} MB. Choose a smaller PNG, JPEG or WebP.`
const photoWrongType =
  "That file isn’t a PNG, JPEG or WebP image. Choose a photo in one of those formats."

/**
 * The session cookie caches the user for 5 minutes. After writing the user
 * row directly, re-read it from the database so the cache (and every page
 * that shows the name, photo or mascot) is current right away.
 */
async function refreshSessionCache() {
  await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })
}

/** A replaced file is harmless, so failures only log. */
async function deleteQuietly(key: string | null) {
  if (!key) return
  await deleteFile(key).catch((error: unknown) =>
    console.warn("Couldn't delete replaced profile photo", key, error)
  )
}

/** Uploads a new profile photo, replacing the current one. */
export async function uploadProfilePhoto(
  formData: FormData
): Promise<Result<null>> {
  try {
    const file = formData.get("photo")
    if (!(file instanceof File) || file.size === 0) {
      throw new AppError("VALIDATION", "Choose an image to upload.")
    }
    if (file.size > rasterImageRules.maxBytes) {
      throw new AppError("VALIDATION", photoTooBig)
    }
    const bytes = new Uint8Array(await file.arrayBuffer())
    // Trust the file's bytes, not its name or declared type.
    const type = sniffRasterImage(bytes)
    if (!type) throw new AppError("VALIDATION", photoWrongType)

    const { user } = await requireUser()
    // Each version gets its own key; the version in the URL busts caches.
    const version = randomUUID()
    const key = userFileKey(
      user.id,
      `avatar-${version}.${rasterImageRules.extensions[type]}`
    )
    await putFile(key, bytes, type)
    try {
      const { previousKey } = await setAvatar(user.id, {
        key,
        image: `/api/avatar/${user.id}?v=${version}`,
      })
      await deleteQuietly(previousKey)
    } catch (error) {
      await deleteQuietly(key)
      throw error
    }

    await refreshSessionCache()
    revalidatePath("/", "layout")
    return ok(null)
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

/** Removes the profile photo (uploaded or from Google/GitHub). */
export async function removeProfilePhoto(): Promise<Result<null>> {
  try {
    const { user } = await requireUser()
    const { previousKey } = await setAvatar(user.id, null)
    await deleteQuietly(previousKey)

    await refreshSessionCache()
    revalidatePath("/", "layout")
    return ok(null)
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

/** Picks the llama shown in the user menu, or none. */
export async function chooseMascot(
  mascot: unknown
): Promise<Result<{ mascot: string | null }>> {
  try {
    const parsed = mascotSchema.safeParse(mascot)
    if (!parsed.success) {
      throw new AppError("VALIDATION", "Pick one of the mascots.")
    }

    const { user } = await requireUser()
    await saveMascot(user.id, parsed.data)

    await refreshSessionCache()
    revalidatePath("/", "layout")
    return ok({ mascot: parsed.data })
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

/**
 * Deletes the account and everything it owns, signs out and goes home.
 * The user confirms by typing their email.
 */
export async function deleteAccount(input: unknown): Promise<Result<never>> {
  try {
    const parsed = deleteAccountSchema.safeParse(input)
    const { user } = await requireUser()
    if (!parsed.success || parsed.data.email !== user.email.toLowerCase()) {
      throw new AppError(
        "VALIDATION",
        "Type your email exactly as shown to confirm."
      )
    }

    // Sign out first: it needs the session row, which the delete removes,
    // and it clears the cookies so no cached session outlives the user.
    await auth.api.signOut({ headers: await headers() })
    const { workspaceIds } = await deleteUserAccount(user.id)

    // Storage cleanup is best-effort: a leftover folder costs cents; the
    // deleted rows are what guarantee nobody can reach the files.
    await Promise.all(
      [
        ...workspaceIds.map((id) => `workspaces/${id}/`),
        `users/${user.id}/`,
      ].map((folder) =>
        deleteFolder(folder).catch((error: unknown) =>
          console.warn("Couldn't delete account storage", folder, error)
        )
      )
    )
    revalidatePath("/", "layout")
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
  redirect("/")
}
