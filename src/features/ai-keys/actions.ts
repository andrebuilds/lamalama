"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect, unstable_rethrow } from "next/navigation"
import { z } from "zod"

import { requireWorkspaceAccess } from "@/features/workspaces"
import { AppError } from "@/shared/lib/errors"
import { err, ok, toResultError, type Result } from "@/shared/lib/result"

import { saveApiKeySchema } from "./schema"
import { removeWorkspaceKey, saveWorkspaceKey } from "./service"

/** Validates the key against Anthropic, encrypts and stores it. */
export async function saveApiKey(
  _previous: Result<{ hint: string }> | null,
  formData: FormData
): Promise<Result<{ hint: string }>> {
  try {
    const parsed = saveApiKeySchema.safeParse({
      apiKey: formData.get("apiKey"),
    })
    if (!parsed.success) {
      throw new AppError("VALIDATION", "Check the API key.", {
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      })
    }

    const { workspace } = await requireWorkspaceAccess("apikey:manage")
    const { hint } = await saveWorkspaceKey(workspace.id, parsed.data.apiKey)

    // The missing-key banner shows in the app layout; refresh everything.
    revalidatePath("/", "layout")
    return ok({ hint })
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

export async function removeApiKey(): Promise<Result<{ removed: true }>> {
  try {
    const { workspace } = await requireWorkspaceAccess("apikey:manage")
    await removeWorkspaceKey(workspace.id)

    revalidatePath("/", "layout")
    return ok({ removed: true })
  } catch (error) {
    unstable_rethrow(error)
    return err(toResultError(error))
  }
}

/** "I'll do it later" on /welcome: remember the choice, go to the app. */
export async function skipByokWelcome(): Promise<void> {
  const jar = await cookies()
  jar.set("byok_welcome_seen", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
  redirect("/dashboard")
}
