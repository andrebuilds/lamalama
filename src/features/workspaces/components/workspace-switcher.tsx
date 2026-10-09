"use client"

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState, useTransition } from "react"

import { site } from "@/shared/config/site"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Field, FieldError, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Logo } from "@/shared/ui/logo"
import { SidebarMenuButton, useSidebar } from "@/shared/ui/sidebar"
import { Spinner } from "@/shared/ui/spinner"
import { toast } from "@/shared/ui/toast"

import { createWorkspace, switchWorkspace } from "../actions"
import { workspaceNameMaxLength } from "../schema"

export type SwitcherWorkspace = {
  id: string
  name: string
  isPersonal: boolean
}

/**
 * Sidebar header: the brand block is also the workspace switcher. Picking
 * a workspace sets the active-workspace cookie and lands on its dashboard;
 * "New workspace" creates one and switches to it.
 */
export function WorkspaceSwitcher({
  workspaces,
  currentId,
}: {
  workspaces: SwitcherWorkspace[]
  currentId: string
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  const [isSwitching, startSwitching] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const current = workspaces.find((w) => w.id === currentId)

  const pick = (id: string) => {
    if (id === currentId) return
    startSwitching(async () => {
      await switchWorkspace(id)
      if (isMobile) setOpenMobile(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
          }
        >
          <Logo />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{site.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {current?.name}
            </span>
          </div>
          {isSwitching ? (
            <Spinner className="ml-auto" />
          ) : (
            <ChevronsUpDownIcon className="ml-auto" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 p-1.5"
          side={isMobile ? "bottom" : "right"}
          align="start"
          sideOffset={8}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                className="gap-2.5 px-2 py-2"
                disabled={isSwitching}
                onClick={() => pick(workspace.id)}
              >
                <span className="grid min-w-0 flex-1 leading-tight">
                  <span className="truncate">{workspace.name}</span>
                  {workspace.isPersonal && (
                    <span className="text-xs text-muted-foreground">
                      Personal
                    </span>
                  )}
                </span>
                {workspace.id === currentId && <CheckIcon />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            className="gap-2.5 px-2 py-2"
            onClick={() => setDialogOpen(true)}
          >
            <PlusIcon />
            New workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateWorkspaceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}

function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [result, formAction, isPending] = useActionState(
    async (...args: Parameters<typeof createWorkspace>) => {
      const next = await createWorkspace(...args)
      if (next.ok) setName("")
      return next
    },
    null
  )

  useEffect(() => {
    if (!result) return
    if (result.ok) {
      toast.add({
        type: "success",
        title: `Workspace "${result.data.name}" created`,
      })
      onOpenChange(false)
      // The cookie already points at the new workspace.
      router.push("/dashboard")
    } else if (result.error.code !== "VALIDATION") {
      toast.add({ type: "error", title: result.error.message })
    }
  }, [result, onOpenChange, router])

  const nameError =
    result && !result.ok ? result.error.fieldErrors?.name?.[0] : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New workspace</DialogTitle>
          <DialogDescription>
            A separate space with its own brand kits, videos, members and
            Anthropic API key. You’ll be its owner.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field data-invalid={nameError ? true : undefined}>
            <FieldLabel htmlFor="new-workspace-name">Name</FieldLabel>
            <Input
              id="new-workspace-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme marketing"
              maxLength={workspaceNameMaxLength}
              aria-invalid={nameError ? true : undefined}
              required
            />
            {nameError && <FieldError>{nameError}</FieldError>}
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              Create workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
