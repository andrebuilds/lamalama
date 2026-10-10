import "server-only"

import { envFallbackKey } from "@/shared/ai"
import { env } from "@/shared/config/env"
import { db } from "@/shared/db"
import { AppError } from "@/shared/lib/errors"
import { decryptSecret, encryptSecret } from "@/shared/lib/secrets"

/**
 * BYOK: each workspace brings its own provider key, encrypted at rest
 * (workspace_secrets). ANTHROPIC_API_KEY in env is a development/CI
 * fallback only, used when AI_KEY_SOURCE=env.
 */

const provider = () => env.AI_TEXT_PROVIDER

/**
 * Set when /welcome was shown and skipped; the layout stops redirecting.
 * Holds the user's id: the browser may be shared by several accounts.
 */
export const BYOK_WELCOME_COOKIE = "byok_welcome_seen"

const whereKey = (workspaceId: string) => ({
  workspaceId_provider: { workspaceId, provider: provider() },
})

/**
 * Live check before saving: lists models with the key. Free (no tokens)
 * and catches typos, revoked and disabled keys.
 */
async function assertKeyWorks(apiKey: string): Promise<void> {
  let response: Response
  try {
    response = await fetch("https://api.anthropic.com/v1/models?limit=1", {
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      signal: AbortSignal.timeout(10_000),
    })
  } catch (error) {
    throw new AppError(
      "PROVIDER_FAILED",
      "We couldn’t reach Anthropic to check the key. Try again in a moment.",
      { cause: error }
    )
  }
  if (response.status === 401 || response.status === 403) {
    throw new AppError("VALIDATION", "Anthropic rejected this key.", {
      fieldErrors: {
        apiKey: [
          "Anthropic rejected this key. Copy it again from console.anthropic.com.",
        ],
      },
    })
  }
  if (!response.ok) {
    throw new AppError(
      "PROVIDER_FAILED",
      "Anthropic answered with an error while checking the key. Try again in a moment."
    )
  }
}

/** Validates the key live, then stores it encrypted. Returns the hint. */
export async function saveWorkspaceKey(workspaceId: string, apiKey: string) {
  await assertKeyWorks(apiKey)
  const data = { encrypted: encryptSecret(apiKey), hint: apiKey.slice(-4) }
  return db.workspaceSecret.upsert({
    where: whereKey(workspaceId),
    update: data,
    create: { workspaceId, provider: provider(), ...data },
    select: { hint: true },
  })
}

export async function removeWorkspaceKey(workspaceId: string): Promise<void> {
  await db.workspaceSecret.deleteMany({
    where: { workspaceId, provider: provider() },
  })
}

/** For settings: the stored key's display info, never the key itself. */
export async function getKeyStatus(workspaceId: string) {
  return db.workspaceSecret.findUnique({
    where: whereKey(workspaceId),
    select: { hint: true, updatedAt: true },
  })
}

/**
 * The decrypted key for AI calls, or undefined when the workspace has none
 * (textModel then falls back to the dev env key, or fails with NO_API_KEY).
 */
export async function getWorkspaceAiKey(
  workspaceId: string
): Promise<string | undefined> {
  const secret = await db.workspaceSecret.findUnique({
    where: whereKey(workspaceId),
    select: { encrypted: true },
  })
  return secret ? decryptSecret(secret.encrypted) : undefined
}

/** Soft gate: can this workspace run AI right now? */
export async function hasAiKey(workspaceId: string): Promise<boolean> {
  if (envFallbackKey()) return true
  const secret = await db.workspaceSecret.findUnique({
    where: whereKey(workspaceId),
    select: { id: true },
  })
  return secret !== null
}
