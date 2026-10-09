"use client"

import { TrashIcon } from "lucide-react"
import { useState, useTransition } from "react"

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
import { Field, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Spinner } from "@/shared/ui/spinner"
import { toast } from "@/shared/ui/toast"

import { deleteAccount } from "../actions"

/** Deletes the account after the user types their email. */
export function DeleteAccountButton({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [isDeleting, startDelete] = useTransition()
  const confirmed = typed.trim().toLowerCase() === email.toLowerCase()

  function confirmDelete() {
    startDelete(async () => {
      // On success the action signs out and redirects home.
      const result = await deleteAccount({ email: typed })
      if (!result.ok) toast.add({ type: "error", title: result.error.message })
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isDeleting) return
        setOpen(next)
        if (!next) setTyped("")
      }}
    >
      <AlertDialogTrigger
        render={<Button type="button" variant="destructive" />}
      >
        <TrashIcon data-icon="inline-start" />
        Delete account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes your account, your personal workspace and every
            workspace you own, with their brand kits, footage and videos, for
            everyone in them. It can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="delete-account-email">
            Type {email} to confirm
          </FieldLabel>
          <Input
            id="delete-account-email"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={isDeleting}
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={confirmDelete}
            disabled={!confirmed || isDeleting}
          >
            {isDeleting && <Spinner data-icon="inline-start" />}
            Delete account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
