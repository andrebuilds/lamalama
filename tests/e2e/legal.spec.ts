import { expect, test } from "@playwright/test"

import { expectNoViolations } from "./helpers/axe"

const documents = [
  { path: "/privacy", title: "Privacy Policy", footer: "Privacy" },
  { path: "/terms", title: "Terms of Service", footer: "Terms" },
  { path: "/cookies", title: "Cookie Policy", footer: "Cookies" },
]

for (const document of documents) {
  test(`footer links to the ${document.title}`, async ({ page }) => {
    await page.goto("/")
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: document.footer, exact: true })
      .click()

    await expect(page).toHaveURL(document.path)
    await expect(
      page.getByRole("heading", { level: 1, name: document.title })
    ).toBeVisible()
  })
}

test("sign-in links to the terms and the privacy policy", async ({ page }) => {
  await page.goto("/sign-in")
  await expect(
    page.getByRole("link", { name: "Terms", exact: true })
  ).toHaveAttribute("href", "/terms")
  await expect(
    page.getByRole("link", { name: "Privacy Policy" })
  ).toHaveAttribute("href", "/privacy")
})

test.describe("cookie notice", () => {
  // A first-time visitor: nothing dismissed yet (the config pre-dismisses it).
  test.use({ storageState: { cookies: [], origins: [] } })

  test("shows once, and the llama eats the cookie on dismiss", async ({
    page,
  }) => {
    await page.goto("/")
    const notice = page.getByRole("region", { name: "Cookie notice" })
    await expect(notice).toBeVisible()
    await expect(
      notice.getByRole("link", { name: "Cookie Policy" })
    ).toHaveAttribute("href", "/cookies")
    await expectNoViolations(page)

    await notice.getByRole("button", { name: "Feed the llama" }).click()
    await expect(notice.getByText("Nom nom")).toBeVisible()
    await expect(notice).toBeHidden()

    await page.reload()
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(notice).toBeHidden()
  })
})
