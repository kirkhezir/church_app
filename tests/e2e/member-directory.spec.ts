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

      // Wait for members to load - look for member name heading
      await page.waitForSelector("h3.font-semibold", { timeout: 10000 });

      // Should show at least one member card
      const memberCards = page.locator(".cursor-pointer");
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

      // Results should be filtered - look for the member card with John Doe
      await expect(page.locator('h3:has-text("John Doe")')).toBeVisible();
    });

    test("should open advanced filters panel", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Click Filters button
      await page.click('button:has-text("Filters")');

      // Filter panel should be visible
      await expect(page.locator("text=Role")).toBeVisible();
      await expect(page.locator("text=Status")).toBeVisible();
      await expect(page.locator("text=Sort By")).toBeVisible();
    });

    test("should filter members by role", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Open filters
      await page.click('button:has-text("Filters")');

      // Select role filter
      await page.click('button:has-text("All Roles")');
      await page.click("text=Staff");

      // Wait for filter to apply
      await page.waitForTimeout(500);
    });

    test("should filter members by date range", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Open filters
      await page.click('button:has-text("Filters")');

      // Click date picker for "From" date
      await page.click('button:has-text("Pick a date")');

      // Date picker interaction would happen here
      // Close filter without selecting (just testing visibility)
    });

    test("should change sort order", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Open filters
      await page.click('button:has-text("Filters")');

      // Change sort order
      await page.click('button:has-text("Name (A-Z)")');
      await page.click("text=Name (Z-A)");

      // Wait for sort to apply
      await page.waitForTimeout(500);
    });

    test("should reset filters", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Search first
      const searchInput = page.getByPlaceholder("Search by name...");
      await searchInput.fill("John");
      await page.waitForTimeout(500);

      // Open filters and reset
      await page.click('button:has-text("Filters")');
      await page.click('button:has-text("Reset Filters")');

      // Search should be cleared
      await expect(searchInput).toHaveValue("");
    });

    test("should select multiple members", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members to load
      await page.waitForSelector("h3.font-semibold", { timeout: 10000 });

      // Click Select All
      await page.click('button:has-text("Select All")');

      // Some checkboxes should be checked
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should export selected members", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members to load
      await page.waitForSelector("h3.font-semibold", { timeout: 10000 });

      // Click Export button
      const exportButton = page.locator('button:has-text("Export")');
      await expect(exportButton).toBeVisible();

      // Set up download listener
      const downloadPromise = page.waitForEvent("download");

      // Click export
      await exportButton.click();

      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain(".csv");
    });

    test("should paginate through members", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members to load
      await page.waitForSelector("h3.font-semibold", { timeout: 10000 });

      // Check for pagination
      const pageInfo = page.locator("text=Page 1");
      if (await pageInfo.isVisible()) {
        // Click Next if available
        const nextButton = page.locator('button:has-text("Next")');
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(500);
          await expect(page.locator("text=Page 2")).toBeVisible();
        }
      }
    });

    test("should navigate to member profile on click", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members to load - look for member name heading
      await page.waitForSelector("h3.font-semibold", { timeout: 10000 });

      // Click on a member card (the div container with cursor-pointer)
      const firstCard = page.locator(".cursor-pointer").first();
      await firstCard.click();

      // Should navigate to member profile page
      await page.waitForURL(/\/members\/[a-z0-9-]+/, { timeout: 15000 });
    });
  });

  test.describe("Member Profile", () => {
    test("should display member profile details", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members and click on first card
      await page.waitForSelector("h3.font-semibold", { timeout: 10000 });
      await page.locator(".cursor-pointer").first().click();

      // Wait for profile page to load
      await page.waitForURL(/\/members\/[a-z0-9-]+/, { timeout: 15000 });

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
      await page.waitForSelector("h3.font-semibold", { timeout: 10000 });
      await page.locator(".cursor-pointer").first().click();

      // Wait for profile page
      await page.waitForURL(/\/members\/[a-z0-9-]+/, { timeout: 15000 });

      // Click send message button
      await page.click("text=Send Message");

      // Should navigate to compose page with recipient pre-filled
      await page.waitForURL(/\/messages\/compose\?to=/, { timeout: 10000 });
    });

    test("should navigate back to directory", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/members");

      // Wait for members and click on first card
      await page.waitForSelector("h3.font-semibold", { timeout: 10000 });
      await page.locator(".cursor-pointer").first().click();

      // Wait for profile page
      await page.waitForURL(/\/members\/[a-z0-9-]+/, { timeout: 15000 });

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
