import type { Metadata } from "next"

import {
  can,
  DeleteWorkspaceButton,
  getCurrentWorkspace,
  InviteMemberForm,
  LeaveWorkspaceButton,
  listInvitations,
  listMembers,
  MemberControls,
  normalizePermissions,
  RenameWorkspaceForm,
  RevokeInvitationButton,
  roleLabels,
} from "@/features/workspaces"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"

export const metadata: Metadata = { title: "Workspace" }

function initials(name: string, email: string) {
  return (name.trim() || email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default async function WorkspaceSettingsPage() {
  const { user, workspace, role, actions } = await getCurrentWorkspace()
  const isPersonal = workspace.personalOwnerId !== null
  const isOwner = role === "OWNER"
  const canManageMembers = can(actions, "members:manage")

  const members = await listMembers(workspace.id)
  const invitations = canManageMembers
    ? await listInvitations(workspace.id)
    : []
  // Mirrors the service rules: never the owner or yourself, and members who
  // manage members only by the owner.
  const canManage = (member: (typeof members)[number]) =>
    canManageMembers &&
    member.role !== "OWNER" &&
    member.user.id !== user.id &&
    (isOwner || !member.permissions.includes("members:manage"))
  const now = new Date()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            Your brand kits, campaigns and ads live in this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              You’re {role === "OWNER" ? "the" : "a"}{" "}
              {roleLabels[role].toLowerCase()}
            </Badge>
            {isPersonal && <Badge variant="outline">Personal workspace</Badge>}
          </div>
          {can(actions, "workspace:manage") && (
            <RenameWorkspaceForm currentName={workspace.name} />
          )}
          {isOwner && !isPersonal && (
            <>
              <Separator />
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium">Delete this workspace</p>
                  <p className="text-sm text-muted-foreground">
                    Removes everything in it, for every member. Your personal
                    workspace stays.
                  </p>
                </div>
                <div>
                  <DeleteWorkspaceButton name={workspace.name} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {canManageMembers
              ? "Invite people to work in this workspace. Editors create and edit; viewers only watch and comment. AI actions run on this workspace’s API key."
              : "Who can see and edit this workspace."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {canManageMembers && <InviteMemberForm canGrantMembers={isOwner} />}
          <ul className="flex flex-col gap-4">
            {members.map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <Avatar>
                  {member.user.image && (
                    <AvatarImage src={member.user.image} alt="" />
                  )}
                  <AvatarFallback>
                    {initials(member.user.name, member.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 leading-tight">
                  <span className="truncate text-sm font-medium">
                    {member.user.name || member.user.email}
                    {member.user.id === user.id && (
                      <span className="text-muted-foreground"> (you)</span>
                    )}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </span>
                </div>
                {canManage(member) ? (
                  <MemberControls
                    membershipId={member.id}
                    role={member.role}
                    permissions={normalizePermissions(member.permissions)}
                    memberName={member.user.name || member.user.email}
                    canGrantMembers={isOwner}
                  />
                ) : (
                  <Badge variant="outline">{roleLabels[member.role]}</Badge>
                )}
              </li>
            ))}
          </ul>
          {invitations.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Pending invitations</p>
              <ul className="flex flex-col gap-2">
                {invitations.map((invitation) => (
                  <li
                    key={invitation.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {invitation.email}
                    </span>
                    <Badge variant="outline">
                      {roleLabels[invitation.role]}
                    </Badge>
                    {invitation.expiresAt < now && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                    <RevokeInvitationButton
                      invitationId={invitation.id}
                      email={invitation.email}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!isOwner && (
            <>
              <Separator />
              <div>
                <LeaveWorkspaceButton name={workspace.name} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
