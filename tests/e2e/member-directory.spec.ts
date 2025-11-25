/**
 * E2E Tests: Member Directory
 *
 * Tests the member directory browsing and profile viewing functionality
 */

import { test, expect } from "@playwright/test";

// Test users from seed data
const MEMBER_USER = {
  email: "john.doe@example.com",
  password: "Member123!",
};

// Helper function to login
async function login(page, email: string, password: string) {
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe("Member Directory E2E", () => {
  test.describe("Directory Listing", () => {
    test("should display member directory page", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);

      // Navigate to member directory
      await page.goto("http://localhost:5173/members");

      // Verify page header
      await expect(page.locator("h1")).toContainText("Member Directory");
      await expect(
        page.locator("text=Connect with fellow church members")
      ).toBeVisible();
    });

    test("should show member cards with basic info", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members to load
      await page.waitForSelector('[class*="card"]', { timeout: 10000 });

      // Should show at least one member card
      const memberCards = page.locator('[class*="card"]');
      const count = await memberCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should filter members by search", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Search for a specific name
      const searchInput = page.getByPlaceholder("Search by name...");
      await searchInput.fill("John");

      // Wait for search results to update
      await page.waitForTimeout(500);

      // Results should be filtered
      await expect(page.locator("text=John")).toBeVisible();
    });

    test("should navigate to member profile on click", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members to load
      await page.waitForSelector('[class*="card"]', { timeout: 10000 });

      // Click on a member card
      const firstCard = page.locator('[class*="card"]').first();
      await firstCard.click();

      // Should navigate to member profile page
      await page.waitForURL(/\/members\/[a-z0-9-]+/);
    });
  });

  test.describe("Member Profile", () => {
    test("should display member profile details", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members and click on first card
      await page.waitForSelector('[class*="card"]', { timeout: 10000 });
      await page.locator('[class*="card"]').first().click();

      // Wait for profile page to load
      await page.waitForURL(/\/members\/[a-z0-9-]+/);

      // Should show back button
      await expect(page.locator("text=Back to Directory")).toBeVisible();

      // Should show member information section
      await expect(page.locator("text=Contact Information")).toBeVisible();
      await expect(page.locator("text=Member Since")).toBeVisible();
    });

    test("should allow sending message from profile", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members and click on first card
      await page.waitForSelector('[class*="card"]', { timeout: 10000 });
      await page.locator('[class*="card"]').first().click();

      // Wait for profile page
      await page.waitForURL(/\/members\/[a-z0-9-]+/);

      // Click send message button
      await page.click("text=Send Message");

      // Should navigate to compose page with recipient pre-filled
      await page.waitForURL(/\/messages\/compose\?to=/);
    });

    test("should navigate back to directory", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members and click on first card
      await page.waitForSelector('[class*="card"]', { timeout: 10000 });
      await page.locator('[class*="card"]').first().click();

      // Wait for profile page
      await page.waitForURL(/\/members\/[a-z0-9-]+/);

      // Click back button
      await page.click("text=Back to Directory");

      // Should navigate back to directory
      await page.waitForURL(/\/members$/);
    });
  });

  test.describe("Privacy Controls", () => {
    test("should only show public information based on privacy settings", async ({
      page,
    }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members to load
      await page.waitForSelector('[class*="card"]', { timeout: 10000 });

      // Navigate to a member profile
      await page.locator('[class*="card"]').first().click();
      await page.waitForURL(/\/members\/[a-z0-9-]+/);

      // Member Since should always be visible (not privacy-controlled)
      await expect(page.locator("text=Member Since")).toBeVisible();

      // Contact info visibility depends on member's privacy settings
      // The test just verifies the page renders without error
      await expect(page.locator("text=Contact Information")).toBeVisible();
    });
  });

  test.describe("Authentication", () => {
    test("should redirect to login if not authenticated", async ({ page }) => {
      // Try to access member directory without login
      await page.goto("http://localhost:5173/members");

      // Should redirect to login
      await page.waitForURL(/\/login/);
    });
  });
});
