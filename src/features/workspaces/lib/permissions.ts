import type { MemberRole } from "@/shared/db"
import { AppError } from "@/shared/lib/errors"

/**
 * What the owner can grant to a member, one by one. Roles below are just
 * named presets of these; a member with any other mix is CUSTOM.
 */
export const grantablePermissions = [
  "brandkits:manage",
  "footage:upload",
  "footage:edit",
  "footage:delete",
  "videos:manage",
  "ai:use",
  "render:start",
  "members:manage",
  "apikey:manage",
  "workspace:manage",
] as const

export type Permission = (typeof grantablePermissions)[number]

/** Everything checked in the app: every member can view and comment;
 * deleting the workspace and billing stay with the owner. */
export type WorkspaceAction =
  | "workspace:view"
  | "workspace:comment"
  | Permission
  | "workspace:delete"
  | "billing:manage"

const memberBase: readonly WorkspaceAction[] = [
  "workspace:view",
  "workspace:comment",
]

const ownerActions: readonly WorkspaceAction[] = [
  ...memberBase,
  ...grantablePermissions,
  "workspace:delete",
  "billing:manage",
]

/** For the settings UI: what each permission lets a member do. */
export const permissionInfo: Record<
  Permission,
  { label: string; description: string; group: "Content" | "AI" | "Admin" }
> = {
  "brandkits:manage": {
    label: "Brand kits",
    description: "Create, edit and delete brand kits.",
    group: "Content",
  },
  "footage:upload": {
    label: "Upload footage",
    description: "Add new recordings.",
    group: "Content",
  },
  "footage:edit": {
    label: "Edit footage",
    description: "Key moments, camera, cuts, text and graphics.",
    group: "Content",
  },
  "footage:delete": {
    label: "Delete footage",
    description: "Remove recordings for good.",
    group: "Content",
  },
  "videos:manage": {
    label: "Videos",
    description: "Create, edit and delete videos.",
    group: "Content",
  },
  "render:start": {
    label: "Export",
    description: "Render and download finished ads.",
    group: "Content",
  },
  "ai:use": {
    label: "Use AI",
    description: "Run AI features, billed to this workspace’s API key.",
    group: "AI",
  },
  "apikey:manage": {
    label: "Manage API key",
    description: "Add, replace or remove the Anthropic key.",
    group: "AI",
  },
  "members:manage": {
    label: "Manage members",
    description: "Invite people, change access, remove members.",
    group: "Admin",
  },
  "workspace:manage": {
    label: "Workspace settings",
    description: "Rename the workspace.",
    group: "Admin",
  },
}

export type PresetRole = "ADMIN" | "EDITOR" | "VIEWER"

export const rolePresets: Record<PresetRole, readonly Permission[]> = {
  ADMIN: grantablePermissions,
  EDITOR: [
    "brandkits:manage",
    "footage:upload",
    "footage:edit",
    "footage:delete",
    "videos:manage",
    "ai:use",
    "render:start",
  ],
  VIEWER: [],
}

export const roleLabels: Record<MemberRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Viewer",
  CUSTOM: "Custom",
}

export function isPermission(value: string): value is Permission {
  return (grantablePermissions as readonly string[]).includes(value)
}

/** Valid, unique, in canonical order. */
export function normalizePermissions(values: readonly string[]): Permission[] {
  return grantablePermissions.filter((permission) =>
    values.includes(permission)
  )
}

/** The preset a set of permissions matches, else CUSTOM. */
export function roleForPermissions(
  values: readonly Permission[]
): Exclude<MemberRole, "OWNER"> {
  const set = normalizePermissions(values)
  for (const [role, preset] of Object.entries(rolePresets)) {
    if (
      preset.length === set.length &&
      preset.every((permission) => set.includes(permission))
    ) {
      return role as PresetRole
    }
  }
  return "CUSTOM"
}

/** Everything a member may do: the owner all, others base + granted. */
export function effectiveActions(
  role: MemberRole,
  permissions: readonly string[]
): WorkspaceAction[] {
  if (role === "OWNER") return [...ownerActions]
  return [...memberBase, ...normalizePermissions(permissions)]
}

export function can(
  actions: readonly WorkspaceAction[],
  action: WorkspaceAction
): boolean {
  return actions.includes(action)
}

const deniedMessages: Record<WorkspaceAction, string> = {
  "workspace:view": "You don’t have access to this workspace.",
  "workspace:comment": "You can’t comment in this workspace.",
  "brandkits:manage":
    "You can’t change brand kits here. Ask the owner for access.",
  "footage:upload": "You can’t upload footage here. Ask the owner for access.",
  "footage:edit": "You can’t edit footage here. Ask the owner for access.",
  "footage:delete": "You can’t delete footage here. Ask the owner for access.",
  "videos:manage": "You can’t change videos here. Ask the owner for access.",
  "ai:use": "You can’t use AI in this workspace. Ask the owner for access.",
  "render:start": "You can’t export ads here. Ask the owner for access.",
  "members:manage": "You can’t manage members of this workspace.",
  "apikey:manage": "You can’t manage this workspace’s API key.",
  "workspace:manage": "You can’t change this workspace’s settings.",
  "workspace:delete": "Only the workspace owner can delete it.",
  "billing:manage": "Only the workspace owner can manage billing.",
}

/** Throws FORBIDDEN with a message that says what to do. */
export function assertCan(
  actions: readonly WorkspaceAction[],
  action: WorkspaceAction
): void {
  if (!can(actions, action)) {
    throw new AppError("FORBIDDEN", deniedMessages[action])
  }
}
