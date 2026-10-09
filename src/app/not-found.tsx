import { HomeIcon, LayoutDashboardIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"

import { getSession } from "@/features/auth"
import { LinkButton } from "@/shared/ui/link-button"

// Shown as "Page not found · LamaLama" via the root layout's title template.
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn’t exist or has moved.",
  robots: { index: false },
}

/**
 * Server component: the destination depends on the session. Signed-in
 * visitors go back to their dashboard, everyone else to the landing page.
 */
export default async function NotFound() {
  const session = await getSession()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <Image
        src="/09-404-lost-llama-v2.png"
        alt=""
        aria-hidden
        priority
        width={800}
        height={600}
        sizes="384px"
        className="w-72 max-w-full select-none sm:w-96"
      />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold tracking-widest text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Even our llama got lost on this one. This page doesn’t exist or has
          moved.
        </p>
      </div>
      {session ? (
        <LinkButton href="/dashboard" icon={<LayoutDashboardIcon />}>
          Go to dashboard
        </LinkButton>
      ) : (
        <LinkButton href="/" icon={<HomeIcon />}>
          Back to the home page
        </LinkButton>
      )}
    </main>
  )
}
