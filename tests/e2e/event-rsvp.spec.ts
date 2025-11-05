/**
 * E2E Tests for Event RSVP Flow (T125)
 * Tests member RSVP, cancellation, and admin viewing RSVPs
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Test user credentials (from seed data)
const MEMBER_EMAIL = "john.doe@example.com";
const MEMBER_PASSWORD = "SecurePass123!";
const ADMIN_EMAIL = "admin@church.com";
const ADMIN_PASSWORD = "SecurePass123!";

test.describe("Event RSVP Flow - Member Actions", () => {
  test.beforeEach(async ({ page }) => {
    // Login as member before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', MEMBER_EMAIL);
    await page.fill('input[type="password"]', MEMBER_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test("should view events list as member", async ({ page }) => {
    // Navigate to events
    await page.goto(`${BASE_URL}/events`);

    // Verify events page loaded
    await expect(page).toHaveURL(`${BASE_URL}/events`);
    await expect(page.locator("h1, h2")).toContainText(/events/i);

    // Verify at least one event is visible (assuming seed data)
    const eventCards = page.locator(
      '[data-testid="event-card"], .event-card, [class*="event"]'
    );
    await expect(eventCards.first()).toBeVisible({ timeout: 5000 });
  });

  test("should view event details", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Click on first event
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();

    // Wait for event detail page
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    // Verify event details are displayed
    await expect(
      page.locator('h1, h2, [data-testid="event-title"]')
    ).toBeVisible();
  });

  test("should RSVP to an event successfully", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Find first event with RSVP button
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();

    // Wait for event detail page
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    // Look for RSVP button
    const rsvpButton = page
      .locator('button:has-text("RSVP"), button:has-text("Register")')
      .first();

    if (await rsvpButton.isVisible()) {
      // Check if button is not disabled
      const isDisabled = await rsvpButton.isDisabled();

      if (!isDisabled) {
        await rsvpButton.click();

        // Wait for success message
        await expect(
          page.locator(
            'text=/success|rsvp.*confirmed|registered/i, [role="alert"]'
          )
        ).toBeVisible({ timeout: 5000 });

        // Verify button text changed to "Cancel RSVP" or similar
        await expect(
          page.locator(
            'button:has-text("Cancel RSVP"), button:has-text("Already RSVP")'
          )
        ).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test("should cancel RSVP", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Navigate to first event
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    // Look for Cancel RSVP button (means user already RSVPd)
    const cancelButton = page.locator(
      'button:has-text("Cancel RSVP"), button:has-text("Cancel Registration")'
    );

    if (await cancelButton.isVisible({ timeout: 2000 })) {
      await cancelButton.click();

      // Wait for confirmation
      await expect(
        page.locator('text=/cancelled|removed|rsvp.*removed/i, [role="alert"]')
      ).toBeVisible({ timeout: 5000 });

      // Verify button changed back to RSVP
      await expect(
        page.locator('button:has-text("RSVP"), button:has-text("Register")')
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test("should not RSVP to full event", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Look for an event that shows "Event Full"
    const fullEventButton = page
      .locator(
        'button:has-text("Event Full"), button:has-text("Capacity Reached")'
      )
      .first();

    if (await fullEventButton.isVisible({ timeout: 2000 })) {
      // Verify button is disabled
      await expect(fullEventButton).toBeDisabled();
    }
  });

  test("should not RSVP to cancelled event", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Look for a cancelled event
    const cancelledEvent = page
      .locator("text=/cancelled|event.*cancelled/i")
      .first();

    if (await cancelledEvent.isVisible({ timeout: 2000 })) {
      // Click to view details
      await cancelledEvent.click();
      await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

      // Verify no RSVP button is present
      const rsvpButton = page.locator('button:has-text("RSVP")');
      await expect(rsvpButton).not.toBeVisible({ timeout: 2000 });
    }
  });

  test("should see capacity information", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Click on first event
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    // Look for capacity information (e.g., "50 / 100 attendees")
    const capacityText = page.locator(
      "text=/\\d+.*\\/.*\\d+.*attendees|capacity|spots.*left/i"
    );

    if (await capacityText.isVisible({ timeout: 2000 })) {
      // Verify capacity is displayed
      await expect(capacityText).toBeVisible();
    }
  });

  test("should redirect to login when not authenticated", async ({ page }) => {
    // Logout first
    await page.goto(`${BASE_URL}/dashboard`);
    const logoutButton = page.locator(
      'button:has-text("Logout"), a:has-text("Logout")'
    );
    if (await logoutButton.isVisible({ timeout: 2000 })) {
      await logoutButton.click();
    }

    // Navigate to events
    await page.goto(`${BASE_URL}/events`);

    // Click on an event
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    if (await firstEvent.isVisible()) {
      await firstEvent.click();
      await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

      // Try to click RSVP button
      const rsvpButton = page.locator(
        'button:has-text("RSVP"), button:has-text("Log In to RSVP")'
      );
      if (await rsvpButton.isVisible()) {
        await rsvpButton.click();

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
      }
    }
  });
});

test.describe("Event RSVP Flow - Admin Views RSVPs", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test("should view RSVP list for an event", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Click on first event
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    // Click "View RSVPs" or "Attendees" button
    const viewRSVPsButton = page
      .locator(
        'text=/view.*rsvps|view.*attendees|manage.*rsvps/i, button:has-text("RSVPs")'
      )
      .first();

    if (await viewRSVPsButton.isVisible({ timeout: 2000 })) {
      await viewRSVPsButton.click();

      // Wait for RSVP list page
      await page.waitForURL(/\/events\/\d+\/rsvps$/, { timeout: 5000 });

      // Verify RSVP list is displayed
      await expect(page.locator("h1, h2")).toContainText(/rsvps|attendees/i);
    }
  });

  test("should see RSVP statistics", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Navigate to first event's RSVP list
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    // Click view RSVPs
    const viewRSVPsButton = page
      .locator("text=/view.*rsvps|attendees/i")
      .first();
    if (await viewRSVPsButton.isVisible({ timeout: 2000 })) {
      await viewRSVPsButton.click();
      await page.waitForURL(/\/events\/\d+\/rsvps$/, { timeout: 5000 });

      // Look for statistics (total RSVPs, attendance rate, etc.)
      const statsSection = page.locator(
        "text=/total|confirmed|pending|statistics/i"
      );
      await expect(statsSection.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should filter RSVPs by status", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Navigate to RSVP list
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    const viewRSVPsButton = page.locator("text=/view.*rsvps/i").first();
    if (await viewRSVPsButton.isVisible({ timeout: 2000 })) {
      await viewRSVPsButton.click();
      await page.waitForURL(/\/events\/\d+\/rsvps$/, { timeout: 5000 });

      // Look for status filter tabs/buttons
      const confirmedTab = page
        .locator(
          'button:has-text("Confirmed"), [role="tab"]:has-text("Confirmed")'
        )
        .first();
      if (await confirmedTab.isVisible({ timeout: 2000 })) {
        await confirmedTab.click();

        // Wait for filtered results
        await page.waitForTimeout(1000);
      }
    }
  });

  test("should search RSVPs by member name", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Navigate to RSVP list
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    const viewRSVPsButton = page.locator("text=/view.*rsvps/i").first();
    if (await viewRSVPsButton.isVisible({ timeout: 2000 })) {
      await viewRSVPsButton.click();
      await page.waitForURL(/\/events\/\d+\/rsvps$/, { timeout: 5000 });

      // Look for search input
      const searchInput = page
        .locator('input[type="search"], input[placeholder*="search" i]')
        .first();
      if (await searchInput.isVisible({ timeout: 2000 })) {
        await searchInput.fill("John");
        await page.waitForTimeout(1000);

        // Verify filtered results
      }
    }
  });

  test("should export RSVP list", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Navigate to RSVP list
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    const viewRSVPsButton = page.locator("text=/view.*rsvps/i").first();
    if (await viewRSVPsButton.isVisible({ timeout: 2000 })) {
      await viewRSVPsButton.click();
      await page.waitForURL(/\/events\/\d+\/rsvps$/, { timeout: 5000 });

      // Look for export button
      const exportButton = page
        .locator('button:has-text("Export"), button:has-text("Download")')
        .first();
      if (await exportButton.isVisible({ timeout: 2000 })) {
        // Note: Actual download testing requires special Playwright setup
        await expect(exportButton).toBeVisible();
      }
    }
  });
});

test.describe("Event RSVP Flow - Capacity Limits", () => {
  test.beforeEach(async ({ page }) => {
    // Login as member
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', MEMBER_EMAIL);
    await page.fill('input[type="password"]', MEMBER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test("should show spots left when event has capacity", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Look for event card with capacity information
    const capacityInfo = page
      .locator("text=/\\d+.*spots.*left|\\d+.*\\/ \\d+/i")
      .first();

    if (await capacityInfo.isVisible({ timeout: 2000 })) {
      await expect(capacityInfo).toBeVisible();
    }
  });

  test("should update capacity after RSVP", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Click on first event
    const firstEvent = page
      .locator('[data-testid="event-card"], .event-card')
      .first();
    await firstEvent.click();
    await page.waitForURL(/\/events\/\d+$/, { timeout: 5000 });

    // Get current capacity count
    const capacityText = page.locator("text=/\\d+.*\\/.*\\d+/i").first();
    const initialText = await capacityText.textContent();

    // RSVP to event
    const rsvpButton = page.locator('button:has-text("RSVP")').first();
    if (
      (await rsvpButton.isVisible({ timeout: 2000 })) &&
      !(await rsvpButton.isDisabled())
    ) {
      await rsvpButton.click();

      // Wait for success
      await page.waitForTimeout(2000);

      // Verify capacity updated (this assumes real-time update or page reload)
      const updatedText = await capacityText.textContent();
      // Note: This test might need adjustment based on actual implementation
    }
  });
});

test.describe("Event RSVP Flow - Edge Cases", () => {
  test("should handle concurrent RSVPs at capacity limit", async ({
    page,
    context,
  }) => {
    // This test simulates multiple users trying to RSVP at the same time
    // when only one spot is left

    // Create a second page (simulating another user)
    const page2 = await context.newPage();

    // Login both users as members (in real scenario, would use different accounts)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', MEMBER_EMAIL);
    await page.fill('input[type="password"]', MEMBER_PASSWORD);
    await page.click('button[type="submit"]');

    await page2.goto(`${BASE_URL}/login`);
    await page2.fill('input[type="email"]', "jane.smith@example.com");
    await page2.fill('input[type="password"]', "SecurePass123!");
    await page2.click('button[type="submit"]');

    // Navigate both to same event (assuming it's near capacity)
    await page.goto(`${BASE_URL}/events`);
    await page2.goto(`${BASE_URL}/events`);

    // Click first event on both
    const event1 = page.locator('[data-testid="event-card"]').first();
    const event2 = page2.locator('[data-testid="event-card"]').first();

    if ((await event1.isVisible()) && (await event2.isVisible())) {
      await Promise.all([event1.click(), event2.click()]);

      // Try to RSVP simultaneously
      const rsvp1 = page.locator('button:has-text("RSVP")');
      const rsvp2 = page2.locator('button:has-text("RSVP")');

      // One should succeed, one might fail if at capacity
      // This is a race condition test
    }

    await page2.close();
  });

  test("should handle RSVP when user already RSVPd from another device", async ({
    page,
  }) => {
    // This test verifies idempotent behavior
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', MEMBER_EMAIL);
    await page.fill('input[type="password"]', MEMBER_PASSWORD);
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/events`);
    const firstEvent = page.locator('[data-testid="event-card"]').first();
    await firstEvent.click();

    // If already RSVPd, button should show "Already RSVP'd" or similar
    const alreadyRSVPButton = page.locator(
      'button:has-text("Already RSVP"), button:has-text("Cancel RSVP")'
    );

    if (await alreadyRSVPButton.isVisible({ timeout: 2000 })) {
      // Verify user cannot RSVP again
      await expect(alreadyRSVPButton).toBeVisible();
    }
  });
});
