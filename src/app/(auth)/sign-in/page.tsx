import type { Metadata } from "next"
import Image from "next/image"

import { authErrorMessage, SignInCard } from "@/features/auth"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to LamaLama with Google, GitHub or an email link.",
  alternates: { canonical: "/sign-in" },
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <>
      <SignInCard mode="sign-in" errorMessage={authErrorMessage(error)} />
      {/* Llama logging in at its retro PC; cropped flush to the chair, so
          bottom-0 really touches the screen edge. */}
      <Image
        src="/15-login-llama-at-retro-pc-v2.png"
        alt=""
        aria-hidden
        priority
        width={480}
        height={608}
        sizes="240px"
        className="pointer-events-none fixed bottom-0 left-4 hidden w-56 select-none lg:block xl:w-64"
      />
    </>
  )
}
