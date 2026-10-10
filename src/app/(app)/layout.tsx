import { KeyIcon } from "lucide-react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import { findMascot } from "@/features/account"
import { BYOK_WELCOME_COOKIE, getKeyStatus, hasAiKey } from "@/features/ai-keys"
import { SignOutMenuItem } from "@/features/auth"
import {
  can,
  getCurrentWorkspace,
  listWorkspaces,
  WorkspaceSwitcher,
} from "@/features/workspaces"
import { AiStatusProvider } from "@/shared/ai/ai-status"
import { cn } from "@/shared/lib/utils"
import { buttonVariants } from "@/shared/ui/button"
import { GitHubLink } from "@/shared/ui/github-link"
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar"

import { AppHeader } from "./_components/app-header"
import { AppSidebar } from "./_components/app-sidebar"
import { userMenuItemClass } from "./_components/nav-config"

// Private pages: never in search results.
export const metadata: Metadata = { robots: { index: false, follow: false } }

/**
 * App shell. getCurrentWorkspace() is the server-side
 * gate for every (app) page: it redirects signed-out visitors and creates
 * the personal workspace on first use.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, workspace, actions } = await getCurrentWorkspace()
  const canManageKey = can(actions, "apikey:manage")
  const jar = await cookies()
  // Remember collapsed/expanded across visits (cookie set by the sidebar).
  const sidebarOpen = jar.get("sidebar_state")?.value !== "false"

  // BYOK soft gate: fresh accounts see /welcome once; after skipping, the
  // banner below keeps pointing at settings until a key is saved. The gate
  // looks at the saved key only, so the dev env fallback doesn't hide it.
  // The skip cookie counts only for the user who set it.
  const [savedKey, aiReady] = await Promise.all([
    getKeyStatus(workspace.id),
    hasAiKey(workspace.id),
  ])
  if (!savedKey && jar.get(BYOK_WELCOME_COOKIE)?.value !== user.id) {
    redirect("/welcome")
  }

  const menuUser = {
    name: user.name,
    email: user.email,
    image: user.image,
    mascot: findMascot(user.mascot),
  }
  const signOutItem = <SignOutMenuItem className={userMenuItemClass} />
  const workspaces = await listWorkspaces(user.id)

  return (
    <>
      {/* First tab stop: jumps past the sidebar and top bar (WCAG 2.4.1). */}
      <a
        href="#main-content"
        className={cn(
          buttonVariants(),
          "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        )}
      >
        Skip to content
      </a>
      <SidebarProvider defaultOpen={sidebarOpen}>
        <AppSidebar
          workspaceSwitcher={
            <WorkspaceSwitcher
              workspaces={workspaces}
              currentId={workspace.id}
            />
          }
          user={menuUser}
          signOutItem={signOutItem}
        />
        <SidebarInset>
          <AppHeader actions={<GitHubLink />} />
          {!aiReady && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b bg-accent px-6 py-2.5 text-sm text-accent-foreground md:px-8">
              <KeyIcon className="size-4 shrink-0" aria-hidden />
              <p>
                AI features are off: this workspace has no Anthropic API key
                yet.
              </p>
              {canManageKey ? (
                <Link
                  href="/settings/api-key"
                  className="font-medium underline underline-offset-4"
                >
                  Add your key
                </Link>
              ) : (
                <span className="text-muted-foreground">
                  Ask the workspace owner to add one.
                </span>
              )}
            </div>
          )}
          <div
            id="main-content"
            tabIndex={-1}
            className="flex flex-1 flex-col p-6 outline-none md:p-8"
          >
            {/* Centred column; text stays left-aligned. */}
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
              <AiStatusProvider
                hasKey={aiReady}
                canUse={can(actions, "ai:use")}
                canManage={canManageKey}
              >
                {children}
              </AiStatusProvider>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
