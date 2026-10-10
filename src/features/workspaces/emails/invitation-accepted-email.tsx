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

/** To the person who sent the invitation: it was accepted. */
export function InvitationAcceptedEmail({
  memberName,
  workspaceName,
  role,
}: {
  memberName: string
  workspaceName: string
  role: MemberRole
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {memberName} joined {workspaceName} on {site.name}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />
          <Heading style={styles.heading}>
            {memberName} joined {workspaceName}
          </Heading>
          <Text style={styles.text}>
            {memberName} accepted your invitation and is now part of the
            workspace “{workspaceName}” as {roleText[role]}.
          </Text>
          <Button href={`${site.url}/settings/workspace`} style={styles.button}>
            Manage members
          </Button>
          <Hr style={styles.hr} />
          <Text style={styles.muted}>
            You’re getting this email because you invited {memberName}. You can
            change their access or remove them anytime in Settings → Workspace.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
