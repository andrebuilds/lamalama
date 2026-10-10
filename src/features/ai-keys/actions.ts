"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect, unstable_rethrow } from "next/navigation"
import { z } from "zod"

import { requireUser } from "@/features/auth"
import { requireWorkspaceAccess } from "@/features/workspaces"
import { env } from "@/shared/config/env"
import { userLimits } from "@/shared/config/limits"
import { AppError } from "@/shared/lib/errors"
import { err, ok, toResultError, type Result } from "@/shared/lib/result"
import { consumeRateLimit } from "@/shared/rate-limit"

import { saveApiKeySchema } from "./schema"
import {
  BYOK_WELCOME_COOKIE,
  removeWorkspaceKey,
  saveWorkspaceKey,
} from "./service"

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

    const { user, workspace } = await requireWorkspaceAccess("apikey:manage")
    // Each save asks Anthropic whether the key works; without a cap the
    // form could be used to test stolen keys.
    await consumeRateLimit({
      key: `api-key-checks:${user.id}`,
      limit: userLimits.apiKeyChecksPerHour,
      windowSeconds: 60 * 60,
      message: "Too many keys tried. Wait an hour and try again.",
    })
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

/**
 * "I'll do it later" on /welcome: remember the choice, go to the app. The
 * cookie holds the user's id, so another account signing up in the same
 * browser still sees /welcome.
 */
export async function skipByokWelcome(): Promise<void> {
  const { user } = await requireUser()
  const jar = await cookies()
  jar.set(BYOK_WELCOME_COOKIE, user.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
    secure: env.BETTER_AUTH_URL.startsWith("https://"),
  })
  redirect("/dashboard")
}
