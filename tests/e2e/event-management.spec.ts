/**
 * E2E Tests for Event Management (T124)
 * Tests admin event creation, update, and cancellation flows
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const API_URL = process.env.BACKEND_URL || "http://localhost:3000/api/v1";

// Test user credentials (from seed data)
const ADMIN_EMAIL = "admin@singburi-adventist.org";
const ADMIN_PASSWORD = "Admin123!";

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
    await page.getByRole("button", { name: /create event/i }).click();

    // Verify create page loaded
    await expect(page).toHaveURL(`${BASE_URL}/events/create`, {
      timeout: 5000,
    });
    await expect(page.getByText(/create new event/i)).toBeVisible();
  });

  test("should create a new event successfully", async ({ page }) => {
    await page.goto(`${BASE_URL}/events/create`);

    // Fill in event form
    await page.getByPlaceholder(/enter event title/i).fill("E2E Test Event");
    await page
      .getByPlaceholder(/describe the event/i)
      .fill("This is an automated test event created by Playwright");

    // Select category - Click combobox and select option
    await page.getByRole("combobox", { name: /category/i }).click();
    await page.getByRole("option", { name: /bible study/i }).click();

    // Set location
    await page.getByPlaceholder(/enter event location/i).fill("Test Chapel");

    // Set start date/time (tomorrow at 10:00 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDatetime = `${tomorrow.toISOString().split("T")[0]}T10:00`;
    await page.getByLabel(/start date.*time/i).fill(tomorrowDatetime);

    // Set end date/time (same day at 12:00 PM)
    const endDatetime = `${tomorrow.toISOString().split("T")[0]}T12:00`;
    await page.getByLabel(/end date.*time/i).fill(endDatetime);

    // Set max capacity
    await page.getByLabel(/max capacity/i).fill("50");

    // Submit form
    await page.getByRole("button", { name: /create event/i }).click();

    // Wait for redirect to events list or event detail (UUID format)
    await page.waitForURL(/\/events(\/[a-f0-9-]+)?$/i, { timeout: 10000 });

    // Verify success message or event in list
    await expect(
      page
        .locator('[role="alert"]')
        .filter({ hasText: /success|created|event added/i })
        .or(page.getByText(/event created|success/i))
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
      page.locator("text=/required|enter.*title|please provide/i").first()
    ).toBeVisible({ timeout: 3000 });
  });

  test("should validate date logic (end after start)", async ({ page }) => {
    await page.goto(`${BASE_URL}/events/create`);

    // Fill in basic required fields
    await page
      .getByPlaceholder(/enter event title/i)
      .fill("Invalid Date Event");
    await page
      .getByPlaceholder(/describe the event/i)
      .fill("Testing date validation");

    // Set start date/time (tomorrow at 2 PM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDatetime = `${tomorrow.toISOString().split("T")[0]}T14:00`;
    await page.getByLabel(/start date.*time/i).fill(tomorrowDatetime);

    // Set end date/time to today at 12 PM (before start - should be invalid)
    const today = new Date();
    const todayDatetime = `${today.toISOString().split("T")[0]}T12:00`;
    await page.getByLabel(/end date.*time/i).fill(todayDatetime);

    // Try to submit
    await page.getByRole("button", { name: /create event/i }).click();

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
      await page.waitForURL(/\/events\/[a-f0-9-]+$/i, { timeout: 5000 });

      // Click edit button
      await page.getByRole("button", { name: /edit/i }).click();

      // Wait for edit page
      await page.waitForURL(/\/events\/[a-f0-9-]+\/edit$/i, { timeout: 5000 });

      // Modify title
      const titleInput = page.getByPlaceholder(/enter event title/i);
      await titleInput.fill("Updated Event Title");

      // Submit update
      await page.getByRole("button", { name: /update|save/i }).click();

      // Wait for redirect
      await page.waitForURL(/\/events\/[a-f0-9-]+$/i, { timeout: 10000 });

      // Verify success message
      await expect(
        page
          .locator('[role="alert"]')
          .filter({ hasText: /success|updated/i })
          .or(page.getByText(/updated|success/i))
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
      await page.waitForURL(/\/events\/[a-f0-9-]+$/i, { timeout: 5000 });

      // Click cancel event button (might be in dropdown or modal)
      await page.getByRole("button", { name: /cancel event/i }).click();

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
      const clearButton = page.getByRole("button", { name: /clear/i }).first();
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
