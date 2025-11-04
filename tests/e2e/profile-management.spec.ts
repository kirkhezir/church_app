/**
 * E2E Tests for Profile Management
 * Tests editing profile and notification settings
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Helper to login before tests
async function login(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', "john.doe@example.com");
  await page.fill('input[type="password"]', "SecurePass123!");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
}

test.describe("Profile Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/profile`);
  });

  test("should display edit profile page", async ({ page }) => {
    // Should show profile edit form
    await expect(page.locator("h1, h2")).toContainText(
      /edit.*profile|profile/i
    );

    // Should have form fields
    await expect(
      page.locator('input[name="firstName"], input[placeholder*="First"]')
    ).toBeVisible();
    await expect(
      page.locator('input[name="lastName"], input[placeholder*="Last"]')
    ).toBeVisible();
  });

  test("should populate form with current profile data", async ({ page }) => {
    // Check that fields are pre-filled
    const firstName = page.locator(
      'input[name="firstName"], input[placeholder*="First"]'
    );
    const firstNameValue = await firstName.inputValue();
    expect(firstNameValue).toBeTruthy();
    expect(firstNameValue.length).toBeGreaterThan(0);
  });

  test("should disable email field (admin-only)", async ({ page }) => {
    // Email field should be disabled
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeDisabled();
  });

  test("should update first name successfully", async ({ page }) => {
    const newFirstName = `John${Date.now()}`;

    // Clear and fill first name
    await page.fill('input[name="firstName"], input[placeholder*="First"]', "");
    await page.fill(
      'input[name="firstName"], input[placeholder*="First"]',
      newFirstName
    );

    // Submit form
    await page.click('button[type="submit"]:has-text("Save")');

    // Should show success message
    await expect(page.locator("text=/success|updated|saved/i")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should update phone number successfully", async ({ page }) => {
    const newPhone = "+1234567890";

    // Fill phone number
    await page.fill('input[name="phone"], input[placeholder*="Phone"]', "");
    await page.fill(
      'input[name="phone"], input[placeholder*="Phone"]',
      newPhone
    );

    // Submit form
    await page.click('button[type="submit"]:has-text("Save")');

    // Should show success message
    await expect(page.locator("text=/success|updated|saved/i")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should validate required fields", async ({ page }) => {
    // Clear first name (required field)
    await page.fill('input[name="firstName"], input[placeholder*="First"]', "");

    // Try to submit
    await page.click('button[type="submit"]:has-text("Save")');

    // Should show validation error or prevent submission
    const firstName = page.locator(
      'input[name="firstName"], input[placeholder*="First"]'
    );
    const validationMessage = await firstName.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );

    expect(validationMessage).toBeTruthy();
  });

  test("should toggle privacy settings", async ({ page }) => {
    // Find privacy checkboxes
    const showPhoneCheckbox = page.locator('input[type="checkbox"]').first();

    // Get initial state
    const initialState = await showPhoneCheckbox.isChecked();

    // Toggle checkbox
    await showPhoneCheckbox.click();

    // Submit form
    await page.click('button[type="submit"]:has-text("Save")');

    // Should show success message
    await expect(page.locator("text=/success|updated|saved/i")).toBeVisible({
      timeout: 5000,
    });

    // Reload page and verify change persisted
    await page.reload();
    await page.waitForLoadState("networkidle");

    const newState = await showPhoneCheckbox.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("should navigate back to dashboard", async ({ page }) => {
    // Click cancel or back button
    await page.click(
      'button:has-text("Cancel"), a:has-text("Back"), a:has-text("Dashboard")'
    );

    // Should navigate to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test("should display privacy settings section", async ({ page }) => {
    // Should show privacy settings
    await expect(page.locator("text=/privacy|visibility|show/i")).toBeVisible();
  });
});

test.describe("Notification Settings", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/notifications`);
  });

  test("should display notification settings page", async ({ page }) => {
    // Should show notification settings
    await expect(page.locator("h1, h2")).toContainText(/notification/i);
  });

  test("should display email notifications toggle", async ({ page }) => {
    // Should have email notifications switch/toggle
    await expect(page.locator("text=/email.*notification/i")).toBeVisible();
  });

  test("should toggle email notifications", async ({ page }) => {
    // Find email notifications switch
    const emailSwitch = page
      .locator('[role="switch"], input[type="checkbox"]')
      .first();

    // Get initial state
    const initialState = await emailSwitch.isChecked();

    // Toggle switch
    await emailSwitch.click();

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Should show success message
    await expect(page.locator("text=/success|updated|saved/i")).toBeVisible({
      timeout: 5000,
    });

    // Verify toggle changed
    const newState = await emailSwitch.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("should navigate back to dashboard from notifications", async ({
    page,
  }) => {
    // Click back or cancel button
    await page.click(
      'button:has-text("Cancel"), a:has-text("Back"), a:has-text("Dashboard")'
    );

    // Should navigate to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test("should display notification preferences explanation", async ({
    page,
  }) => {
    // Should explain what notifications include
    await expect(
      page.locator("text=/announcement|event|message|newsletter/i")
    ).toBeVisible();
  });
});
