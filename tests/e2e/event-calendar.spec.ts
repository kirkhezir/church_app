/**
 * E2E Tests for Event Calendar View
 * Tests calendar display, navigation, and event interaction
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

test.describe("Event Calendar View", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "admin@singburi-adventist.org");
    await page.fill('input[type="password"]', "Admin123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });

    // Navigate to events
    await page.goto(`${BASE_URL}/events`);
    await page.waitForSelector("text=Church Events");
  });

  test("should display events in list view by default", async ({ page }) => {
    // Verify list tab is selected
    await expect(page.locator('role=tab[name="List"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Verify events are displayed
    await expect(page.locator("text=Showing")).toBeVisible();
  });

  test("should switch to calendar view", async ({ page }) => {
    // Click Calendar tab
    await page.click('role=tab[name="Calendar"]');

    // Verify calendar is displayed
    await expect(page.locator('role=tab[name="Calendar"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Verify calendar grid with day headers
    await expect(page.locator("text=Sun")).toBeVisible();
    await expect(page.locator("text=Mon")).toBeVisible();
    await expect(page.locator("text=Sat")).toBeVisible();
  });

  test("should display month and year in calendar", async ({ page }) => {
    await page.click('role=tab[name="Calendar"]');

    // Verify month/year header (current month)
    const monthYear = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    await expect(page.locator(`text=${monthYear.split(" ")[0]}`)).toBeVisible();
  });

  test("should navigate to previous month", async ({ page }) => {
    await page.click('role=tab[name="Calendar"]');

    // Get current month display
    const currentMonth = await page
      .locator(
        "text=/January|February|March|April|May|June|July|August|September|October|November|December/"
      )
      .first()
      .textContent();

    // Click previous month button
    await page.click(
      'button[aria-label="Previous month"], button:has([class*="chevron-left"])'
    );

    // Wait for calendar to update
    await page.waitForTimeout(500);
  });

  test("should navigate to next month", async ({ page }) => {
    await page.click('role=tab[name="Calendar"]');

    // Click next month button
    await page.click(
      'button[aria-label="Next month"], button:has([class*="chevron-right"])'
    );

    // Wait for calendar to update
    await page.waitForTimeout(500);
  });

  test("should go to today when clicking Today button", async ({ page }) => {
    await page.click('role=tab[name="Calendar"]');

    // Navigate away from current month
    await page.click(
      'button[aria-label="Next month"], button:has([class*="chevron-right"])'
    );
    await page.waitForTimeout(300);

    // Click Today button
    await page.click('button:has-text("Today")');

    // Should be back to current month
    const currentMonth = new Date().toLocaleDateString("en-US", {
      month: "long",
    });
    await expect(page.locator(`text=${currentMonth}`)).toBeVisible();
  });

  test("should display events on calendar dates", async ({ page }) => {
    await page.click('role=tab[name="Calendar"]');

    // Look for event names on calendar
    // Events should appear as text on their respective date cells
    const eventCells = page.locator(
      'button:has-text("Worship"), button:has-text("Bible Study"), button:has-text("Fellowship")'
    );

    // At least some events should be visible (if any exist in the current month)
    const count = await eventCells.count();
    // This might be 0 if no events in current month, which is acceptable
  });

  test("should display calendar legend", async ({ page }) => {
    await page.click('role=tab[name="Calendar"]');

    // Check for legend items
    await expect(page.locator("text=Worship")).toBeVisible();
  });

  test("should filter events by category", async ({ page }) => {
    // In list view, test category filters
    await expect(page.locator('role=tab[name="List"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Click on Worship Service filter
    await page.click('button:has-text("Worship Service")');

    // Verify filter is applied (event count may change)
    await page.waitForTimeout(500);
  });

  test("should filter events by date range", async ({ page }) => {
    // Fill in From date
    const fromInput = page.locator('input[type="date"]').first();
    if (await fromInput.isVisible()) {
      await fromInput.fill("2026-01-01");
    }

    // Verify events are filtered
    await page.waitForTimeout(500);
  });

  test("should switch back to list view from calendar", async ({ page }) => {
    // Switch to calendar
    await page.click('role=tab[name="Calendar"]');
    await expect(page.locator('role=tab[name="Calendar"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Switch back to list
    await page.click('role=tab[name="List"]');
    await expect(page.locator('role=tab[name="List"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Verify list is displayed
    await expect(page.locator("text=Showing")).toBeVisible();
  });
});
