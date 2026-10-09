import type { Metadata } from "next"

import { ApiKeyForm, getKeyStatus } from "@/features/ai-keys"
import { can, getCurrentWorkspace } from "@/features/workspaces"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"

export const metadata: Metadata = { title: "API key" }

export default async function ApiKeySettingsPage() {
  const { workspace, actions } = await getCurrentWorkspace()
  const canManage = can(actions, "apikey:manage")
  const status = canManage ? await getKeyStatus(workspace.id) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anthropic API key</CardTitle>
        <CardDescription>
          LamaLama is bring-your-own-key: every AI feature in this workspace
          (brand kit drafts, moment descriptions, AI direction) runs on the key
          saved here, billed to its Anthropic account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {canManage ? (
          <>
            <p className="text-sm text-muted-foreground">
              {status
                ? `A key ending in …${status.hint} is saved and in use.`
                : "No key saved yet, so AI features are off for everyone in this workspace."}{" "}
              Create or manage keys in the{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Anthropic console
              </a>
              .
            </p>
            <ApiKeyForm hint={status?.hint} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            You can’t manage the API key in this workspace. Ask the owner to add
            or update it, or to give you access.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
