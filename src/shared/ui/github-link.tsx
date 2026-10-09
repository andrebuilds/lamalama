import { StarIcon } from "lucide-react"

import { site } from "@/shared/config/site"
import { cn } from "@/shared/lib/utils"
import { buttonVariants } from "@/shared/ui/button"

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

// Lucide dropped brand icons, so the GitHub mark is inlined.
function GitHubMark(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

/**
 * Link to the repo (site.repo) with the live star count, used in the app
 * header and the marketing footer. Server component: the count is fetched at
 * render time and cached for an hour; if the repo is private or GitHub is
 * unreachable, only the icon shows.
 */
export async function GitHubLink() {
  let stars: number | null = null
  try {
    const repoPath = new URL(site.repo).pathname.replace(/^\/+|\/+$/g, "")
    const response = await fetch(`https://api.github.com/repos/${repoPath}`, {
      next: { revalidate: 3600 },
    })
    if (response.ok) {
      const repo: { stargazers_count?: number } = await response.json()
      stars = repo.stargazers_count ?? null
    }
  } catch {
    // Offline or rate-limited: the link still works without a count.
  }

  return (
    <a
      href={site.repo}
      target="_blank"
      rel="noreferrer"
      aria-label={`Star ${site.name} on GitHub`}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "gap-1.5 px-2.5"
      )}
    >
      <GitHubMark className="size-4" />
      <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
        <StarIcon className="size-3.5 fill-current" />
        {stars !== null ? compact.format(stars) : "Star"}
      </span>
    </a>
  )
}
