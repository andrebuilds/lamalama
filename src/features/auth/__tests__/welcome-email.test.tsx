import { render } from "@react-email/components"
import { describe, expect, it } from "vitest"

import { WelcomeEmail } from "../emails/welcome-email"

describe("WelcomeEmail", () => {
  it("greets the user by first name and links to the dashboard", async () => {
    const html = await render(<WelcomeEmail name="Ada Lovelace" />)
    expect(html).toContain("Hi Ada,")
    expect(html).toContain("/dashboard")
  })

  it("falls back to a generic greeting without a name", async () => {
    const html = await render(<WelcomeEmail name="" />)
    expect(html).toContain("Hi there,")
  })

  it("has a plain-text version", async () => {
    const text = await render(<WelcomeEmail name="Ada" />, { plainText: true })
    expect(text).toContain("Create a brand kit")
    expect(text).not.toContain("<")
  })
})
