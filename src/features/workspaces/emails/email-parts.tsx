import { Column, Img, Row, Section, Text } from "@react-email/components"

import { site } from "@/shared/config/site"
import type { MemberRole } from "@/shared/db"

// Shared by the workspace emails. Email clients ignore stylesheets, so
// styles are inline (same look as the magic-link email).
export const styles = {
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
  hr: { borderColor: "#D5D9E0", margin: "24px 0" },
  muted: { color: "#5B6170", fontSize: "12px", lineHeight: "18px" },
} as const

export const roleText: Record<MemberRole, string> = {
  OWNER: "an owner",
  ADMIN: "an admin",
  EDITOR: "an editor",
  VIEWER: "a viewer",
  CUSTOM: "a member",
}

/** Logo and name. Absolute URL: email clients can't load relative assets. */
export function EmailHeader() {
  return (
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
  )
}
