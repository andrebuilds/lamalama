"use client"

import { useState } from "react"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"

import {
  grantablePermissions,
  normalizePermissions,
  permissionInfo,
  roleForPermissions,
  roleLabels,
  rolePresets,
  type Permission,
  type PresetRole,
} from "../lib/permissions"

type Choice = PresetRole | "CUSTOM"

const groups = ["Content", "AI", "Admin"] as const

/**
 * The permissions being picked, plus which preset is showing. Picking a
 * preset fills its permissions; Custom keeps them and opens the switches.
 */
export function useAccess(initial: readonly Permission[]) {
  const [permissions, setPermissions] = useState<Permission[]>(() =>
    normalizePermissions(initial)
  )
  const [choice, setChoice] = useState<Choice>(() =>
    roleForPermissions(initial)
  )

  const pick = (next: Choice) => {
    setChoice(next)
    if (next !== "CUSTOM") setPermissions([...rolePresets[next]])
  }

  const toggle = (permission: Permission, on: boolean) =>
    setPermissions((current) =>
      normalizePermissions(
        on
          ? [...current, permission]
          : current.filter((each) => each !== permission)
      )
    )

  return { choice, permissions, pick, toggle }
}

export type Access = ReturnType<typeof useAccess>

/**
 * Admin is a preset with member management in it, so only the owner sees
 * it (`canGrantMembers`).
 */
export function AccessSelect({
  access,
  canGrantMembers,
  label,
  className,
  disabled,
}: {
  access: Access
  canGrantMembers: boolean
  label: string
  className?: string
  disabled?: boolean
}) {
  const choices: Choice[] = [
    ...(canGrantMembers ? (["ADMIN"] as const) : []),
    "EDITOR",
    "VIEWER",
    "CUSTOM",
  ]
  const items = choices.map((value) => ({ value, label: roleLabels[value] }))

  return (
    <Select
      items={items}
      value={access.choice}
      onValueChange={(next) => next && access.pick(next)}
    >
      <SelectTrigger
        className={className}
        aria-label={label}
        disabled={disabled}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** One switch per permission, grouped; shown for Custom. */
export function PermissionSwitches({
  access,
  canGrantMembers,
  idPrefix,
  disabled,
}: {
  access: Access
  canGrantMembers: boolean
  idPrefix: string
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <FieldSet key={group} className="gap-3">
          <FieldLegend variant="label" className="mb-1">
            {group}
          </FieldLegend>
          {grantablePermissions
            .filter((permission) => permissionInfo[permission].group === group)
            .map((permission) => {
              const id = `${idPrefix}-${permission.replace(":", "-")}`
              const locked = permission === "members:manage" && !canGrantMembers
              return (
                <Field
                  key={permission}
                  orientation="horizontal"
                  data-disabled={locked || disabled ? true : undefined}
                >
                  <Switch
                    id={id}
                    checked={access.permissions.includes(permission)}
                    disabled={locked || disabled}
                    onCheckedChange={(on) => access.toggle(permission, on)}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={id}>
                      {permissionInfo[permission].label}
                    </FieldLabel>
                    <FieldDescription className="text-xs">
                      {locked
                        ? "Only the owner can give this."
                        : permissionInfo[permission].description}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )
            })}
        </FieldSet>
      ))}
    </div>
  )
}

/** The picked permissions, for a form submit. */
export function AccessInputs({ access }: { access: Access }) {
  return access.permissions.map((permission) => (
    <input
      key={permission}
      type="hidden"
      name="permissions"
      value={permission}
    />
  ))
}
