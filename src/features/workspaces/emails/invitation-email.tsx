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

export function InvitationEmail({
  url,
  workspaceName,
  inviterName,
  role,
}: {
  url: string
  workspaceName: string
  inviterName: string
  role: MemberRole
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {inviterName} invited you to {workspaceName} on {site.name}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />
          <Heading style={styles.heading}>
            Join {workspaceName} on {site.name}
          </Heading>
          <Text style={styles.text}>
            {inviterName} invited you to the workspace “{workspaceName}” as{" "}
            {roleText[role]}. Click the button below to accept.
          </Text>
          <Button href={url} style={styles.button}>
            Accept invitation
          </Button>
          <Hr style={styles.hr} />
          <Text style={styles.muted}>
            The invitation expires in 7 days and only works for this email
            address. No account yet? Sign up with this address first, then open
            the link again. Didn’t expect this? You can ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
