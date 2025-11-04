/**
 * E2E Tests for Authentication Flow
 * Tests login, logout, and token refresh
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto(BASE_URL);
  });

  test("should display login page for unauthenticated users", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Should redirect to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.locator("h1, h2")).toContainText(/log.*in/i);
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Fill in login form
    await page.fill('input[type="email"]', "john.doe@example.com");
    await page.fill('input[type="password"]', "SecurePass123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });

    // Should see dashboard content
    await expect(page.locator("h1, h2")).toContainText(/dashboard|welcome/i);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[type="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator("text=/invalid credentials|login failed/i")
    ).toBeVisible({ timeout: 5000 });

    // Should stay on login page
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "john.doe@example.com");
    await page.fill('input[type="password"]', "SecurePass123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });

    // Logout
    await page.click(
      'button:has-text("Logout"), a:has-text("Logout"), [role="button"]:has-text("Logout")'
    );

    // Should redirect to login
    await expect(page).toHaveURL(`${BASE_URL}/login`, { timeout: 5000 });
  });

  test("should protect dashboard route", async ({ page }) => {
    // Try to access dashboard without login
    await page.goto(`${BASE_URL}/dashboard`);

    // Should redirect to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("should protect profile route", async ({ page }) => {
    // Try to access profile without login
    await page.goto(`${BASE_URL}/profile`);

    // Should redirect to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("should validate email format", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[type="email"]', "invalid-email");
    await page.fill('input[type="password"]', "password123");

    await page.click('button[type="submit"]');

    // Should show validation error or prevent submission
    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );

    expect(validationMessage).toBeTruthy();
  });

  test("should require password field", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[type="email"]', "test@example.com");
    // Leave password empty

    await page.click('button[type="submit"]');

    // Should show validation error
    const passwordInput = page.locator('input[type="password"]');
    const validationMessage = await passwordInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );

    expect(validationMessage).toBeTruthy();
  });
});
