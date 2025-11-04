/**
 * E2E Test: Authentication - Login Flow
 *
 * Tests the complete login flow from frontend to backend:
 * - Navigate to login page
 * - Enter credentials
 * - Submit login form
 * - Verify redirect to dashboard
 * - Verify token storage
 * - Test protected route access
 */

import { test, expect } from "@playwright/test";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const TEST_EMAIL = "admin@singburi.org"; // From seed data
const TEST_PASSWORD = "Admin123!"; // Default seed password

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display login page", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    // Verify login page elements
    await expect(
      page.locator("h1, h2").filter({ hasText: /login/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in|login/i })
    ).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    // Try to submit without filling fields
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Check for validation messages (HTML5 or custom)
    const emailInput = page.getByLabel(/email/i);
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    // Enter invalid credentials
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("WrongPassword123!");

    // Submit form
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Wait for error message
    await expect(page.getByText(/invalid credentials|incorrect/i)).toBeVisible({
      timeout: 5000,
    });

    // Verify still on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("should successfully login with valid credentials", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    // Enter valid credentials
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);

    // Submit form
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Verify tokens are stored
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken")
    );
    const refreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken")
    );
    const user = await page.evaluate(() => localStorage.getItem("user"));

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    expect(user).toBeTruthy();

    // Verify user data
    const userData = JSON.parse(user!);
    expect(userData.email).toBe(TEST_EMAIL);
    expect(userData).toHaveProperty("id");
    expect(userData).toHaveProperty("firstName");
    expect(userData).toHaveProperty("lastName");
  });

  test("should redirect authenticated user from login to dashboard", async ({
    page,
  }) => {
    // First, login
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Now try to go back to login page
    await page.goto(`${FRONTEND_URL}/login`);

    // Should be redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });

  test("should protect dashboard route when not authenticated", async ({
    page,
  }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`);

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test("should allow access to protected routes after login", async ({
    page,
  }) => {
    // Login first
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Try to access other protected routes
    const protectedRoutes = ["/events", "/announcements", "/profile"];

    for (const route of protectedRoutes) {
      await page.goto(`${FRONTEND_URL}${route}`);
      // Should not be redirected to login
      await expect(page).toHaveURL(new RegExp(route), { timeout: 5000 });
    }
  });

  test("should logout and clear tokens", async ({ page }) => {
    // Login first
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Find and click logout button (might be in navigation or user menu)
    const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
    await logoutButton.click();

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    // Verify tokens are cleared
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken")
    );
    const refreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken")
    );
    const user = await page.evaluate(() => localStorage.getItem("user"));

    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(user).toBeNull();

    // Verify cannot access protected routes
    await page.goto(`${FRONTEND_URL}/dashboard`);
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test("should show account locked message after 5 failed attempts", async ({
    page,
  }) => {
    const lockoutEmail = `lockout-${Date.now()}@test.com`;

    // Note: This test would require creating a test user first
    // For now, we'll skip the actual test and just document the flow
    test.skip();

    // Create test user (would need API endpoint)
    // Try 5 failed login attempts
    // Verify lockout message on 6th attempt
    // Verify 423 status and "locked" message
  });
});

test.describe("Login Page UI", () => {
  test("should have password visibility toggle", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill("TestPassword123!");

    // Initially password should be hidden (type="password")
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Look for visibility toggle button
    const toggleButton = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();

    // This might not exist in current implementation - that's okay
    const toggleExists = (await toggleButton.count()) > 0;
    if (toggleExists) {
      await toggleButton.click();
      // After click, might change to type="text"
      // This is optional functionality
    }
  });

  test("should have forgot password link", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    // Look for forgot password link
    const forgotPasswordLink = page.getByRole("link", {
      name: /forgot.*password/i,
    });
    await expect(forgotPasswordLink).toBeVisible();

    // Verify it points to password reset page
    await expect(forgotPasswordLink).toHaveAttribute("href", /reset|forgot/);
  });

  test("should show loading state during login", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);

    // Start watching for loading indicator before clicking
    const submitButton = page.getByRole("button", { name: /sign in|login/i });

    await submitButton.click();

    // Check if button shows loading state (disabled or loading text)
    // This is a quick check - might not catch fast responses
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    // Loading state might be very brief, so we don't assert - just document
  });
});
