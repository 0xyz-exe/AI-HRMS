import { test, expect } from "@playwright/test";

test("renders the public workspace and supports navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /make every hr moment feel simple/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /explore the workspace/i })).toHaveAttribute("href", "/dashboard");
  await page.getByRole("link", { name: /explore the workspace/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /your hr operations, in one place/i })).toBeVisible();
});
