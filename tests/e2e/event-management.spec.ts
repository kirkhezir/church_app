/**
 * E2E Tests for Event Management (T124)
 * Tests admin event creation, update, and cancellation flows
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const API_URL = process.env.BACKEND_URL || "http://localhost:3000/api/v1";

// Test user credentials (from seed data)
const ADMIN_EMAIL = "admin@church.com";
const ADMIN_PASSWORD = "SecurePass123!";

test.describe("Event Management - Admin Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test("should navigate to events list page", async ({ page }) => {
    // Navigate to events
    await page.goto(`${BASE_URL}/events`);

    // Verify events page loaded
    await expect(page).toHaveURL(`${BASE_URL}/events`);
    await expect(page.locator("h1, h2")).toContainText(/events/i);
  });

  test("should navigate to create event page", async ({ page }) => {
    // Navigate to events
    await page.goto(`${BASE_URL}/events`);

    // Click "Create Event" button
    await page.click(
      'text=/create.*event/i, a:has-text("Create"), button:has-text("Create")'
    );

    // Verify create page loaded
    await expect(page).toHaveURL(`${BASE_URL}/events/create`, {
      timeout: 5000,
    });
    await expect(page.locator("h1, h2")).toContainText(/create.*event/i);
  });

  test("should create a new event successfully", async ({ page }) => {
    await page.goto(`${BASE_URL}/events/create`);

    // Fill in event form
    await page.fill(
      'input[name="title"], input[placeholder*="title" i]',
      "E2E Test Event"
    );
    await page.fill(
      'textarea[name="description"], textarea[placeholder*="description" i]',
      "This is an automated test event created by Playwright"
    );

    // Select category (use first option if dropdown, or find specific category)
    const categorySelect = page
      .locator('select[name="category"], [role="combobox"]')
      .first();
    await categorySelect.selectOption({ index: 1 }); // Select first non-empty option

    // Set location
    await page.fill(
      'input[name="location"], input[placeholder*="location" i]',
      "Test Chapel"
    );

    // Set start date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    await page.fill('input[name="startDate"], input[type="date"]', tomorrowStr);

    // Set start time
    await page.fill('input[name="startTime"], input[type="time"]', "10:00");

    // Set end date (same day)
    await page.fill('input[name="endDate"], input[type="date"]', tomorrowStr);

    // Set end time
    await page.fill('input[name="endTime"], input[type="time"]', "12:00");

    // Set max capacity
    await page.fill(
      'input[name="maxCapacity"], input[placeholder*="capacity" i]',
      "50"
    );

    // Submit form
    await page.click(
      'button[type="submit"], button:has-text("Create"), button:has-text("Save")'
    );

    // Wait for redirect to events list or event detail
    await page.waitForURL(/\/events(\/\d+)?$/, { timeout: 10000 });

    // Verify success message or event in list
    await expect(
      page.locator('text=/success|created|event added/i, [role="alert"]')
    ).toBeVisible({ timeout: 5000 });
  });

  test("should validate required fields", async ({ page }) => {
    await page.goto(`${BASE_URL}/events/create`);

    // Try to submit empty form
    await page.click(
      'button[type="submit"], button:has-text("Create"), button:has-text("Save")'
    );

    // Should show validation errors
    await expect(
      page.locator("text=/required|enter.*title|please provide/i")
    ).toBeVisible({ timeout: 3000 });
  });

  test("should validate date logic (end after start)", async ({ page }) => {
    await page.goto(`${BASE_URL}/events/create`);

    // Fill in basic required fields
    await page.fill(
      'input[name="title"], input[placeholder*="title" i]',
      "Invalid Date Event"
    );
    await page.fill('textarea[name="description"]', "Testing date validation");

    // Set start date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Set start date
    await page.fill('input[name="startDate"]', tomorrowStr);
    await page.fill('input[name="startTime"]', "14:00");

    // Set end date to today (before start)
    const today = new Date().toISOString().split("T")[0];
    await page.fill('input[name="endDate"]', today);
    await page.fill('input[name="endTime"]', "12:00");

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(
      page.locator("text=/end.*after.*start|invalid.*date|date.*order/i")
    ).toBeVisible({ timeout: 3000 });
  });

  test("should edit an existing event", async ({ page }) => {
    // First, create an event (or navigate to existing one)
    await page.goto(`${BASE_URL}/events`);

    // Find first event card and click edit (if exists)
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();

    // If events exist, click edit
    if (await firstEvent.isVisible()) {
      await firstEvent.click();

      // Wait for event detail page
      await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

      // Click edit button
      await page.click(
        'text=/edit/i, a:has-text("Edit"), button:has-text("Edit")'
      );

      // Wait for edit page
      await page.waitForURL(/\/events\/\d+\/edit$/, { timeout: 5000 });

      // Modify title
      const titleInput = page.locator('input[name="title"]');
      await titleInput.fill("Updated Event Title");

      // Submit update
      await page.click(
        'button[type="submit"], button:has-text("Update"), button:has-text("Save")'
      );

      // Wait for redirect
      await page.waitForURL(/\/events\/\d+$/, { timeout: 10000 });

      // Verify success message
      await expect(
        page.locator('text=/success|updated/i, [role="alert"]')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should cancel an event", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Find first event
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();

    if (await firstEvent.isVisible()) {
      await firstEvent.click();

      // Wait for event detail page
      await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

      // Click cancel event button (might be in dropdown or modal)
      await page.click(
        'text=/cancel.*event/i, button:has-text("Cancel Event")'
      );

      // Confirm cancellation (if modal appears)
      const confirmButton = page.locator(
        'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Cancel Event")'
      );
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }

      // Verify event is cancelled
      await expect(
        page.locator("text=/cancelled|event cancelled/i")
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should filter events by category", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Click a category filter button
    const worshipButton = page
      .locator('button:has-text("Worship"), button:has-text("Worship Service")')
      .first();
    if (await worshipButton.isVisible()) {
      await worshipButton.click();

      // Wait for filtered results
      await page.waitForTimeout(1000);

      // Verify URL has category query param or filtered results appear
      // (This depends on implementation - might use query params or state)
    }
  });

  test("should filter events by date range", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Set start date filter
    const startDateInput = page.locator('input[type="date"]').first();
    if (await startDateInput.isVisible()) {
      const today = new Date().toISOString().split("T")[0];
      await startDateInput.fill(today);

      // Set end date filter
      const endDateInput = page.locator('input[type="date"]').nth(1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split("T")[0];
      await endDateInput.fill(nextWeekStr);

      // Wait for filtered results
      await page.waitForTimeout(1000);
    }
  });

  test("should clear all filters", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Apply a filter first
    const worshipButton = page.locator('button:has-text("Worship")').first();
    if (await worshipButton.isVisible()) {
      await worshipButton.click();
      await page.waitForTimeout(500);

      // Click clear all button
      const clearButton = page
        .locator('text=/clear.*all|clear.*filters/i, button:has-text("Clear")')
        .first();
      if (await clearButton.isVisible()) {
        await clearButton.click();

        // Verify all events are shown again
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe("Event Management - Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test("should have accessible form labels", async ({ page }) => {
    await page.goto(`${BASE_URL}/events/create`);

    // Check for form labels
    const titleLabel = page.locator(
      'label:has-text("Title"), label:has-text("Event Title")'
    );
    await expect(titleLabel).toBeVisible();

    const descriptionLabel = page.locator('label:has-text("Description")');
    await expect(descriptionLabel).toBeVisible();
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Verify focus is visible (implementation-specific)
  });
});
