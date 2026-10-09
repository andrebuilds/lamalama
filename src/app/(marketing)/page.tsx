import { ArrowRightIcon, LogInIcon, SparklesIcon } from "lucide-react"
import type { Metadata } from "next"

import { site } from "@/shared/config/site"
import { Badge } from "@/shared/ui/badge"
import { LinkButton } from "@/shared/ui/link-button"

export const metadata: Metadata = {
  title: { absolute: `${site.name}: ${site.headline}` },
  alternates: { canonical: "/" },
}

const author = {
  "@type": "Person",
  name: site.author.name,
  url: site.author.url,
}

// Structured data for search engines and AI answers (schema.org).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      description: site.description,
      inLanguage: "en",
      publisher: author,
    },
    {
      "@type": "WebApplication",
      "@id": `${site.url}/#app`,
      name: site.name,
      alternateName: site.tagline,
      url: site.url,
      description: site.description,
      image: new URL("/og-image.png", site.url).href,
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "Video editor",
      operatingSystem: "Any (web browser)",
      browserRequirements: "Requires a modern web browser.",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      keywords: site.keywords.join(", "),
      license: "https://opensource.org/licenses/MIT",
      author,
      sameAs: [site.repo],
    },
    {
      "@type": "SoftwareSourceCode",
      name: site.name,
      codeRepository: site.repo,
      programmingLanguage: "TypeScript",
      runtimePlatform: "Node.js",
      license: "https://opensource.org/licenses/MIT",
      author,
    },
  ],
}

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 sm:py-32">
      <script
        type="application/ld+json"
        // Escaped so a "<" in any string can't close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Badge variant="outline" className="h-auto gap-1.5 px-3 py-2">
        <SparklesIcon className="size-3.5" />
        Open source · Built for founders who ship fast
      </Badge>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        {site.tagline}
      </h1>
      <p className="max-w-xl text-lg text-balance text-muted-foreground">
        Raw screen recordings don’t stop anyone’s scroll. {site.name} turns
        yours into a polished product video: cinematic camera moves, punchy
        text, slick motion graphics. No editor, no agency, no learning curve.
        Hit record, post, done.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton
          href="/sign-up"
          size="lg"
          icon={<ArrowRightIcon />}
          iconPosition="end"
        >
          Make your first video, free
        </LinkButton>
        <LinkButton
          href="/sign-in"
          size="lg"
          variant="outline"
          icon={<LogInIcon />}
        >
          Sign in
        </LinkButton>
      </div>
    </section>
  )
}
