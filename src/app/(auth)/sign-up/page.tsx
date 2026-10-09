import type { Metadata } from "next"
import Image from "next/image"

import { authErrorMessage, SignInCard } from "@/features/auth"

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create a free LamaLama account and turn your first screen recording into a product video in minutes.",
  alternates: { canonical: "/sign-up" },
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <>
      <SignInCard mode="sign-up" errorMessage={authErrorMessage(error)} />
      {/* Llama signing up with its pencil; cropped flush to the paper, so
          bottom-0 really touches the screen edge. */}
      <Image
        src="/16-signup-llama-pencil-ground-v2.png"
        alt=""
        aria-hidden
        priority
        width={560}
        height={426}
        sizes="280px"
        className="pointer-events-none fixed right-4 bottom-0 hidden w-64 select-none lg:block xl:w-80"
      />
    </>
  )
}
