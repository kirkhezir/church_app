import { test, expect } from "@playwright/test";

/**
 * E2E Test for Landing Page Visitor Journey
 *
 * Tests the complete visitor experience:
 * 1. Navigate to landing page
 * 2. View church information
 * 3. Check worship times
 * 4. View location map
 * 5. Read mission statement
 * 6. Fill and submit contact form
 * 7. Verify submission success
 *
 * Following TDD: These tests should FAIL until the landing page is implemented
 *
 * Note: Landing page doesn't exist yet - this is the RED phase
 */

test.describe("Landing Page - Visitor Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to landing page (will fail until page exists)
    await page.goto("/");
  });

  test("should display landing page with all sections", async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Sing Buri Adventist Center|สิงห์บุรี/);

    // Verify main sections are visible
    await expect(page.locator("h1")).toContainText(
      /Sing Buri Adventist Center|welcome/i
    );
    await expect(
      page.getByRole("heading", { name: /worship.*times/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /location|find us/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /mission|about/i })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /contact/i })).toBeVisible();
  });

  test("should display church name in both languages", async ({ page }) => {
    await expect(page.locator("text=Sing Buri Adventist Center")).toBeVisible();
    await expect(page.locator("text=ศูนย์แอ็ดเวนตีสท์สิงห์บุรี")).toBeVisible();
  });

  test("should display worship times information", async ({ page }) => {
    // Scroll to worship times section
    await page
      .getByRole("heading", { name: /worship.*times/i })
      .scrollIntoViewIfNeeded();

    // Verify Sabbath/Saturday service information
    await expect(page.locator("text=/sabbath|saturday/i")).toBeVisible();

    // Verify time format (e.g., "9:00 AM")
    await expect(page.locator("text=/\\d{1,2}:\\d{2}/")).toBeVisible();
  });

  test("should display embedded Google Maps", async ({ page }) => {
    // Scroll to location section
    await page
      .getByRole("heading", { name: /location|find us/i })
      .scrollIntoViewIfNeeded();

    // Verify iframe exists
    const mapFrame = page.frameLocator(
      'iframe[title*="map" i], iframe[src*="google.com/maps"]'
    );
    await expect(mapFrame.locator("body")).toBeAttached({ timeout: 5000 });
  });

  test("should display address information", async ({ page }) => {
    await page
      .getByRole("heading", { name: /location/i })
      .scrollIntoViewIfNeeded();

    await expect(page.locator("text=/sing buri|สิงห์บุรี/i")).toBeVisible();
    await expect(page.locator("text=/thailand/i")).toBeVisible();
  });

  test("should display mission statement", async ({ page }) => {
    await page
      .getByRole("heading", { name: /mission|about/i })
      .scrollIntoViewIfNeeded();

    // Verify mission content exists and is meaningful
    const missionText = await page
      .locator(
        '[role="region"]:has-text("mission"), section:has-text("mission")'
      )
      .textContent();
    expect(missionText?.length).toBeGreaterThan(50); // Should have substantial content
  });

  test("should have accessible contact form", async ({ page }) => {
    // Scroll to contact form
    await page
      .getByRole("heading", { name: /contact/i })
      .scrollIntoViewIfNeeded();

    // Verify all form fields are present
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/subject/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /submit|send/i })
    ).toBeVisible();
  });

  test("should validate contact form required fields", async ({ page }) => {
    await page
      .getByRole("heading", { name: /contact/i })
      .scrollIntoViewIfNeeded();

    // Try to submit empty form
    await page.getByRole("button", { name: /submit|send/i }).click();

    // Verify validation messages appear
    await expect(page.locator("text=/required|please fill/i")).toBeVisible();
  });

  test("should validate email format in contact form", async ({ page }) => {
    await page
      .getByRole("heading", { name: /contact/i })
      .scrollIntoViewIfNeeded();

    // Fill invalid email
    await page.getByLabel(/name/i).fill("John Doe");
    await page.getByLabel(/email/i).fill("invalid-email");
    await page.getByLabel(/subject/i).fill("Test Subject");
    await page
      .getByLabel(/message/i)
      .fill("This is a test message with more than 20 characters.");

    await page.getByRole("button", { name: /submit|send/i }).click();

    // Verify email validation error
    await expect(
      page.locator("text=/valid.*email|email.*format/i")
    ).toBeVisible();
  });

  test("should validate message minimum length", async ({ page }) => {
    await page
      .getByRole("heading", { name: /contact/i })
      .scrollIntoViewIfNeeded();

    // Fill form with short message
    await page.getByLabel(/name/i).fill("John Doe");
    await page.getByLabel(/email/i).fill("john@example.com");
    await page.getByLabel(/subject/i).fill("Test");
    await page.getByLabel(/message/i).fill("Short"); // Less than 20 characters

    await page.getByRole("button", { name: /submit|send/i }).click();

    // Verify message length validation error
    await expect(
      page.locator("text=/20.*characters|message.*too.*short/i")
    ).toBeVisible();
  });

  test("should successfully submit valid contact form", async ({ page }) => {
    await page
      .getByRole("heading", { name: /contact/i })
      .scrollIntoViewIfNeeded();

    // Fill valid form data
    await page.getByLabel(/name/i).fill("Jane Smith");
    await page.getByLabel(/email/i).fill("jane.smith@example.com");
    await page.getByLabel(/subject/i).fill("Inquiry about Worship Services");
    await page
      .getByLabel(/message/i)
      .fill(
        "I am interested in learning more about your worship services and community activities. When can I visit?"
      );

    // Submit form
    await page.getByRole("button", { name: /submit|send/i }).click();

    // Verify success message appears
    await expect(
      page.locator("text=/success|thank you|received/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("should disable submit button while submitting", async ({ page }) => {
    await page
      .getByRole("heading", { name: /contact/i })
      .scrollIntoViewIfNeeded();

    // Fill valid form
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/subject/i).fill("Test Subject");
    await page
      .getByLabel(/message/i)
      .fill("Test message with sufficient length for validation.");

    const submitButton = page.getByRole("button", { name: /submit|send/i });

    // Click submit
    await submitButton.click();

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled();
  });

  test("should clear form after successful submission", async ({ page }) => {
    await page
      .getByRole("heading", { name: /contact/i })
      .scrollIntoViewIfNeeded();

    // Fill and submit form
    await page.getByLabel(/name/i).fill("Clear Test");
    await page.getByLabel(/email/i).fill("clear@example.com");
    await page.getByLabel(/subject/i).fill("Clear Test");
    await page
      .getByLabel(/message/i)
      .fill("Testing form clearing after successful submission.");

    await page.getByRole("button", { name: /submit|send/i }).click();

    // Wait for success message
    await expect(page.locator("text=/success|thank you/i")).toBeVisible({
      timeout: 5000,
    });

    // Verify form fields are cleared
    await expect(page.getByLabel(/name/i)).toHaveValue("");
    await expect(page.getByLabel(/email/i)).toHaveValue("");
    await expect(page.getByLabel(/subject/i)).toHaveValue("");
    await expect(page.getByLabel(/message/i)).toHaveValue("");
  });
});

test.describe("Landing Page - Responsive Design", () => {
  test("should be mobile-friendly", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify page loads and is usable on mobile
    await expect(page.locator("h1")).toBeVisible();

    // Verify sections are accessible on mobile
    await page
      .getByRole("heading", { name: /worship/i })
      .scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: /worship/i })).toBeVisible();

    // Verify contact form is usable on mobile
    await page
      .getByRole("heading", { name: /contact/i })
      .scrollIntoViewIfNeeded();
    await expect(page.getByLabel(/name/i)).toBeVisible();
  });

  test("should be tablet-friendly", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // Verify page loads properly
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("heading", { name: /worship/i })).toBeVisible();
  });

  test("should be desktop-friendly", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    // Verify page loads properly
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("heading", { name: /worship/i })).toBeVisible();
  });
});

test.describe("Landing Page - Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Verify h1 exists and is unique
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // Verify heading levels don't skip (h1, h2, h3, not h1, h3)
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    expect(headings.length).toBeGreaterThan(2);
  });

  test("should have alt text for images", async ({ page }) => {
    await page.goto("/");

    // Verify all images have alt attributes
    const images = await page.locator("img").all();
    for (const img of images) {
      await expect(img).toHaveAttribute("alt");
    }
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Tab through interactive elements
    await page.keyboard.press("Tab");

    // Verify focus is visible
    const focusedElement = await page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("heading", { name: /contact/i })
      .scrollIntoViewIfNeeded();

    // Verify all form inputs have associated labels
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const subjectInput = page.getByLabel(/subject/i);
    const messageInput = page.getByLabel(/message/i);

    await expect(nameInput).toHaveAttribute("id");
    await expect(emailInput).toHaveAttribute("id");
    await expect(subjectInput).toHaveAttribute("id");
    await expect(messageInput).toHaveAttribute("id");
  });
});

test.describe("Landing Page - Performance", () => {
  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test("should have no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");

    expect(consoleErrors).toHaveLength(0);
  });
});
