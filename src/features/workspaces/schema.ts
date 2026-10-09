import { z } from "zod"

import { grantablePermissions } from "./lib/permissions"

export const workspaceNameMaxLength = 50

export const renameWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name for your workspace.")
    .max(
      workspaceNameMaxLength,
      `Keep the name under ${workspaceNameMaxLength} characters.`
    ),
})

// Same rules: a new workspace only needs a valid name.
export const createWorkspaceSchema = renameWorkspaceSchema

const permissionsField = z.array(z.enum(grantablePermissions)).max(20)

/** Grants permissions, never ownership: that doesn't travel by email. */
export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address.").max(254),
  permissions: permissionsField,
})

export const changeMemberAccessSchema = z.object({
  membershipId: z.string().min(1),
  permissions: permissionsField,
})

export const membershipIdSchema = z.string().min(1)

export const invitationIdSchema = z.string().min(1)
