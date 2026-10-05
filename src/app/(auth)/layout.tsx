import Link from "next/link"
import { redirect } from "next/navigation"

import { getSession } from "@/features/auth"
import { site } from "@/shared/config/site"
import { Logo } from "@/shared/ui/logo"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (await getSession()) redirect("/dashboard")

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center px-4 py-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 self-center text-lg font-semibold tracking-tight"
        >
          <Logo className="size-9" />
          {site.name}
        </Link>
        {children}
      </div>
    </div>
  )
}
