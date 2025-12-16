/**
 * E2E Tests for Admin Health Dashboard
 */

import { test, expect } from "@playwright/test";

test.describe("Admin Health Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@singburi-adventist.org");
    await page.fill('input[name="password"]', "Admin123!");
    await page.click('button[type="submit"]');

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

    const databaseCard = page.locator("text=Database");
    await expect(databaseCard).toBeVisible({ timeout: 10000 });
  });

  test("should display memory health component", async ({ page }) => {
    await page.goto("/admin/health");

    const memoryCard = page.locator("text=Memory");
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

    // Wait for status badges to load
    await page.waitForSelector('[class*="badge"]', { timeout: 10000 });

    // Should have at least one status badge
    const badges = page.locator('[class*="badge"]');
    await expect(badges.first()).toBeVisible();
  });
});
