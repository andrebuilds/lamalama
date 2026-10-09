import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ApiKeyForm, getKeyStatus, skipByokWelcome } from "@/features/ai-keys"
import { getCurrentWorkspace } from "@/features/workspaces"
import { site } from "@/shared/config/site"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Logo } from "@/shared/ui/logo"

export const metadata: Metadata = {
  title: "Bring your own AI key",
  robots: { index: false, follow: false },
}

/**
 * Shown once after sign-up (the app layout redirects here while the
 * workspace has no key and the skip cookie isn't set). Soft gate: the key
 * can be added now or later from Settings → API key.
 */
export default async function WelcomePage() {
  const { workspace } = await getCurrentWorkspace()
  if (await getKeyStatus(workspace.id)) redirect("/dashboard")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="flex items-center gap-2.5 self-center text-lg font-semibold tracking-tight">
          <Logo className="size-9" />
          {site.name}
        </div>
        <Card className="[--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
          <CardHeader className="gap-2 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Bring your own AI key
            </CardTitle>
            <CardDescription className="text-base">
              {site.name} is free and open source, so the AI runs on your own
              Anthropic API key instead of ours. You pay Anthropic only for what
              you use; a typical video costs a few cents.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
              <li>
                Create a key in the{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Anthropic console
                </a>{" "}
                (an Anthropic account is required).
              </li>
              <li>
                Paste it below. It’s checked with Anthropic, stored encrypted
                and never leaves the server.
              </li>
              <li>You can replace or remove it anytime in Settings.</li>
            </ol>
            <ApiKeyForm redirectTo="/dashboard" />
            <form action={skipByokWelcome} className="self-center">
              <Button type="submit" variant="ghost">
                I’ll do it later
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
