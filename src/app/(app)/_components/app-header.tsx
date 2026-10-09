"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/shared/ui/separator"
import { SidebarTrigger } from "@/shared/ui/sidebar"
import { ThemeToggle } from "@/shared/ui/theme-toggle"

import { titleFor } from "./nav-config"
import { LlamaRain } from "./llama-rain"

// The user menu lives only in the sidebar footer; the header keeps the
// page title plus global actions (GitHub stars, theme).
export function AppHeader({ actions }: { actions?: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-6 md:px-8">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <span className="text-sm font-medium">{titleFor(pathname)}</span>
      <div className="ml-auto flex items-center gap-1">
        <LlamaRain />
        <Separator
          orientation="vertical"
          className="mx-1.5 data-vertical:h-4 data-vertical:self-auto"
        />
        {actions}
        <Separator
          orientation="vertical"
          className="mx-1.5 data-vertical:h-4 data-vertical:self-auto"
        />
        <ThemeToggle />
      </div>
    </header>
  )
}
