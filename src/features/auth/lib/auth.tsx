import "server-only"

import { createHash } from "node:crypto"

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { magicLink } from "better-auth/plugins/magic-link"

import { env } from "@/shared/config/env"
import { site } from "@/shared/config/site"
import { db } from "@/shared/db"
import { sendEmail } from "@/shared/email"
import { AppError } from "@/shared/lib/errors"
import { consumeRateLimit } from "@/shared/rate-limit"

import { MagicLinkEmail } from "../emails/magic-link-email"
import { WelcomeEmail } from "../emails/welcome-email"

// BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from the environment
// (validated in env.ts); the skill says not to repeat them here.
export const auth = betterAuth({
  appName: site.name,
  database: prismaAdapter(db, { provider: "postgresql" }),

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },

  user: {
    additionalFields: {
      // Admin access (M11). input: false — sign-up can never set it.
      role: { type: "string", input: false, defaultValue: "USER" },
      // Picked llama mascot (shown in the user menu). Only set through
      // account/actions.ts; an unknown id simply renders no mascot.
      mascot: { type: "string", required: false, input: false },
    },
  },

  account: {
    // One person, one account: Google, GitHub and magic link all resolve to
    // the same user when the email matches and the provider says it's
    // verified. Only Google is trusted outright (its account emails are
    // always verified); a GitHub email links only when GitHub verified it,
    // or anyone could claim an account with an unverified address.
    accountLinking: { enabled: true, trustedProviders: ["google"] },
    // Google/GitHub access and refresh tokens are stored AES-256-GCM
    // encrypted (security skill). We don't call their APIs yet, but a
    // database leak must not hand out working provider tokens.
    encryptOAuthTokens: true,
  },

  session: {
    // Saves a database read per request; sessions are re-checked every 5 min.
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  rateLimit: {
    // "memory" resets on every serverless cold start
    // (better-auth-security-best-practices).
    storage: "database",
  },

  // The profile form (updateProfile) is the only way to change the user:
  // the raw endpoint skips its validation and would accept any image URL.
  // auth.api.updateUser on the server still works.
  disabledPaths: ["/update-user"],

  databaseHooks: {
    user: {
      create: {
        // Runs once per person: account linking reuses the existing user.
        // A failed send must not fail the sign-up, so it's only logged.
        after: async (user) => {
          try {
            await sendEmail({
              to: user.email,
              subject: `Welcome to ${site.name}`,
              react: <WelcomeEmail name={user.name} />,
            })
          } catch (error) {
            console.warn("Couldn't send the welcome email", error)
          }
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/magic-link") return
      // The plugin's limit is per IP; this one stops anyone flooding a
      // single inbox from many addresses. Hashed: the counter row outlives
      // the window, and must not keep a plain email address.
      const email = String(ctx.body?.email ?? "").toLowerCase()
      try {
        await consumeRateLimit({
          key: `magic-link:${createHash("sha256").update(email).digest("hex")}`,
          limit: 5,
          windowSeconds: 60 * 60,
          message: "Too many sign-in links. Try again later.",
        })
      } catch (error) {
        if (error instanceof AppError) throw new APIError("TOO_MANY_REQUESTS")
        throw error
      }
    }),
  },

  plugins: [
    magicLink({
      expiresIn: 60 * 5,
      // A leaked database row can't be used to sign in.
      storeToken: "hashed",
      rateLimit: { window: 60, max: 3 },
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: `Your ${site.name} sign-in link`,
          react: <MagicLinkEmail url={url} />,
        })
      },
    }),
    // Must be last: lets Server Actions set auth cookies.
    nextCookies(),
  ],
})
