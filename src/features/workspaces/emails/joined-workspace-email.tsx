import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components"

import { site } from "@/shared/config/site"
import type { MemberRole } from "@/shared/db"

import { EmailHeader, roleText, styles } from "./email-parts"

/** To the person who accepted: confirms they're now in the workspace. */
export function JoinedWorkspaceEmail({
  workspaceName,
  inviterName,
  role,
}: {
  workspaceName: string
  inviterName: string
  role: MemberRole
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        You’re now a member of {workspaceName} on {site.name}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />
          <Heading style={styles.heading}>Welcome to {workspaceName}</Heading>
          <Text style={styles.text}>
            You accepted {inviterName}’s invitation and you’re now part of the
            workspace “{workspaceName}” as {roleText[role]}. Its brand kits,
            footage and videos are waiting for you.
          </Text>
          <Button href={`${site.url}/dashboard`} style={styles.button}>
            Open {workspaceName}
          </Button>
          <Hr style={styles.hr} />
          <Text style={styles.muted}>
            Switch between your workspaces from the sidebar. You can leave this
            one anytime in Settings → Workspace.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
