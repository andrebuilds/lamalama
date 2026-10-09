import { z } from "zod"

import { mascotIds } from "./lib/mascots"

/** A mascot id, or null to show none. */
export const mascotSchema = z.enum(mascotIds).nullable()

/** Deleting the account: the user types their email to confirm. */
export const deleteAccountSchema = z.object({
  email: z.string().trim().toLowerCase(),
})
