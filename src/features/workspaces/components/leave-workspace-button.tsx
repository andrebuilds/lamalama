"use client"

import { LogOutIcon } from "lucide-react"
import { useTransition } from "react"

import { Button } from "@/shared/ui/button"
import { Spinner } from "@/shared/ui/spinner"
import { toast } from "@/shared/ui/toast"

import { leaveWorkspace } from "../actions"

/**
 * For invited members (never the owner): leaves the shared workspace. On
 * success the action clears the cookie and lands on the personal dashboard.
 */
export function LeaveWorkspaceButton({ name }: { name: string }) {
  const [isPending, startTransition] = useTransition()

  const leave = () => {
    startTransition(async () => {
      const result = await leaveWorkspace()
      if (result && !result.ok) {
        toast.add({ type: "error", title: result.error.message })
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={leave} disabled={isPending}>
      {isPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <LogOutIcon data-icon="inline-start" />
      )}
      Leave “{name}”
    </Button>
  )
}
