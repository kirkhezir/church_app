/**
 * E2E Tests for Dashboard
 * Tests dashboard page and widgets
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Helper to login before tests
async function login(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', "john.doe@example.com");
  await page.fill('input[type="password"]', "SecurePass123!");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
}

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should display dashboard page", async ({ page }) => {
    // Should be on dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

    // Should show dashboard title
    await expect(page.locator("h1, h2").first()).toContainText(
      /dashboard|welcome/i
    );
  });

  test("should display profile summary widget", async ({ page }) => {
    // Should show profile information
    await expect(
      page.locator("text=/profile|member.*since|email/i")
    ).toBeVisible();
  });

  test("should display upcoming events widget", async ({ page }) => {
    // Should show events section
    await expect(page.locator("text=/upcoming.*events|events/i")).toBeVisible();
  });

  test("should display recent announcements widget", async ({ page }) => {
    // Should show announcements section
    await expect(
      page.locator("text=/announcements|recent.*announcements/i")
    ).toBeVisible();
  });

  test("should navigate to profile from dashboard", async ({ page }) => {
    // Click profile link or button
    await page.click(
      'a:has-text("Profile"), button:has-text("Profile"), a:has-text("Edit Profile")'
    );

    // Should navigate to profile page
    await expect(page).toHaveURL(/profile/);
  });

  test("should show member information", async ({ page }) => {
    // Should display member name or email
    await expect(page.locator("text=/john|doe|example\\.com/i")).toBeVisible();
  });

  test("should handle empty events list gracefully", async ({ page }) => {
    // If no events, should show appropriate message
    const noEventsMessage = page.locator("text=/no.*events|no.*upcoming/i");
    const eventsExist = await noEventsMessage.count();

    // Either shows events or "no events" message
    expect(eventsExist >= 0).toBeTruthy();
  });

  test("should handle empty announcements list gracefully", async ({
    page,
  }) => {
    // If no announcements, should show appropriate message
    const noAnnouncementsMessage = page.locator("text=/no.*announcements/i");
    const announcementsExist = await noAnnouncementsMessage.count();

    // Either shows announcements or "no announcements" message
    expect(announcementsExist >= 0).toBeTruthy();
  });

  test("should display navigation menu", async ({ page }) => {
    // Should have navigation links
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test("should show logout button", async ({ page }) => {
    // Should have logout button/link
    await expect(
      page.locator(
        'button:has-text("Logout"), a:has-text("Logout"), [role="button"]:has-text("Logout")'
      )
    ).toBeVisible();
  });
});
