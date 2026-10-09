import { describe, expect, it } from "vitest"

import { AppError } from "@/shared/lib/errors"

import {
  assertCan,
  can,
  effectiveActions,
  grantablePermissions,
  normalizePermissions,
  roleForPermissions,
  rolePresets,
  type WorkspaceAction,
} from "../lib/permissions"

const ownerOnly: WorkspaceAction[] = ["workspace:delete", "billing:manage"]
const base: WorkspaceAction[] = ["workspace:view", "workspace:comment"]

describe("effectiveActions", () => {
  it("gives the owner everything, whatever is stored", () => {
    const actions = effectiveActions("OWNER", [])
    for (const action of [...base, ...grantablePermissions, ...ownerOnly]) {
      expect(can(actions, action)).toBe(true)
    }
  })

  it("gives a viewer only view and comment", () => {
    expect(effectiveActions("VIEWER", [])).toEqual(base)
  })

  it("gives others the base plus exactly what was granted", () => {
    const actions = effectiveActions("CUSTOM", ["footage:upload", "ai:use"])
    expect(actions).toEqual([...base, "footage:upload", "ai:use"])
    expect(can(actions, "footage:edit")).toBe(false)
  })

  it("never grants owner-only actions to a member", () => {
    const actions = effectiveActions("ADMIN", [...rolePresets.ADMIN])
    for (const action of ownerOnly) expect(can(actions, action)).toBe(false)
  })

  it("ignores unknown stored permissions", () => {
    expect(effectiveActions("CUSTOM", ["billing:manage", "nope"])).toEqual(base)
  })
})

describe("normalizePermissions", () => {
  it("drops unknowns and duplicates, in canonical order", () => {
    expect(
      normalizePermissions(["ai:use", "nope", "brandkits:manage", "ai:use"])
    ).toEqual(["brandkits:manage", "ai:use"])
  })
})

describe("roleForPermissions", () => {
  it.each(["ADMIN", "EDITOR", "VIEWER"] as const)(
    "recognises the %s preset in any order",
    (role) => {
      expect(roleForPermissions([...rolePresets[role]].reverse())).toBe(role)
    }
  )

  it("calls any other mix CUSTOM", () => {
    expect(roleForPermissions(["footage:upload"])).toBe("CUSTOM")
    expect(
      roleForPermissions(
        rolePresets.EDITOR.filter((each) => each !== "render:start")
      )
    ).toBe("CUSTOM")
  })
})

describe("assertCan", () => {
  it("passes silently when allowed", () => {
    const actions = effectiveActions("EDITOR", [...rolePresets.EDITOR])
    expect(() => assertCan(actions, "render:start")).not.toThrow()
  })

  it("throws FORBIDDEN with an actionable message when not allowed", () => {
    const actions = effectiveActions("EDITOR", [...rolePresets.EDITOR])
    try {
      assertCan(actions, "billing:manage")
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe("FORBIDDEN")
      expect((error as AppError).message).toBe(
        "Only the workspace owner can manage billing."
      )
    }
  })
})
