"use client"

import { CheckIcon } from "lucide-react"
import { useTransition } from "react"

import { Button } from "@/shared/ui/button"
import { Spinner } from "@/shared/ui/spinner"
import { toast } from "@/shared/ui/toast"

import { acceptInvitation } from "../actions"

/**
 * On /invite/[token]: joins the workspace. On success the action switches
 * the active workspace and redirects to the dashboard; only errors land
 * back here.
 */
export function AcceptInvitationButton({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition()

  const accept = () => {
    startTransition(async () => {
      const result = await acceptInvitation(token)
      if (result && !result.ok) {
        toast.add({ type: "error", title: result.error.message })
      }
    })
  }

  return (
    <Button size="lg" className="w-full" onClick={accept} disabled={isPending}>
      {isPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <CheckIcon data-icon="inline-start" />
      )}
      Accept invitation
    </Button>
  )
}
