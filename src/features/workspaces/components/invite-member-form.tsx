"use client"

import { MailPlusIcon } from "lucide-react"
import { useActionState, useEffect, useState } from "react"

import { Button } from "@/shared/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Spinner } from "@/shared/ui/spinner"
import { toast } from "@/shared/ui/toast"

import { inviteMember } from "../actions"
import { rolePresets } from "../lib/permissions"
import {
  AccessInputs,
  AccessSelect,
  PermissionSwitches,
  useAccess,
} from "./access-picker"

/** Member managers: emails an invitation with the picked access. */
export function InviteMemberForm({
  canGrantMembers,
}: {
  /** The owner can invite admins (member management included). */
  canGrantMembers: boolean
}) {
  const [email, setEmail] = useState("")
  const access = useAccess(rolePresets.EDITOR)
  const [result, formAction, isPending] = useActionState(
    async (...args: Parameters<typeof inviteMember>) => {
      const next = await inviteMember(...args)
      if (next.ok) setEmail("")
      return next
    },
    null
  )

  useEffect(() => {
    if (!result) return
    if (result.ok) {
      toast.add({
        type: "success",
        title: `Invitation sent to ${result.data.email}`,
      })
    } else if (result.error.code !== "VALIDATION") {
      toast.add({ type: "error", title: result.error.message })
    }
  }, [result])

  const emailError =
    result && !result.ok ? result.error.fieldErrors?.email?.[0] : undefined

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field data-invalid={emailError ? true : undefined}>
        <FieldLabel htmlFor="invite-email">Invite by email</FieldLabel>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="invite-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@company.com"
            className="flex-1"
            required
          />
          <AccessSelect
            access={access}
            canGrantMembers={canGrantMembers}
            label="Access for the invited member"
            className="sm:w-28"
          />
          {/* The picked permissions travel with the form. */}
          <AccessInputs access={access} />
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <MailPlusIcon data-icon="inline-start" />
            )}
            Invite
          </Button>
        </div>
        {emailError && <FieldError>{emailError}</FieldError>}
      </Field>
      {access.choice === "CUSTOM" && (
        <PermissionSwitches
          access={access}
          canGrantMembers={canGrantMembers}
          idPrefix="invite"
        />
      )}
    </form>
  )
}
