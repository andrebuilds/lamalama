import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"

import { site } from "@/shared/config/site"
import type { MemberRole } from "@/shared/db"

// Email clients ignore stylesheets, so styles are inline (same look as
// the magic-link email).
const styles = {
  body: {
    backgroundColor: "#EEF0F3",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    padding: "32px 0",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    margin: "0 auto",
    maxWidth: "480px",
    padding: "32px",
  },
  heading: { color: "#15171C", fontSize: "20px", margin: "0 0 16px" },
  brandName: {
    color: "#15171C",
    fontSize: "16px",
    fontWeight: 600,
    margin: 0,
  },
  text: { color: "#15171C", fontSize: "14px", lineHeight: "22px" },
  button: {
    backgroundColor: "#15171C",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 500,
    padding: "10px 16px",
  },
  muted: { color: "#5B6170", fontSize: "12px", lineHeight: "18px" },
} as const

const roleText: Record<MemberRole, string> = {
  OWNER: "an owner",
  ADMIN: "an admin",
  EDITOR: "an editor",
  VIEWER: "a viewer",
  CUSTOM: "a member",
}

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
          <Section style={{ marginBottom: "20px" }}>
            <Row>
              <Column style={{ width: "40px" }}>
                <Img
                  src={`${site.url}/favicon/android-chrome-192x192.png`}
                  width="32"
                  height="32"
                  alt=""
                  style={{ display: "block" }}
                />
              </Column>
              <Column>
                <Text style={styles.brandName}>{site.name}</Text>
              </Column>
            </Row>
          </Section>
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
          <Hr style={{ borderColor: "#D5D9E0", margin: "24px 0" }} />
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
