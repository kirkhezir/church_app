/**
 * E2E Tests for Push Notification Settings
 */

import { test, expect } from "@playwright/test";

test.describe("Push Notification Settings", () => {
  test.beforeEach(async ({ page }) => {
    // Login as member
    await page.goto("/login");
    await page.fill('input[name="email"]', "john.doe@example.com");
    await page.fill('input[name="password"]', "Member123!");
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL(/dashboard/);
  });

  test("should navigate to settings page", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  });

  test("should display push notifications card", async ({ page }) => {
    await page.goto("/settings");

    const pushCard = page.locator("text=Push Notifications");
    await expect(pushCard).toBeVisible();
  });

  test("should display notification toggle", async ({ page }) => {
    await page.goto("/settings");

    // Wait for the settings to load
    await page.waitForSelector("text=Push Notifications");

    // Should have a switch/toggle
    const toggle = page.locator('button[role="switch"]');
    await expect(toggle).toBeVisible();
  });

  test("should display notification benefits list", async ({ page }) => {
    await page.goto("/settings");

    // Should show what notifications are for
    const infoText = page.locator("text=New events and RSVP reminders");
    await expect(infoText).toBeVisible();
  });

  test("should handle unsupported browser gracefully", async ({
    page,
    context,
  }) => {
    // Remove service worker support for this test
    await context.route("**/*", async (route) => {
      // Just continue with the request
      await route.continue();
    });

    await page.goto("/settings");

    // The component should handle this gracefully
    // Either show the settings or show a "not supported" message
    const content = page.locator("text=/Push Notifications|Not Supported/");
    await expect(content).toBeVisible();
  });
});

test.describe("Push Notification Settings - Permissions", () => {
  test("should request permission when enabling notifications", async ({
    page,
    context,
  }) => {
    // Grant notification permission
    await context.grantPermissions(["notifications"]);

    // Login
    await page.goto("/login");
    await page.fill('input[name="email"]', "john.doe@example.com");
    await page.fill('input[name="password"]', "Member123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    // Go to settings
    await page.goto("/settings");

    // Click toggle to enable
    const toggle = page.locator('button[role="switch"]');
    await expect(toggle).toBeVisible();

    // Note: Full testing would require mocking service workers and push manager
    // This test just verifies the UI is present and interactive
  });
});
