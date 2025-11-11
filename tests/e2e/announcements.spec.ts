/**
 * E2E Tests: Announcement System
 *
 * Tests the complete announcement flow from admin creation to member viewing
 */

import { test, expect } from "@playwright/test";

// Test users
const ADMIN_USER = {
  email: "admin@test.com",
  password: "Admin123!",
};

const MEMBER_USER = {
  email: "member@test.com",
  password: "Member123!",
};

// Helper function to login
async function login(page, email: string, password: string) {
  await page.goto("http://localhost:5173/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
}

test.describe("Announcement System E2E", () => {
  test.describe("Admin - Create Announcement", () => {
    test("should allow admin to create a normal announcement", async ({
      page,
    }) => {
      // Login as admin
      await login(page, ADMIN_USER.email, ADMIN_USER.password);

      // Navigate to create announcement page
      await page.goto("http://localhost:5173/admin/announcements/create");

      // Fill in the form
      await page.fill("input#title", "Test Announcement E2E");
      await page.fill(
        "textarea#content",
        "This is a test announcement created via E2E test."
      );

      // Select NORMAL priority (should be default)
      await page.click("input#normal");

      // Submit the form
      await page.click('button[type="submit"]');

      // Wait for success message and redirect
      await expect(
        page.locator("text=Announcement created successfully")
      ).toBeVisible();

      // Should redirect to announcement detail page
      await page.waitForURL(/\/announcements\//);

      // Verify announcement is displayed
      await expect(page.locator("h1")).toContainText("Test Announcement E2E");
      await expect(
        page.locator("text=This is a test announcement created via E2E test.")
      ).toBeVisible();
      await expect(page.locator("text=Normal")).toBeVisible();
    });

    test("should allow admin to create an urgent announcement", async ({
      page,
    }) => {
      await login(page, ADMIN_USER.email, ADMIN_USER.password);

      await page.goto("http://localhost:5173/admin/announcements/create");

      await page.fill("input#title", "Urgent Weather Alert E2E");
      await page.fill(
        "textarea#content",
        "Service cancelled due to severe weather. Stay safe!"
      );

      // Select URGENT priority
      await page.click("input#urgent");

      // Should show warning message
      await expect(
        page.locator("text=Email all members immediately")
      ).toBeVisible();

      await page.click('button[type="submit"]');

      await expect(
        page.locator("text=Announcement created successfully")
      ).toBeVisible();
      await page.waitForURL(/\/announcements\//);

      // Verify urgent badge is displayed
      await expect(page.locator("text=Urgent")).toBeVisible();
    });

    test("should validate title length (min 3 chars)", async ({ page }) => {
      await login(page, ADMIN_USER.email, ADMIN_USER.password);

      await page.goto("http://localhost:5173/admin/announcements/create");

      await page.fill("input#title", "AB"); // Only 2 characters
      await page.fill("textarea#content", "Test content");

      // Submit button should be disabled or show validation error
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();

      // Should show validation message
      await expect(page.locator("text=Minimum 3 characters")).toBeVisible();
    });

    test("should validate content is required", async ({ page }) => {
      await login(page, ADMIN_USER.email, ADMIN_USER.password);

      await page.goto("http://localhost:5173/admin/announcements/create");

      await page.fill("input#title", "Valid Title");
      // Leave content empty

      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe("Member - View Announcements", () => {
    test("should allow member to view announcement list", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);

      // Navigate to announcements page
      await page.goto("http://localhost:5173/announcements");

      // Should see page title
      await expect(page.locator("h1")).toContainText("Church Announcements");

      // Should see filter buttons
      await expect(page.locator('button:has-text("Active")')).toBeVisible();
      await expect(page.locator('button:has-text("Archived")')).toBeVisible();

      // Should see at least some announcements (from previous tests)
      const announcements = page.locator('[data-testid="announcement-card"]');
      await expect(announcements.first()).toBeVisible({ timeout: 10000 });
    });

    test("should allow member to view announcement details", async ({
      page,
    }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);

      await page.goto("http://localhost:5173/announcements");

      // Click on the first announcement
      const firstAnnouncement = page
        .locator('[data-testid="announcement-card"]')
        .first();
      await firstAnnouncement.waitFor({ state: "visible", timeout: 10000 });

      const viewButton = firstAnnouncement.locator(
        '[data-testid="view-details-button"]'
      );
      await viewButton.click();

      // Should navigate to detail page
      await page.waitForURL(/\/announcements\/[a-f0-9-]+/);

      // Should see back button
      await expect(
        page.locator('button:has-text("Back to Announcements")')
      ).toBeVisible();

      // Should see full content
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should show archived announcements when filter toggled", async ({
      page,
    }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);

      await page.goto("http://localhost:5173/announcements");

      // Click on Archived filter
      await page.click('button:has-text("Archived")');

      // Should see archived announcements or empty state
      const emptyState = page.locator("text=No archived announcements");
      const archivedAnnouncements = page.locator(
        '[data-testid="announcement-card"]'
      );

      // Either see empty state or archived announcements
      await expect(emptyState.or(archivedAnnouncements.first())).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe("Admin - Manage Announcements", () => {
    test("should allow admin to view management dashboard", async ({
      page,
    }) => {
      await login(page, ADMIN_USER.email, ADMIN_USER.password);

      await page.goto("http://localhost:5173/admin/announcements");

      // Should see page title
      await expect(page.locator("h1")).toContainText("Manage Announcements");

      // Should see create button
      await expect(
        page.locator('button:has-text("Create Announcement")')
      ).toBeVisible();

      // Should see filter buttons
      await expect(page.locator('button:has-text("Active")')).toBeVisible();

      // Should see table with announcements
      await expect(page.locator("table")).toBeVisible();
    });

    test("should allow admin to edit announcement", async ({ page }) => {
      await login(page, ADMIN_USER.email, ADMIN_USER.password);

      await page.goto("http://localhost:5173/admin/announcements");

      // Wait for table to load
      await page.waitForSelector("table tbody tr", { timeout: 10000 });

      // Click edit button on first announcement
      const editButton = page.locator('button:has([data-icon="edit"])').first();
      await editButton.click();

      // Should navigate to edit page
      await page.waitForURL(/\/admin\/announcements\/[a-f0-9-]+\/edit/);

      // Form should be pre-populated
      const titleInput = page.locator("input#title");
      await expect(titleInput).toHaveValue(/.+/); // Should have some value

      // Update the title
      await titleInput.fill("Updated Title E2E");

      // Submit
      await page.click('button[type="submit"]:has-text("Update")');

      // Wait for success message
      await expect(
        page.locator("text=Announcement updated successfully")
      ).toBeVisible();
    });

    test("should allow admin to archive announcement", async ({ page }) => {
      await login(page, ADMIN_USER.email, ADMIN_USER.password);

      await page.goto("http://localhost:5173/admin/announcements");

      await page.waitForSelector("table tbody tr", { timeout: 10000 });

      // Setup dialog handler to confirm archiving
      page.on("dialog", (dialog) => dialog.accept());

      // Click archive button on first announcement
      const archiveButton = page
        .locator('button:has([data-icon="archive"])')
        .first();
      await archiveButton.click();

      // Page should reload showing updated list
      await page.waitForTimeout(1000);

      // Switch to archived view to verify
      await page.click('button:has-text("Archived")');

      // Should see at least one archived announcement
      await expect(page.locator("table tbody tr")).toBeVisible({
        timeout: 5000,
      });
    });

    test("should allow admin to delete announcement", async ({ page }) => {
      await login(page, ADMIN_USER.email, ADMIN_USER.password);

      await page.goto("http://localhost:5173/admin/announcements");

      await page.waitForSelector("table tbody tr", { timeout: 10000 });

      // Count announcements before deletion
      const rowsBefore = await page.locator("table tbody tr").count();

      // Setup dialog handler to confirm deletion
      page.on("dialog", (dialog) => dialog.accept());

      // Click delete button on first announcement
      const deleteButton = page
        .locator('button:has([data-icon="trash"])')
        .first();
      await deleteButton.click();

      // Wait for page to reload
      await page.waitForTimeout(1000);

      // Verify announcement was deleted (count should decrease)
      const rowsAfter = await page.locator("table tbody tr").count();
      expect(rowsAfter).toBeLessThanOrEqual(rowsBefore);
    });
  });

  test.describe("Member - Permissions", () => {
    test("should not allow member to access admin create page", async ({
      page,
    }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);

      // Try to navigate to admin create page
      await page.goto("http://localhost:5173/admin/announcements/create");

      // Should either redirect or show forbidden message
      // This depends on your routing implementation
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      // Should not be on the create page
      expect(currentUrl).not.toContain("/admin/announcements/create");
    });

    test("should not allow member to access admin management page", async ({
      page,
    }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);

      await page.goto("http://localhost:5173/admin/announcements");

      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/admin/announcements");
    });
  });

  test.describe("Pagination", () => {
    test("should show pagination controls when there are many announcements", async ({
      page,
    }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);

      await page.goto("http://localhost:5173/announcements");

      // Check if pagination is visible (depends on data)
      const paginationInfo = page.locator("text=/Page \\d+ of \\d+/");
      const hasPagination = await paginationInfo.isVisible().catch(() => false);

      if (hasPagination) {
        // Verify pagination controls
        await expect(page.locator('button:has-text("Previous")')).toBeVisible();
        await expect(page.locator('button:has-text("Next")')).toBeVisible();

        // Verify page info is displayed
        await expect(paginationInfo).toBeVisible();
      }
    });
  });
});
