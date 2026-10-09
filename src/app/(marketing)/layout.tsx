import Image from "next/image"

import { SiteFooter } from "./_components/site-footer"
import { SiteHeader } from "./_components/site-header"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="relative flex-1">
        {children}
        {/* Llama peeking down from under the navbar, looking at the hero.
            The artwork touches its canvas top edge, so top-0 glues the neck
            to the header border. */}
        <Image
          src="/11-hero-llama-navbar-looking-at-h1.png"
          alt=""
          aria-hidden
          priority
          width={460}
          height={500}
          sizes="230px"
          className="pointer-events-none absolute top-0 right-10 hidden w-44 select-none lg:block xl:right-24 xl:w-52"
        />
        {/* Decorative llamas resting on the footer line. The artwork has
            transparent margins (measured: 7.1% and 10.3% below the feet,
            plus wide side gutters), compensated with exact translates so
            the feet really touch the border. */}
        <Image
          src="/04-single-curious.png"
          alt=""
          aria-hidden
          priority
          width={640}
          height={640}
          sizes="320px"
          className="pointer-events-none absolute bottom-0 left-0 hidden w-64 -translate-x-[22%] translate-y-[7.1%] select-none lg:block xl:w-80"
        />
        <Image
          src="/06-pair-side-by-side.png"
          alt=""
          aria-hidden
          priority
          width={768}
          height={768}
          sizes="384px"
          className="pointer-events-none absolute right-0 bottom-0 hidden w-72 translate-x-[14%] translate-y-[10.3%] select-none lg:block xl:w-96"
        />
      </main>
      <SiteFooter />
    </div>
  )
}
