/**
 * E2E Tests for Password Reset Flow
 * Tests requesting password reset and resetting password
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

test.describe("Password Reset Flow", () => {
  test("should navigate to password reset request page", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Click "Forgot Password?" link
    await page.click('a:has-text("Forgot"), a:has-text("Reset")');

    // Should navigate to password reset request page
    await expect(page).toHaveURL(/password-reset-request/);
    await expect(page.locator("h1, h2")).toContainText(
      /forgot|reset.*password/i
    );
  });

  test("should request password reset successfully", async ({ page }) => {
    await page.goto(`${BASE_URL}/password-reset-request`);

    // Fill in email
    await page.fill('input[type="email"]', "john.doe@example.com");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(
      page.locator("text=/email sent|check.*email|success/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("should show success even for non-existent email (security)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/password-reset-request`);

    // Fill in non-existent email
    await page.fill('input[type="email"]', "nonexistent@example.com");

    // Submit form
    await page.click('button[type="submit"]');

    // Should still show success message (prevents email enumeration)
    await expect(
      page.locator("text=/email sent|check.*email|success/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("should validate email format on password reset request", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/password-reset-request`);

    await page.fill('input[type="email"]', "invalid-email");
    await page.click('button[type="submit"]');

    // Should show validation error
    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );

    expect(validationMessage).toBeTruthy();
  });

  test("should display password reset form with valid token", async ({
    page,
  }) => {
    // Note: In a real test, we'd need to generate a valid token from the backend
    // For now, we'll just test the page loads
    const mockToken = "test-token-12345";
    await page.goto(`${BASE_URL}/reset-password?token=${mockToken}`);

    // Should show password reset form
    await expect(page.locator("h1, h2")).toContainText(
      /reset.*password|new.*password/i
    );
    await expect(page.locator('input[type="password"]')).toHaveCount(2); // Password and confirm
  });

  test("should validate password requirements", async ({ page }) => {
    const mockToken = "test-token-12345";
    await page.goto(`${BASE_URL}/reset-password?token=${mockToken}`);

    // Try weak password
    await page.fill('input[type="password"]').first().fill("weak");
    await page.fill('input[type="password"]').last().fill("weak");

    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(
      page.locator("text=/8.*characters|uppercase|lowercase|number|special/i")
    ).toBeVisible({ timeout: 3000 });
  });

  test("should validate password confirmation matches", async ({ page }) => {
    const mockToken = "test-token-12345";
    await page.goto(`${BASE_URL}/reset-password?token=${mockToken}`);

    // Fill different passwords
    await page.fill('input[type="password"]').first().fill("ValidPass123!");
    await page.fill('input[type="password"]').last().fill("DifferentPass123!");

    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(
      page.locator("text=/passwords.*match|must match/i")
    ).toBeVisible({ timeout: 3000 });
  });

  test("should show error for invalid/expired token", async ({ page }) => {
    const invalidToken = "invalid-token-xyz";
    await page.goto(`${BASE_URL}/reset-password?token=${invalidToken}`);

    // Fill valid passwords
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill("NewSecure123!");
    await passwordInputs.last().fill("NewSecure123!");

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator("text=/invalid.*token|expired.*token|link.*expired/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("should navigate back to login from password reset request", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/password-reset-request`);

    // Click back to login link
    await page.click('a:has-text("Back"), a:has-text("Login")');

    // Should navigate to login page
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});
