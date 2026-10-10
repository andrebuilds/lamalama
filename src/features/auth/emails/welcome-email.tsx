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
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"

import { site } from "@/shared/config/site"

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
  stepTitle: {
    color: "#15171C",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "22px",
    margin: "16px 0 0",
  },
  stepText: {
    color: "#5B6170",
    fontSize: "14px",
    lineHeight: "22px",
    margin: 0,
  },
  button: {
    backgroundColor: "#15171C",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 500,
    padding: "10px 16px",
  },
  link: { color: "#15171C", textDecoration: "underline" },
  muted: { color: "#5B6170", fontSize: "12px", lineHeight: "18px" },
} as const

const steps = [
  {
    title: "1. Create a brand kit",
    text: "Paste your website and we draft your colours, fonts and logo, so every video looks like yours.",
  },
  {
    title: "2. Record or upload your app",
    text: "Record your screen right in the browser, or upload a recording. The AI finds the key moments.",
  },
  {
    title: "3. Let the AI direct the first cut",
    text: "Camera moves, cuts, speed, text and motion graphics, then polish everything in the motion studio.",
  },
  {
    title: "4. Export or share",
    text: "Render an MP4 in 16:9, 9:16, 1:1 or 4:5, or send a link anyone can watch.",
  },
]

export function WelcomeEmail({ name }: { name?: string | null }) {
  const firstName = name?.trim().split(/\s+/)[0]

  return (
    <Html lang="en">
      <Head />
      <Preview>
        Welcome to {site.name}: turn screen recordings into product videos
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
          <Heading style={styles.heading}>Welcome to {site.name}</Heading>
          <Text style={styles.text}>
            {firstName ? `Hi ${firstName},` : "Hi there,"}
          </Text>
          <Text style={styles.text}>
            {site.name} turns screen recordings into product videos that sell:
            launches, feature announcements, walkthroughs and social clips.
            Everything runs in your browser, and it’s free and open source.
          </Text>
          <Text style={{ ...styles.text, margin: "16px 0 0" }}>
            Here’s how to make your first video:
          </Text>
          <Section>
            {steps.map((step) => (
              <div key={step.title}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </div>
            ))}
          </Section>
          <Text style={{ ...styles.text, margin: "20px 0" }}>
            The AI runs on your own Anthropic API key: add it anytime in
            Settings → API key. You pay Anthropic only for what you use, and a
            typical video costs a few cents. Working with a team? Invite them to
            your workspace from Settings.
          </Text>
          <Button href={`${site.url}/dashboard`} style={styles.button}>
            Open {site.name}
          </Button>
          <Hr style={{ borderColor: "#D5D9E0", margin: "24px 0" }} />
          <Text style={styles.muted}>
            Questions or ideas? Just reply to this email. {site.name} is open
            source:{" "}
            <Link href={site.repo} style={styles.link}>
              star it, report bugs or contribute on GitHub
            </Link>
            .
          </Text>
          <Text style={styles.muted}>
            You’re getting this email because you just created a {site.name}{" "}
            account. It’s the only welcome email we send.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
