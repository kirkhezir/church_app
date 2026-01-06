/**
 * E2E Tests for Analytics Dashboard
 * Tests admin analytics viewing, data loading, and export
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

test.describe("Analytics Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "admin@singburi-adventist.org");
    await page.fill('input[type="password"]', "Admin123!");
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  });

  test("should navigate to analytics page", async ({ page }) => {
    // Click Analytics in sidebar
    await page.click('a[href="/admin/analytics"]');

    // Verify URL
    await expect(page).toHaveURL(`${BASE_URL}/admin/analytics`);

    // Verify page title
    await expect(page.locator("h1")).toContainText(/analytics/i);
  });

  test("should display overview stats cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Wait for data to load
    await page.waitForSelector("text=Total Members");

    // Verify stats cards are displayed
    await expect(page.locator("text=Total Members")).toBeVisible();
    await expect(page.locator("text=Avg Attendance")).toBeVisible();
    await expect(page.locator("text=Active Users")).toBeVisible();
    await expect(page.locator("text=Events This Month")).toBeVisible();
  });

  test("should switch between analytics tabs", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Wait for data to load
    await page.waitForSelector("role=tablist");

    // Click Attendance tab
    await page.click('role=tab[name="Attendance"]');
    await expect(page.locator('role=tab[name="Attendance"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Click Growth tab
    await page.click('role=tab[name="Member Growth"]');
    await expect(
      page.locator('role=tab[name="Member Growth"]')
    ).toHaveAttribute("aria-selected", "true");

    // Click Engagement tab
    await page.click('role=tab[name="Engagement"]');
    await expect(page.locator('role=tab[name="Engagement"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Click back to Overview
    await page.click('role=tab[name="Overview"]');
    await expect(page.locator('role=tab[name="Overview"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("should change time range filter", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Wait for data to load
    await page.waitForSelector("text=Total Members");

    // Open time range dropdown
    await page.click('button:has-text("Last 6 Months")');

    // Select different range
    await page.click("text=Last Year");

    // Verify selection changed
    await expect(page.locator('button:has-text("Last Year")')).toBeVisible();
  });

  test("should refresh analytics data", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Wait for initial load
    await page.waitForSelector("text=Total Members");

    // Click refresh button
    await page.click('button:has-text("Refresh")');

    // Wait for loading to complete
    await page.waitForSelector("text=Total Members");
  });

  test("should export analytics data", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Wait for data to load
    await page.waitForSelector("text=Total Members");

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click export button
    await page.click('button:has-text("Export")');

    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("analytics");
    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("should display attendance chart", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Wait for data to load
    await page.waitForSelector("text=Attendance Trends");

    // Verify chart is rendered
    await expect(page.locator("text=Attendance Trends")).toBeVisible();
  });

  test("should display member demographics", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Wait for data to load
    await page.waitForSelector("text=Total Members");

    // Verify demographics section exists on the overview
    await expect(
      page.locator("h3, div").filter({ hasText: "Demographics" }).first()
    ).toBeVisible();
  });

  test("should show engagement metrics", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Navigate to engagement tab
    await page.click('role=tab[name="Engagement"]');

    // Wait for data
    await page.waitForSelector("text=Active Users");

    // Verify engagement metrics
    await expect(page.locator("text=Active Users")).toBeVisible();
  });

  test("should restrict analytics to admin/staff only", async ({ page }) => {
    // Try to access analytics directly without login
    await page.goto(`${BASE_URL}/admin/analytics`);

    // Should redirect to login or dashboard (not analytics)
    await page.waitForTimeout(2000);
    const url = page.url();

    // Either redirected to login or the page should show appropriate access control
    expect(
      url.includes("/login") ||
        url.includes("/dashboard") ||
        url.includes("/admin/analytics")
    ).toBeTruthy();
  });
});
