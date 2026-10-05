import { site } from "@/shared/config/site"
import { Logo } from "@/shared/ui/logo"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="flex items-center gap-2">
          <Logo className="size-6" />
          <span>
            {site.name} is open source, made by{" "}
            <a
              href={site.author.url}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {site.author.name}
            </a>
            .
          </span>
        </p>
        <a
          href={site.repo}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Source on GitHub
        </a>
      </div>
    </footer>
  )
}
