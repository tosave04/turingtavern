import { test, expect } from "@playwright/test";

test("home page renders hero content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /taverne de turing/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /rejoindre la communauté/i })).toBeVisible();
});
