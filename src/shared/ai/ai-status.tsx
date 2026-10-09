"use client"

import { KeyIcon } from "lucide-react"
import Link from "next/link"
import { createContext, useContext } from "react"

import { cn } from "@/shared/lib/utils"

type AiStatus = {
  /** The workspace can run AI (a saved key, or the env fallback). */
  hasKey: boolean
  /** The viewer may use AI here ("ai:use"). */
  canUse: boolean
  /** The viewer can add the key ("apikey:manage"). */
  canManage: boolean
}

// Outside the app shell (tests, stories) AI counts as available.
const AiStatusContext = createContext<AiStatus>({
  hasKey: true,
  canUse: true,
  canManage: false,
})

export function AiStatusProvider({
  children,
  ...status
}: AiStatus & { children: React.ReactNode }) {
  return <AiStatusContext value={status}>{children}</AiStatusContext>
}

/** `ready`: this viewer can run AI right now. */
export function useAiStatus() {
  const status = useContext(AiStatusContext)
  return { ...status, ready: status.hasKey && status.canUse }
}

/** Shown next to an AI control while the viewer can't run AI. */
export function AiKeyNotice({ className }: { className?: string }) {
  const { ready, canUse, canManage } = useAiStatus()
  if (ready) return null
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground",
        className
      )}
    >
      <KeyIcon className="mt-px size-3.5 shrink-0" aria-hidden />
      {canUse ? (
        <span>
          AI needs an Anthropic API key in this workspace.{" "}
          {canManage ? (
            <Link
              href="/settings/api-key"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Add your key
            </Link>
          ) : (
            "Ask the workspace owner to add one."
          )}
        </span>
      ) : (
        <span>
          You don’t have AI access in this workspace. Ask the owner for it.
        </span>
      )}
    </p>
  )
}
