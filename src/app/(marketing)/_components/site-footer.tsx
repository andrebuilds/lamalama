import { MailIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { site } from "@/shared/config/site"
import { cn } from "@/shared/lib/utils"
import { buttonVariants } from "@/shared/ui/button"
import { GitHubLink } from "@/shared/ui/github-link"
import { Logo } from "@/shared/ui/logo"
import { Separator } from "@/shared/ui/separator"
import { ThemeToggle } from "@/shared/ui/theme-toggle"

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
] as const

/**
 * Server component: pulls the author's GitHub profile so the footer shows
 * the real avatar, cached for a day. Falls back to GitHub's avatar
 * endpoint (no API, no rate limit) if the API call fails.
 */
export async function SiteFooter() {
  const username = new URL(site.author.url).pathname.replace(/^\/+|\/+$/g, "")
  let avatar = `https://github.com/${username}.png?size=48`
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      next: { revalidate: 86400 },
    })
    if (response.ok) {
      const profile: { avatar_url?: string } = await response.json()
      if (profile.avatar_url) avatar = profile.avatar_url
    }
  } catch {
    // Offline or rate-limited: the fallback avatar URL still works.
  }

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-2.5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="flex items-center gap-2">
          <Logo className="size-6" />
          <span className="flex flex-wrap items-center gap-x-1.5">
            {site.name} is free and open source, crafted by{" "}
            <a
              href={site.author.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
            >
              {/* Through next/image, so visitors' browsers never call
                  GitHub: our server fetches the avatar. */}
              <Image
                src={avatar}
                alt=""
                width={20}
                height={20}
                className="size-5 rounded-full border"
              />
              {site.author.name}
            </a>
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <nav aria-label="Legal" className="flex items-center gap-3 pr-1.5">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Separator
            orientation="vertical"
            className="mx-1.5 data-vertical:h-4 data-vertical:self-auto"
          />
          <GitHubLink />
          <Separator
            orientation="vertical"
            className="mx-1.5 data-vertical:h-4 data-vertical:self-auto"
          />
          <a
            href={`mailto:${site.email}`}
            aria-label={`Email ${site.email}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" })
            )}
          >
            <MailIcon />
          </a>
          <Separator
            orientation="vertical"
            className="mx-1.5 data-vertical:h-4 data-vertical:self-auto"
          />
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
