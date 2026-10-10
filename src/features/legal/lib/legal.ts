import { site } from "@/shared/config/site"

/**
 * Facts the legal pages state. Keep them true: when the code adds a cookie,
 * a provider or a new kind of data, update this file and `updated`.
 */
export const legal = {
  updated: "10 October 2026",
  controller: site.author.name,
  country: "Italy",
  email: "legal@lamalama.video",
} as const

/** localStorage key that remembers the dismissed cookie notice. */
export const cookieNoticeKey = "lamalama:cookie-notice"

/** Every cookie the site sets. All first-party and strictly necessary. */
export const cookies = [
  {
    name: "__Secure-better-auth.session_token",
    purpose: "Keeps you signed in.",
    duration: "7 days, renewed while you use the app",
  },
  {
    name: "__Secure-better-auth.session_data",
    purpose:
      "A signed copy of your session, so not every page has to ask the database.",
    duration: "5 minutes",
  },
  {
    name: "__Secure-better-auth.state",
    purpose:
      "Protects sign-in with Google or GitHub against forged requests. Set only while you sign in that way.",
    duration: "5 minutes",
  },
  {
    name: "active_workspace",
    purpose: "Remembers which workspace you were working in.",
    duration: "1 year",
  },
  {
    name: "sidebar_state",
    purpose: "Remembers whether you collapsed the app sidebar.",
    duration: "7 days",
  },
  {
    name: "byok_welcome_seen",
    purpose:
      "Remembers that you skipped the AI key welcome screen, so it doesn't show again. Holds your account id.",
    duration: "1 year",
  },
] as const

/** Everything kept in the browser's localStorage. Never sent to us. */
export const localStorageItems = [
  { name: "theme", purpose: "Your light or dark theme." },
  {
    name: "lamalama:timeline-height",
    purpose: "The height you dragged the editor timeline to.",
  },
  { name: cookieNoticeKey, purpose: "That you dismissed the cookie notice." },
] as const

/** Providers that process personal data for LamaLama. */
export const providers = [
  {
    name: "Railway",
    role: "Hosts the website and the background jobs that process videos.",
    location: "Servers in the EU (Amsterdam, Netherlands). Company in the USA.",
    url: "https://railway.com/legal/privacy",
  },
  {
    name: "Neon",
    role: "Database and file storage: your account, workspaces, recordings, logos and exported videos.",
    location: "Servers in the EU (Frankfurt, Germany). Company in the USA.",
    url: "https://neon.com/privacy-policy",
  },
  {
    name: "Resend",
    role: "Sends the emails: sign-in links and workspace invitations.",
    location: "Sending from the EU (Ireland). Company in the USA.",
    url: "https://resend.com/legal/privacy-policy",
  },
] as const
