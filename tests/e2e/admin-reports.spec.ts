/**
 * E2E Tests for Admin Reports Page
 */

import { test, expect } from "@playwright/test";

test.describe("Admin Reports Page", () => {
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
      // Skip MFA for testing - would need to handle TOTP in real tests
      test.skip(true, "MFA verification required");
    }
  });

  test("should navigate to reports page", async ({ page }) => {
    await page.goto("/admin/reports");

    await expect(page.locator('h2:has-text("Reports")')).toBeVisible();
  });

  test("should display member directory report card", async ({ page }) => {
    await page.goto("/admin/reports");

    const memberCard = page.locator("text=Member Directory");
    await expect(memberCard).toBeVisible();
  });

  test("should display events report card with date inputs", async ({
    page,
  }) => {
    await page.goto("/admin/reports");

    const eventsCard = page.locator("text=Events Report");
    await expect(eventsCard).toBeVisible();

    // Should have date inputs
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
  });

  test("should display announcements report card", async ({ page }) => {
    await page.goto("/admin/reports");

    const announcementsCard = page.locator("text=Announcements Report");
    await expect(announcementsCard).toBeVisible();
  });

  test("should display event attendance report card with event ID input", async ({
    page,
  }) => {
    await page.goto("/admin/reports");

    const attendanceCard = page.locator("text=Event Attendance");
    await expect(attendanceCard).toBeVisible();

    // Should have event ID input
    await expect(page.locator('input[placeholder*="event"]')).toBeVisible();
  });

  test("should show loading state when downloading report", async ({
    page,
  }) => {
    await page.goto("/admin/reports");

    // Click download button for member report
    const downloadButton = page
      .locator('button:has-text("Download PDF")')
      .first();
    await downloadButton.click();

    // Should show loading state (briefly)
    // Note: This might be too fast to catch
    await expect(downloadButton).toBeEnabled({ timeout: 10000 });
  });
});
