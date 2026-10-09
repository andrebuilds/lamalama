"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useSyncExternalStore } from "react"

import { Button } from "@/shared/ui/button"

/**
 * Light/dark switch. The root layout's inline script applies the stored
 * theme before hydration; this component only reads and toggles the class,
 * so there is no flash and no extra dependency.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ["class"] })
  return () => observer.disconnect()
}

const isDark = () => document.documentElement.classList.contains("dark")

export function ThemeToggle() {
  // Follows the <html> class; the server render assumes light.
  const dark = useSyncExternalStore(subscribe, isDark, () => false)

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {
      // Private mode: the choice simply resets on the next visit.
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <SunIcon className="scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
      <MoonIcon className="absolute scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
    </Button>
  )
}
