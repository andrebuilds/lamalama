"use client"

import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

import { Button } from "@/shared/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Spinner } from "@/shared/ui/spinner"
import { toast } from "@/shared/ui/toast"

import { removeApiKey, saveApiKey } from "../actions"
import { apiKeyMaxLength } from "../schema"

/**
 * Add/replace the workspace's Anthropic key. The key is validated live
 * against Anthropic before saving and never travels back to the client:
 * after a save only the hint (last 4 characters) is shown.
 */
export function ApiKeyForm({
  hint,
  redirectTo,
}: {
  /** Last 4 characters of the stored key, when one exists. */
  hint?: string | null
  /** Where to go after a successful save (used by /welcome). */
  redirectTo?: string
}) {
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [saved, saveAction, isSaving] = useActionState(
    async (
      previous: Awaited<ReturnType<typeof saveApiKey>> | null,
      formData: FormData
    ) => {
      const result = await saveApiKey(previous, formData)
      if (result.ok) setApiKey("")
      return result
    },
    null
  )
  const [removed, removeAction, isRemoving] = useActionState(
    async () => removeApiKey(),
    null
  )

  useEffect(() => {
    if (!saved) return
    if (saved.ok) {
      toast.add({ type: "success", title: "API key saved" })
      if (redirectTo) router.replace(redirectTo)
    } else if (saved.error.code !== "VALIDATION") {
      toast.add({ type: "error", title: saved.error.message })
    }
  }, [saved, redirectTo, router])

  useEffect(() => {
    if (!removed) return
    if (removed.ok) toast.add({ type: "success", title: "API key removed" })
    else toast.add({ type: "error", title: removed.error.message })
  }, [removed])

  const keyError =
    saved && !saved.ok ? saved.error.fieldErrors?.apiKey?.[0] : undefined

  return (
    <div className="flex flex-col gap-4">
      <form action={saveAction} className="flex flex-col gap-3">
        <Field data-invalid={keyError ? true : undefined}>
          <FieldLabel htmlFor="anthropic-api-key">Anthropic API key</FieldLabel>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="anthropic-api-key"
              name="apiKey"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={hint ? `sk-ant-••••${hint} (saved)` : "sk-ant-…"}
              maxLength={apiKeyMaxLength}
              autoComplete="off"
              aria-invalid={keyError ? true : undefined}
              required
            />
            <Button type="submit" disabled={isSaving || isRemoving}>
              {isSaving && <Spinner data-icon="inline-start" />}
              {hint ? "Replace key" : "Save key"}
            </Button>
          </div>
          {keyError ? (
            <FieldError>{keyError}</FieldError>
          ) : (
            <FieldDescription>
              Checked with Anthropic before saving, then stored encrypted. It
              never leaves the server.
            </FieldDescription>
          )}
        </Field>
      </form>
      {hint && (
        <form action={removeAction}>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={isSaving || isRemoving}
          >
            {isRemoving && <Spinner data-icon="inline-start" />}
            Remove key
          </Button>
        </form>
      )}
    </div>
  )
}
