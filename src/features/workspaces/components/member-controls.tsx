"use client"

import { SlidersHorizontalIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import type { MemberRole } from "@/shared/db"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Spinner } from "@/shared/ui/spinner"
import { toast } from "@/shared/ui/toast"

import { changeMemberAccess, removeMember, revokeInvitation } from "../actions"
import { roleLabels, type Permission } from "../lib/permissions"
import { AccessSelect, PermissionSwitches, useAccess } from "./access-picker"

/** Row controls for a member the viewer may manage: access + remove. */
export function MemberControls({
  membershipId,
  role,
  permissions,
  memberName,
  canGrantMembers,
}: {
  membershipId: string
  role: MemberRole
  permissions: Permission[]
  memberName: string
  /** The owner can hand out member management (Admin). */
  canGrantMembers: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const remove = () => {
    startTransition(async () => {
      const result = await removeMember(membershipId)
      if (result.ok) {
        toast.add({ type: "success", title: `${memberName} removed` })
        router.refresh()
      } else {
        toast.add({ type: "error", title: result.error.message })
      }
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="outline">{roleLabels[role]}</Badge>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Change the access of ${memberName}`}
              disabled={isPending}
            />
          }
        >
          <SlidersHorizontalIcon />
        </DialogTrigger>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Access for {memberName}</DialogTitle>
            <DialogDescription>
              Pick a role, or Custom to choose each permission. Everyone can
              view and comment.
            </DialogDescription>
          </DialogHeader>
          <EditAccessForm
            membershipId={membershipId}
            permissions={permissions}
            memberName={memberName}
            canGrantMembers={canGrantMembers}
            onSaved={() => {
              setOpen(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${memberName}`}
        onClick={remove}
        disabled={isPending}
      >
        {isPending ? <Spinner /> : <XIcon />}
      </Button>
    </div>
  )
}

// Mounted with the dialog, so every opening starts from the saved access.
function EditAccessForm({
  membershipId,
  permissions,
  memberName,
  canGrantMembers,
  onSaved,
}: {
  membershipId: string
  permissions: Permission[]
  memberName: string
  canGrantMembers: boolean
  onSaved: () => void
}) {
  const access = useAccess(permissions)
  const [isSaving, startTransition] = useTransition()

  const save = () => {
    startTransition(async () => {
      const result = await changeMemberAccess({
        membershipId,
        permissions: access.permissions,
      })
      if (result.ok) {
        toast.add({ type: "success", title: `${memberName}’s access updated` })
        onSaved()
      } else {
        toast.add({ type: "error", title: result.error.message })
      }
    })
  }

  return (
    <>
      <AccessSelect
        access={access}
        canGrantMembers={canGrantMembers}
        label={`Role of ${memberName}`}
        disabled={isSaving}
      />
      {access.choice === "CUSTOM" && (
        <PermissionSwitches
          access={access}
          canGrantMembers={canGrantMembers}
          idPrefix={`member-${membershipId}`}
          disabled={isSaving}
        />
      )}
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button onClick={save} disabled={isSaving}>
          {isSaving && <Spinner data-icon="inline-start" />}
          Save
        </Button>
      </DialogFooter>
    </>
  )
}

/** Member managers: cancels a pending invitation. */
export function RevokeInvitationButton({
  invitationId,
  email,
}: {
  invitationId: string
  email: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const revoke = () => {
    startTransition(async () => {
      const result = await revokeInvitation(invitationId)
      if (result.ok) {
        toast.add({ type: "success", title: `Invitation to ${email} revoked` })
        router.refresh()
      } else {
        toast.add({ type: "error", title: result.error.message })
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Revoke the invitation to ${email}`}
      onClick={revoke}
      disabled={isPending}
    >
      {isPending ? <Spinner /> : <XIcon />}
    </Button>
  )
}
