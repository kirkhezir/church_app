/**
 * E2E Tests for Admin Health Dashboard
 */

import { test, expect } from "@playwright/test";

test.describe("Admin Health Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page
      .getByRole("textbox", { name: "Email" })
      .fill("admin@singburi-adventist.org");
    await page.getByRole("textbox", { name: "Password" }).fill("Admin123!");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for dashboard
    await page.waitForURL(/dashboard|mfa-verify/);

    // Handle MFA if needed
    if (page.url().includes("mfa-verify")) {
      test.skip(true, "MFA verification required");
    }
  });

  test("should navigate to health dashboard", async ({ page }) => {
    await page.goto("/admin/health");

    await expect(page.locator('h2:has-text("System Health")')).toBeVisible();
  });

  test("should display overall status card", async ({ page }) => {
    await page.goto("/admin/health");

    const statusCard = page.locator("text=Overall Status");
    await expect(statusCard).toBeVisible({ timeout: 10000 });
  });

  test("should display database health component", async ({ page }) => {
    await page.goto("/admin/health");

    // Wait for the page to fully load
    await page.waitForSelector("text=System Health", { timeout: 15000 });

    const databaseCard = page.getByText("Database", { exact: true });
    await expect(databaseCard).toBeVisible({ timeout: 10000 });
  });

  test("should display memory health component", async ({ page }) => {
    await page.goto("/admin/health");

    // Wait for the page to fully load
    await page.waitForSelector("text=System Health", { timeout: 15000 });

    const memoryCard = page.getByText("Memory", { exact: true });
    await expect(memoryCard).toBeVisible({ timeout: 10000 });
  });

  test("should display uptime information", async ({ page }) => {
    await page.goto("/admin/health");

    // Wait for data to load
    await page.waitForSelector("text=Uptime", { timeout: 10000 });

    const uptimeText = page.locator("text=Uptime");
    await expect(uptimeText).toBeVisible();
  });

  test("should have refresh button", async ({ page }) => {
    await page.goto("/admin/health");

    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible({ timeout: 10000 });
  });

  test("should refresh data when clicking refresh button", async ({ page }) => {
    await page.goto("/admin/health");

    // Wait for initial load
    await page.waitForSelector("text=Overall Status", { timeout: 10000 });

    const refreshButton = page.locator('button:has-text("Refresh")');
    await refreshButton.click();

    // Button should show loading state briefly
    await expect(refreshButton).toBeEnabled({ timeout: 5000 });
  });

  test("should display environment information", async ({ page }) => {
    await page.goto("/admin/health");

    await page.waitForSelector("text=Environment", { timeout: 10000 });

    const envText = page.locator("text=Environment");
    await expect(envText).toBeVisible();
  });

  test("should show status badges", async ({ page }) => {
    await page.goto("/admin/health");

    // Wait for the page to fully load
    await page.waitForSelector("text=System Health", { timeout: 15000 });
    await page.waitForSelector("text=Overall Status", { timeout: 15000 });

    // Should have at least one status badge (up, down, degraded)
    const badges = page.locator("text=/up|down|degraded/i");
    await expect(badges.first()).toBeVisible({ timeout: 10000 });
  });
});
