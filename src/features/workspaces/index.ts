// Public API of the workspaces slice. Other code imports only from here.
export { getCurrentWorkspace, requireWorkspaceAccess } from "./queries"
export {
  getInvitation,
  listInvitations,
  listMembers,
  listWorkspaces,
} from "./service"
export {
  can,
  grantablePermissions,
  normalizePermissions,
  permissionInfo,
  roleLabels,
  type Permission,
  type WorkspaceAction,
} from "./lib/permissions"
export { RenameWorkspaceForm } from "./components/rename-workspace-form"
export {
  WorkspaceSwitcher,
  type SwitcherWorkspace,
} from "./components/workspace-switcher"
export { DeleteWorkspaceButton } from "./components/delete-workspace-button"
export { InviteMemberForm } from "./components/invite-member-form"
export {
  MemberControls,
  RevokeInvitationButton,
} from "./components/member-controls"
export { LeaveWorkspaceButton } from "./components/leave-workspace-button"
export { AcceptInvitationButton } from "./components/accept-invitation-button"
