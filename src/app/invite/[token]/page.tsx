import { MailQuestionIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { getSession } from "@/features/auth"
import { AcceptInvitationButton, getInvitation } from "@/features/workspaces"
import { site } from "@/shared/config/site"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { LinkButton } from "@/shared/ui/link-button"
import { Logo } from "@/shared/ui/logo"

export const metadata: Metadata = {
  title: "Invitation",
  // Private links: never in search results.
  robots: { index: false, follow: false },
}

const roleText = {
  OWNER: "an owner",
  ADMIN: "an admin",
  EDITOR: "an editor",
  VIEWER: "a viewer",
  CUSTOM: "a member",
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const [invitation, session] = await Promise.all([
    getInvitation(token),
    getSession(),
  ])

  const expired = invitation && invitation.expiresAt < new Date()
  const wrongAccount =
    invitation &&
    session &&
    session.user.email.toLowerCase() !== invitation.email

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 self-center text-lg font-semibold tracking-tight"
        >
          <Logo className="size-9" />
          {site.name}
        </Link>
        <Card className="[--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
          {!invitation || expired ? (
            <>
              <CardHeader className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
                  <MailQuestionIcon className="size-6" aria-hidden />
                </div>
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  {expired ? "Invitation expired" : "Invitation not found"}
                </CardTitle>
                <CardDescription className="text-base">
                  {expired
                    ? "This invitation is older than 7 days. Ask the workspace owner to send a new one."
                    : "This invitation doesn’t exist or was revoked. Ask the workspace owner to send a new one."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LinkButton href="/" variant="outline" className="w-full">
                  Go to the home page
                </LinkButton>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="gap-2 text-center">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Join {invitation.workspace.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {invitation.invitedBy.name || "A workspace owner"} invited you
                  to join “{invitation.workspace.name}” on {site.name} as{" "}
                  {roleText[invitation.role]}.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!session ? (
                  <>
                    <p className="text-center text-sm text-muted-foreground">
                      Sign in (or create an account) with{" "}
                      <span className="font-medium text-foreground">
                        {invitation.email}
                      </span>
                      , then open this link again.
                    </p>
                    <LinkButton href="/sign-up" size="lg" className="w-full">
                      Create an account
                    </LinkButton>
                    <LinkButton
                      href="/sign-in"
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
                      Sign in
                    </LinkButton>
                  </>
                ) : wrongAccount ? (
                  <p className="text-center text-sm text-muted-foreground">
                    This invitation was sent to{" "}
                    <span className="font-medium text-foreground">
                      {invitation.email}
                    </span>
                    , but you’re signed in as{" "}
                    <span className="font-medium text-foreground">
                      {session.user.email}
                    </span>
                    . Sign in with the invited address to accept it.
                  </p>
                ) : (
                  <AcceptInvitationButton token={token} />
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}
