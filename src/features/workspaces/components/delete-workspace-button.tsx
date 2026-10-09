"use client"

import { useTransition } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"
import { Spinner } from "@/shared/ui/spinner"
import { toast } from "@/shared/ui/toast"

import { deleteWorkspace } from "../actions"

/**
 * Owner-only, shared workspaces only (the personal one can't be deleted).
 * On success the action clears the cookie and redirects to the personal
 * workspace's dashboard, so only the error path is handled here.
 */
export function DeleteWorkspaceButton({ name }: { name: string }) {
  const [isDeleting, startDeleting] = useTransition()

  const confirmDelete = () => {
    startDeleting(async () => {
      const result = await deleteWorkspace()
      if (result && !result.ok) {
        toast.add({ type: "error", title: result.error.message })
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Delete workspace
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Every brand kit, clip, video and member of this workspace goes with
            it. This can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Spinner data-icon="inline-start" />}
            Delete workspace
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
