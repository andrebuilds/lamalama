import "server-only"

import { createAnthropic } from "@ai-sdk/anthropic"
import {
  APICallError,
  createProviderRegistry,
  generateText,
  Output,
  type LanguageModel,
} from "ai"
import type { z } from "zod"

import { env } from "@/shared/config/env"
import { AppError } from "@/shared/lib/errors"

function createRegistry(apiKey: string) {
  // One entry per AI_TEXT_PROVIDER value, all fed by the workspace's key.
  return createProviderRegistry({
    anthropic: createAnthropic({ apiKey }),
  })
}

/** ANTHROPIC_API_KEY, but only when AI_KEY_SOURCE=env (development/CI). */
export function envFallbackKey(): string | undefined {
  return env.AI_KEY_SOURCE === "env" ? env.ANTHROPIC_API_KEY : undefined
}

/**
 * The configured text model (AI_TEXT_PROVIDER + AI_TEXT_MODEL), running on
 * the given workspace key (BYOK), else on envFallbackKey().
 */
export function textModel(apiKey?: string): LanguageModel {
  const key = apiKey ?? envFallbackKey()
  if (!key) {
    throw new AppError(
      "NO_API_KEY",
      "This workspace has no AI key yet. The owner can add one in Settings → API key."
    )
  }
  return createRegistry(key).languageModel(
    `${env.AI_TEXT_PROVIDER}:${env.AI_TEXT_MODEL}`
  )
}

/**
 * Asks the text model for data matching `schema`. The SDK validates the
 * result against the schema; any provider or validation failure becomes a
 * user-safe error (a rejected key gets its own message, so the owner knows
 * to fix it in settings).
 */
export async function generateStructured<T>(input: {
  schema: z.ZodType<T>
  system: string
  prompt: string
  /** Pictures sent with the prompt (e.g. a video frame), for vision. */
  images?: { data: Uint8Array; mediaType: "image/jpeg" | "image/png" }[]
  /** The workspace's provider key (BYOK). */
  apiKey?: string
  /** For tests: overrides the configured model. */
  model?: LanguageModel
}): Promise<T> {
  try {
    const { output } = await generateText({
      model: input.model ?? textModel(input.apiKey),
      output: Output.object({ schema: input.schema }),
      system: input.system,
      ...(input.images?.length
        ? {
            messages: [
              {
                role: "user" as const,
                content: [
                  { type: "text" as const, text: input.prompt },
                  // "file" parts (AI SDK 7 deprecated "image" parts).
                  ...input.images.map((image) => ({
                    type: "file" as const,
                    data: image.data,
                    mediaType: image.mediaType,
                  })),
                ],
              },
            ],
          }
        : { prompt: input.prompt }),
      maxRetries: 2,
    })
    return output
  } catch (error) {
    if (error instanceof AppError) throw error
    if (
      APICallError.isInstance(error) &&
      (error.statusCode === 401 || error.statusCode === 403)
    ) {
      throw new AppError(
        "NO_API_KEY",
        "The provider rejected this workspace's API key. The owner can update it in Settings → API key.",
        { cause: error }
      )
    }
    throw new AppError(
      "PROVIDER_FAILED",
      "Our AI couldn't finish that. Try again in a moment.",
      { cause: error }
    )
  }
}
