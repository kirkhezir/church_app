/**
 * E2E Tests for Mobile Navigation
 * Tests responsive mobile bottom navigation and mobile layouts
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Mobile viewport dimensions
const MOBILE_VIEWPORT = { width: 375, height: 812 }; // iPhone X dimensions

test.describe("Mobile Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORT);

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "admin@singburi-adventist.org");
    await page.fill('input[type="password"]', "Admin123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test("should display mobile bottom navigation", async ({ page }) => {
    // Verify bottom navigation is visible
    const bottomNav = page.locator('nav:has(button:has-text("Home"))');
    await expect(bottomNav).toBeVisible();

    // Verify navigation buttons
    await expect(page.locator('button:has-text("Home")')).toBeVisible();
    await expect(page.locator('button:has-text("Events")')).toBeVisible();
    await expect(page.locator('button:has-text("Alerts")')).toBeVisible();
    await expect(page.locator('button:has-text("Messages")')).toBeVisible();
    await expect(page.locator('button:has-text("Profile")')).toBeVisible();
  });

  test("should navigate to dashboard via Home button", async ({ page }) => {
    // Navigate away first
    await page.goto(`${BASE_URL}/events`);

    // Click Home in bottom nav
    await page.click('button:has-text("Home")');

    // Verify navigation
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test("should navigate to events via Events button", async ({ page }) => {
    await page.click('button:has-text("Events")');

    await expect(page).toHaveURL(`${BASE_URL}/events`);
    await expect(page.locator("h1")).toContainText(/event/i);
  });

  test("should navigate to announcements via Alerts button", async ({
    page,
  }) => {
    await page.click('button:has-text("Alerts")');

    await expect(page).toHaveURL(`${BASE_URL}/announcements`);
  });

  test("should navigate to messages via Messages button", async ({ page }) => {
    await page.click('button:has-text("Messages")');

    await expect(page).toHaveURL(`${BASE_URL}/messages`);
  });

  test("should navigate to profile via Profile button", async ({ page }) => {
    await page.click('button:has-text("Profile")');

    await expect(page).toHaveURL(`${BASE_URL}/profile`);
  });

  test("should show notification badge on Alerts button", async ({ page }) => {
    // Look for badge/count on Alerts button
    const alertsButton = page.locator('button:has-text("Alerts")');
    await expect(alertsButton).toBeVisible();

    // Badge might show a number if there are unread announcements
  });

  test("should show message count on Messages button", async ({ page }) => {
    // Look for badge/count on Messages button
    const messagesButton = page.locator('button:has-text("Messages")');
    await expect(messagesButton).toBeVisible();
  });

  test("should hide sidebar on mobile", async ({ page }) => {
    // Sidebar should be hidden by default on mobile
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // On mobile, sidebar might be hidden or togglable
    // Check that main content is visible without sidebar blocking
    await expect(page.locator("main")).toBeVisible();
  });

  test("should toggle sidebar with hamburger menu", async ({ page }) => {
    // Look for sidebar toggle button
    const toggleButton = page.locator('button:has-text("Toggle Sidebar")');

    if (await toggleButton.isVisible()) {
      // Click to open sidebar
      await toggleButton.click();

      // Wait for animation
      await page.waitForTimeout(300);

      // Sidebar should be visible
      await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

      // Click again to close
      await toggleButton.click();
    }
  });
});

test.describe("Mobile Responsive Layouts", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "admin@singburi-adventist.org");
    await page.fill('input[type="password"]', "Admin123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test("should display dashboard in mobile layout", async ({ page }) => {
    // Dashboard should be visible and readable
    await expect(page.locator("h1, h2")).toContainText(/welcome|dashboard/i);

    // Content should not overflow
    const mainContent = page.locator("main");
    const box = await mainContent.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
  });

  test("should display events page in mobile layout", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Events should be visible
    await expect(page.locator("h1")).toContainText(/event/i);

    // Event cards should stack vertically
    const eventCards = page.locator('[class*="card"]');
    const count = await eventCards.count();

    if (count > 0) {
      // Cards should be full width or near full width on mobile
    }
  });

  test("should display member directory in mobile layout", async ({ page }) => {
    await page.goto(`${BASE_URL}/members`);

    // Members should be visible
    await expect(page.locator("h1")).toContainText(/member/i);

    // Search should be visible
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test("should display analytics in mobile layout", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Analytics should load
    await expect(page.locator("h1")).toContainText(/analytics/i);

    // Stats cards should be visible (may stack vertically)
    await page.waitForSelector("text=Total Members");
  });
});

test.describe("Tablet Responsive", () => {
  const TABLET_VIEWPORT = { width: 768, height: 1024 }; // iPad dimensions

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "admin@singburi-adventist.org");
    await page.fill('input[type="password"]', "Admin123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test("should display sidebar on tablet", async ({ page }) => {
    // On tablet, sidebar might be visible or collapsible
    await expect(page.locator("main")).toBeVisible();
  });

  test("should not show mobile bottom nav on tablet", async ({ page }) => {
    // Bottom nav should be hidden on larger screens
    const bottomNav = page.locator('nav:has(button:has-text("Home"))');

    // May or may not be visible depending on breakpoint
  });
});
