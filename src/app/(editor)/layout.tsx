import type { Metadata } from "next"

import { hasAiKey } from "@/features/ai-keys"
import { can, getCurrentWorkspace } from "@/features/workspaces"
import { AiStatusProvider } from "@/shared/ai/ai-status"
import { cn } from "@/shared/lib/utils"
import { buttonVariants } from "@/shared/ui/button"

// Private pages: never in search results.
export const metadata: Metadata = { robots: { index: false, follow: false } }

/**
 * Full-screen editors (the footage editor): no app sidebar or top bar, so
 * the stage and timeline get the whole window. getCurrentWorkspace() is the
 * same sign-in gate the app layout uses.
 */
export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { workspace, actions } = await getCurrentWorkspace()
  const aiReady = await hasAiKey(workspace.id)
  return (
    <>
      {/* First tab stop: jumps past the editor's top bar (WCAG 2.4.1). */}
      <a
        href="#main-content"
        className={cn(
          buttonVariants(),
          "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        )}
      >
        Skip to content
      </a>
      {/* Same AI status as the app shell: the editor's AI controls read it. */}
      <AiStatusProvider
        hasKey={aiReady}
        canUse={can(actions, "ai:use")}
        canManage={can(actions, "apikey:manage")}
      >
        {children}
      </AiStatusProvider>
    </>
  )
}
