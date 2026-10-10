import type { Metadata } from "next"

import { PrivacyPolicy } from "@/features/legal"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal data LamaLama collects, why, who processes it and your rights under the GDPR.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return <PrivacyPolicy />
}
