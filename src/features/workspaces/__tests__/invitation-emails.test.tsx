import { render } from "@react-email/components"
import { describe, expect, it } from "vitest"

import { InvitationAcceptedEmail } from "../emails/invitation-accepted-email"
import { JoinedWorkspaceEmail } from "../emails/joined-workspace-email"

describe("JoinedWorkspaceEmail", () => {
  it("confirms the workspace and role to the new member", async () => {
    const text = await render(
      <JoinedWorkspaceEmail
        workspaceName="Launch team"
        inviterName="Ada"
        role="EDITOR"
      />,
      { plainText: true }
    )
    expect(text).toContain("“Launch team” as an editor")
    expect(text).toContain("/dashboard")
  })
})

describe("InvitationAcceptedEmail", () => {
  it("tells the inviter who joined, and links to the members", async () => {
    const text = await render(
      <InvitationAcceptedEmail
        memberName="Grace"
        workspaceName="Launch team"
        role="VIEWER"
      />,
      { plainText: true }
    )
    expect(text).toContain("Grace accepted your invitation")
    expect(text).toContain("“Launch team” as a viewer")
    expect(text).toContain("/settings/workspace")
  })
})
