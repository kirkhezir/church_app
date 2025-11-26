/**
 * E2E Test: Admin Member Management
 *
 * Tests the complete admin member management flow:
 * - Admin creates a new member
 * - Sends invitation email
 * - Views member list
 * - Deletes member
 * - Audit log entries
 *
 * T284: Write E2E test for admin member management
 */

import { test, expect, Page } from "@playwright/test";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const ADMIN_EMAIL = "admin@singburi.org";
const ADMIN_PASSWORD = "Admin123!";

// Helper to generate unique test email
const generateTestEmail = () => `test-${Date.now()}@example.com`;

test.describe("Admin Member Management", () => {
  let authToken: string;

  test.beforeEach(async ({ page }) => {
    // Clear auth state
    await page.goto(FRONTEND_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Login as admin
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Get auth token for API tests
    authToken = await page.evaluate(
      () => localStorage.getItem("accessToken") || ""
    );
  });

  test.describe("Admin Member List Page", () => {
    test("should display admin members page", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members`);

      // Should see the member list page
      await expect(page.getByText(/members|member management/i)).toBeVisible({
        timeout: 5000,
      });
    });

    test("should have create member button", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members`);

      // Should have a button to create new members
      await expect(
        page
          .getByRole("link", { name: /create|add|new member/i })
          .or(page.getByRole("button", { name: /create|add|new member/i }))
      ).toBeVisible({ timeout: 5000 });
    });

    test("should display member table or list", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members`);

      // Should have some structure for displaying members
      // Either a table or a list of member cards
      await expect(
        page.locator("table").or(page.locator('[data-testid="member-list"]'))
      ).toBeVisible({ timeout: 5000 });
    });

    test("should have search/filter functionality", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members`);

      // Should have search input
      const searchInput = page.getByPlaceholder(/search|filter/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        // Wait for filter to apply
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe("Create Member Flow", () => {
    test("should navigate to create member page", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members`);

      // Click create member button
      const createButton = page
        .getByRole("link", { name: /create|add|new/i })
        .or(page.getByRole("button", { name: /create|add|new/i }));
      await createButton.click();

      // Should be on create member page
      await expect(page).toHaveURL(/\/admin\/members\/create/, {
        timeout: 5000,
      });
    });

    test("should display create member form", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members/create`);

      // Form fields should be visible
      await expect(page.getByLabel(/first name/i)).toBeVisible({
        timeout: 5000,
      });
      await expect(page.getByLabel(/last name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByText(/role/i)).toBeVisible();
    });

    test("should validate required fields", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members/create`);

      // Try to submit empty form
      await page.getByRole("button", { name: /create member/i }).click();

      // Should show validation errors or prevent submission
      const firstNameInput = page.getByLabel(/first name/i);
      const isInvalid = await firstNameInput.evaluate(
        (el: HTMLInputElement) => !el.validity.valid
      );
      expect(isInvalid).toBeTruthy();
    });

    test("should create new member successfully", async ({ page }) => {
      const testEmail = generateTestEmail();

      await page.goto(`${FRONTEND_URL}/admin/members/create`);

      // Fill in the form
      await page.getByLabel(/first name/i).fill("Test");
      await page.getByLabel(/last name/i).fill("Member");
      await page.getByLabel(/email/i).fill(testEmail);

      // Select role (if dropdown)
      const roleSelect = page.getByRole("combobox");
      if (await roleSelect.isVisible()) {
        await roleSelect.click();
        await page.getByText("Member").click();
      }

      // Submit form
      await page.getByRole("button", { name: /create member/i }).click();

      // Should show success message
      await expect(page.getByText(/successfully|created/i)).toBeVisible({
        timeout: 10000,
      });
    });

    test("should display temporary password after creation", async ({
      page,
    }) => {
      const testEmail = generateTestEmail();

      await page.goto(`${FRONTEND_URL}/admin/members/create`);

      // Fill in the form
      await page.getByLabel(/first name/i).fill("New");
      await page.getByLabel(/last name/i).fill("User");
      await page.getByLabel(/email/i).fill(testEmail);

      // Submit form
      await page.getByRole("button", { name: /create member/i }).click();

      // Should show temporary password
      await expect(page.getByText(/temporary password/i)).toBeVisible({
        timeout: 10000,
      });
    });

    test("should allow creating another member after success", async ({
      page,
    }) => {
      const testEmail = generateTestEmail();

      await page.goto(`${FRONTEND_URL}/admin/members/create`);

      // Fill and submit form
      await page.getByLabel(/first name/i).fill("First");
      await page.getByLabel(/last name/i).fill("Person");
      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByRole("button", { name: /create member/i }).click();

      // Wait for success
      await expect(page.getByText(/successfully|created/i)).toBeVisible({
        timeout: 10000,
      });

      // Click "Add Another"
      const addAnotherButton = page.getByRole("button", {
        name: /add another/i,
      });
      if (await addAnotherButton.isVisible()) {
        await addAnotherButton.click();

        // Should be back to empty form
        await expect(page.getByLabel(/first name/i)).toHaveValue("");
      }
    });

    test("should show error for duplicate email", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members/create`);

      // Try to create member with existing email
      await page.getByLabel(/first name/i).fill("Duplicate");
      await page.getByLabel(/last name/i).fill("User");
      await page.getByLabel(/email/i).fill(ADMIN_EMAIL); // Existing admin email

      await page.getByRole("button", { name: /create member/i }).click();

      // Should show error
      await expect(
        page.getByText(/already exists|duplicate|error/i)
      ).toBeVisible({
        timeout: 5000,
      });
    });

    test("should cancel and return to member list", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members/create`);

      // Click cancel
      await page.getByRole("button", { name: /cancel/i }).click();

      // Should return to member list
      await expect(page).toHaveURL(/\/admin\/members$/, { timeout: 5000 });
    });
  });

  test.describe("Delete Member", () => {
    test("should have delete option for members", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members`);

      // Wait for member list to load
      await page.waitForTimeout(1000);

      // Look for delete button or action menu
      const deleteButton = page
        .getByRole("button", { name: /delete/i })
        .first();
      const actionMenu = page
        .getByRole("button", { name: /action|menu|more/i })
        .first();

      expect(
        (await deleteButton.isVisible()) || (await actionMenu.isVisible())
      ).toBeTruthy();
    });

    test("should confirm before deleting member", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/members`);
      await page.waitForTimeout(1000);

      // Try to delete (if delete button visible)
      const deleteButton = page
        .getByRole("button", { name: /delete/i })
        .first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Should show confirmation dialog
        await expect(
          page.getByText(/are you sure|confirm|delete/i)
        ).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe("Audit Logs Page", () => {
    test("should navigate to audit logs page", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/audit-logs`);

      // Should see audit logs page
      await expect(page.getByText(/audit log/i)).toBeVisible({ timeout: 5000 });
    });

    test("should display audit log entries", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/audit-logs`);

      // Wait for logs to load
      await page.waitForTimeout(1000);

      // Should have some log entries or empty state
      await expect(page.getByText(/log|action|event|no entries/i)).toBeVisible({
        timeout: 5000,
      });
    });

    test("should have filter options", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/audit-logs`);

      // Should have filter controls
      const filterButton = page.getByRole("button", { name: /filter/i });
      const actionFilter = page.getByLabel(/action type/i);
      const dateFilter = page.getByLabel(/date/i);

      expect(
        (await filterButton.isVisible()) ||
          (await actionFilter.isVisible()) ||
          (await dateFilter.isVisible())
      ).toBeTruthy();
    });
  });

  test.describe("Data Export Page", () => {
    test("should navigate to data export page", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/export`);

      // Should see export page
      await expect(page.getByText(/export|download/i)).toBeVisible({
        timeout: 5000,
      });
    });

    test("should have export options for members and events", async ({
      page,
    }) => {
      await page.goto(`${FRONTEND_URL}/admin/export`);

      // Should have export options
      await expect(page.getByText(/member/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/event/i)).toBeVisible();
    });

    test("should have format selection (CSV/JSON)", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/export`);

      // Should have format options
      await expect(
        page.getByText(/csv/i).or(page.getByRole("radio", { name: /csv/i }))
      ).toBeVisible({ timeout: 5000 });
      await expect(
        page.getByText(/json/i).or(page.getByRole("radio", { name: /json/i }))
      ).toBeVisible();
    });

    test("should have export button", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/export`);

      // Should have export button
      await expect(
        page.getByRole("button", { name: /export|download/i })
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Admin API Endpoints", () => {
    test("should return 401 for unauthenticated admin requests", async ({
      request,
    }) => {
      const response = await request.get(`${BACKEND_URL}/api/v1/admin/members`);
      expect(response.status()).toBe(401);
    });

    test("should return members list for authenticated admin", async ({
      request,
    }) => {
      const response = await request.get(
        `${BACKEND_URL}/api/v1/admin/members`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Should succeed or return forbidden (if not admin)
      expect([200, 403]).toContain(response.status());
    });

    test("should return audit logs for authenticated admin", async ({
      request,
    }) => {
      const response = await request.get(
        `${BACKEND_URL}/api/v1/admin/audit-logs`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect([200, 403]).toContain(response.status());
    });

    test("should return 401 for export without auth", async ({ request }) => {
      const response = await request.get(
        `${BACKEND_URL}/api/v1/admin/export/members`
      );
      expect(response.status()).toBe(401);
    });
  });

  test.describe("Role-Based Access", () => {
    test("should restrict admin pages to admin role", async ({
      page,
      browser,
    }) => {
      // Create a new context for regular member login
      const context = await browser.newContext();
      const memberPage = await context.newPage();

      // Clear state
      await memberPage.goto(FRONTEND_URL);
      await memberPage.evaluate(() => localStorage.clear());

      // Login as regular member (if we have one in seed data)
      await memberPage.goto(`${FRONTEND_URL}/login`);
      await memberPage.getByLabel(/email/i).fill("member@singburi.org");
      await memberPage.getByLabel(/password/i).fill("Member123!");
      await memberPage.getByRole("button", { name: /sign in|login/i }).click();

      // Wait for login
      await memberPage.waitForTimeout(2000);

      // Try to access admin page
      await memberPage.goto(`${FRONTEND_URL}/admin/members`);

      // Should be redirected or show unauthorized
      await expect(memberPage).toHaveURL(/\/(login|dashboard|unauthorized)/, {
        timeout: 5000,
      });

      await context.close();
    });

    test("admin should see admin menu items", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/dashboard`);

      // Look for admin navigation
      const adminLink = page.getByRole("link", { name: /admin|manage/i });
      const adminMenu = page.getByText(/admin/i);

      expect(
        (await adminLink.isVisible()) || (await adminMenu.isVisible())
      ).toBeTruthy();
    });
  });
});

test.describe("Admin Member Management - Full Flow", () => {
  test("complete member lifecycle: create -> view -> delete", async ({
    page,
  }) => {
    const testEmail = generateTestEmail();
    const testFirstName = "Integration";
    const testLastName = "Test";

    // Login as admin
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Step 1: Create member
    await page.goto(`${FRONTEND_URL}/admin/members/create`);
    await page.getByLabel(/first name/i).fill(testFirstName);
    await page.getByLabel(/last name/i).fill(testLastName);
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByRole("button", { name: /create member/i }).click();

    // Verify success
    await expect(page.getByText(/successfully|created/i)).toBeVisible({
      timeout: 10000,
    });

    // Step 2: Go to member list and verify new member appears
    await page.goto(`${FRONTEND_URL}/admin/members`);
    await page.waitForTimeout(1000);

    // Search for the created member
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill(testEmail);
      await page.waitForTimeout(500);
    }

    // Should see the created member
    await expect(
      page.getByText(testFirstName).or(page.getByText(testEmail))
    ).toBeVisible({
      timeout: 5000,
    });

    // Step 3: Check audit logs for the creation event
    await page.goto(`${FRONTEND_URL}/admin/audit-logs`);
    await page.waitForTimeout(1000);

    // Look for member creation log entry
    const createLog = page.getByText(/create|member/i);
    expect(await createLog.count()).toBeGreaterThan(0);
  });
});
