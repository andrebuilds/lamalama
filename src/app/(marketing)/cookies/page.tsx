import type { Metadata } from "next"

import { CookiePolicy } from "@/features/legal"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "LamaLama uses only technical cookies: no analytics, no ads, no tracking. Here is every one of them.",
  alternates: { canonical: "/cookies" },
}

export default function CookiesPage() {
  return <CookiePolicy />
}
