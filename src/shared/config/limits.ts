/**
 * App-wide limits. LamaLama is free for now (owner, 2026-09-28): no plans,
 * any number of brand kits and clips. What's left are safety caps.
 */

const MB = 1024 * 1024

/** Every clip, uploaded or recorded. */
export const clipLimits = {
  /** Largest file a user may upload or record. */
  maxBytes: 1024 * MB,
  /** Longest clip, checked again on the real file by the worker. */
  maxDurationSeconds: 10 * 60,
} as const

/** Caps on costly AI work, per workspace. */
export const aiLimits = {
  /** "Create from URL" drafts per workspace per day (each is an AI call). */
  brandKitDraftsPerDay: 20,
  /** "Direct with AI" requests for footage motion per workspace per day. */
  motionDirectionsPerDay: 40,
  /** Key moments the AI describes from a frame, per workspace per day. */
  momentDescriptionsPerDay: 300,
  /** "Let AI choose" a graphic for a moment, per workspace per day. */
  graphicSuggestionsPerDay: 100,
} as const

/**
 * Caps per user, across all their workspaces: workspace limits alone are
 * dodged by creating more workspaces. They protect the shared worker, the
 * bucket and the email domain from a single account.
 */
export const userLimits = {
  /** Shared workspaces a user can create per day. */
  workspacesPerDay: 5,
  /** Clip uploads and recordings a user can start per day. */
  clipUploadsPerDay: 100,
  /** Exports a user can start per day. */
  exportsPerDay: 50,
  /** Invitation emails a user can send per day. */
  invitesPerDay: 40,
  /** API keys a user can check against Anthropic per hour. */
  apiKeyChecksPerHour: 10,
} as const
