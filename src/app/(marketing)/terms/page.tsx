import type { Metadata } from "next"

import { TermsOfService } from "@/features/legal"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules for using LamaLama: your account, your content, AI features and how to report illegal content.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return <TermsOfService />
}
