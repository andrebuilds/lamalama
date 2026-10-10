"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useSyncExternalStore } from "react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

import { cookieNoticeKey } from "../lib/legal"

/**
 * Cookie notice. The site sets only technical cookies, so there is nothing
 * to consent to: the notice just informs, once. Dismissing it makes the
 * cookie-eating llama hop with joy, then remembers the choice in
 * localStorage.
 */
const listeners = new Set<() => void>()
// Fallback when localStorage is blocked: hidden until the next page load.
let dismissedInMemory = false

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener("storage", onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

function isDismissed() {
  if (dismissedInMemory) return true
  try {
    return localStorage.getItem(cookieNoticeKey) !== null
  } catch {
    return false
  }
}

function dismiss() {
  dismissedInMemory = true
  try {
    localStorage.setItem(cookieNoticeKey, new Date().toISOString())
  } catch {
    // Private mode: the notice comes back on the next visit.
  }
  listeners.forEach((listener) => listener())
}

// How long the llama takes to eat the cookie, then to walk off.
const EAT_MS = 900
const LEAVE_MS = 300

export function CookieNotice() {
  // The server render assumes dismissed, so nobody sees a flash of it.
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true)
  const [phase, setPhase] = useState<"open" | "eating" | "leaving">("open")

  if (dismissed) return null

  const eat = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dismiss()
      return
    }
    setPhase("eating")
    setTimeout(() => setPhase("leaving"), EAT_MS)
    setTimeout(dismiss, EAT_MS + LEAVE_MS)
  }

  const eating = phase !== "open"

  return (
    <section
      aria-label="Cookie notice"
      className={cn(
        "fixed inset-x-4 bottom-4 z-50 flex max-w-sm gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-lg transition-all duration-300 sm:right-auto",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4",
        phase === "leaving" && "translate-y-4 opacity-0"
      )}
    >
      {/* The artwork is 4:3 with wide empty sides: object-cover crops them
          so the llama fills the square. */}
      <Image
        src="/34-cookie-banner-llama-eating-cookie.png"
        alt=""
        aria-hidden
        width={2176}
        height={1632}
        sizes="80px"
        className={cn(
          "size-20 shrink-0 object-cover select-none",
          eating && "animate-bounce"
        )}
      />
      <div className="flex min-w-0 flex-col gap-2 text-sm">
        {eating ? (
          <p className="my-auto font-medium" role="status">
            Nom nom. Delicious. Thanks for reading!
          </p>
        ) : (
          <>
            <p className="font-semibold">Llama cookie inspection</p>
            <p className="text-muted-foreground">
              Our llama sniffed every corner of this site and found only the
              cookies that keep you signed in. No trackers, no ads, no
              analytics. Honestly, it&apos;s a little disappointed.
            </p>
            <div className="mt-1 flex items-center gap-3">
              <Button size="sm" onClick={eat}>
                Feed the llama
              </Button>
              <Link
                href="/cookies"
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Cookie Policy
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
