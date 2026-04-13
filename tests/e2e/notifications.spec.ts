/**
 * E2E Tests: Notification System
 *
 * Tests push notification settings, real-time notification UI,
 * prayer moderation flow, and notification indicators across app pages.
 *
 * Requires both backend (port 3000) and frontend (port 5173) running.
 */

import { test, expect, Page } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

const ADMIN_USER = {
  email: "admin@singburi-adventist.org",
  password: "Admin123!",
};

const MEMBER_USER = {
  email: "john.doe@example.com",
  password: "Member123!",
};

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/app\/dashboard|\/mfa-verify/, { timeout: 15000 });

  // Skip test if MFA is required
  if (page.url().includes("mfa-verify")) {
    test.skip(true, "MFA verification required — cannot proceed in E2E");
  }
}

// ─── Push Notification Settings ──────────────────────────────────

test.describe("Push Notification Settings", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, MEMBER_USER.email, MEMBER_USER.password);
  });

  test("should display notification settings on settings page", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/app/settings`);

    // Wait for the page heading to confirm we're on Settings
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /settings/i,
      { timeout: 15000 },
    );

    // "Notifications" section heading must be present
    await expect(page.getByText("Notifications", { exact: false })).toBeVisible(
      { timeout: 10000 },
    );
  });

  test("should show push and email notification cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/settings`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /settings/i,
      { timeout: 15000 },
    );

    // Settings page defaults to Profile tab — click Notifications tab first
    await page.getByRole("tab", { name: /notifications/i }).click();

    // Both notification cards should render
    await expect(
      page.getByText("Push Notifications", { exact: true }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText("Email Notifications", { exact: true }),
    ).toBeVisible();
  });

  test("should show notification category descriptions", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/settings`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /settings/i,
      { timeout: 15000 },
    );

    // Click Notifications tab first
    await page.getByRole("tab", { name: /notifications/i }).click();

    // Should contain notification-related text (event reminders, announcements, etc.)
    await expect(
      page
        .getByText(/event/i)
        .or(page.getByText(/announcement/i))
        .or(page.getByText(/message/i))
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─── Dashboard Notification Indicators ───────────────────────────

test.describe("Dashboard Notification Indicators", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, MEMBER_USER.email, MEMBER_USER.password);
  });

  test("should display dashboard with stat widgets", async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/dashboard/);

    // Dashboard should show stat cards including notification-related counts
    await expect(
      page.getByText(/announcement|event|message/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show unread messages widget", async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/dashboard/);

    await expect(page.getByText(/messages|unread/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("should show upcoming events widget", async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/dashboard/);

    await expect(
      page.getByText(/upcoming.*events|events/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show recent announcements widget", async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/dashboard/);

    await expect(page.getByText(/announcements/i).first()).toBeVisible({
      timeout: 10000,
    });
  });
});

// ─── Announcements Page ──────────────────────────────────────────

test.describe("Announcements Page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, MEMBER_USER.email, MEMBER_USER.password);
  });

  test("should display announcements list page", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/announcements`);

    await expect(page.getByRole("heading").first()).toContainText(
      /announcements/i,
      { timeout: 10000 },
    );
  });

  test("should show announcement cards or empty state", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/announcements`);
    await page.waitForLoadState("networkidle");

    // Either announcement cards (data-testid) or empty state text
    const hasContent = await page
      .locator("[data-testid='announcement-card']")
      .or(page.getByText(/no.*announcements/i))
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(hasContent).toBeTruthy();
  });
});

// ─── Messages Page ───────────────────────────────────────────────

test.describe("Messages Page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, MEMBER_USER.email, MEMBER_USER.password);
  });

  test("should display inbox with folder tabs", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/messages`);

    // Page should show inbox and sent tabs
    await expect(page.getByText(/inbox/i).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/sent/i).first()).toBeVisible();
  });

  test("should show compose button", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/messages`);

    await expect(
      page
        .getByRole("link", { name: /compose|new.*message/i })
        .or(page.getByRole("button", { name: /compose|new.*message/i })),
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─── Events Page ─────────────────────────────────────────────────

test.describe("Events Page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, MEMBER_USER.email, MEMBER_USER.password);
  });

  test("should display events list", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/events`);

    await expect(page.getByRole("heading").first()).toContainText(/events/i, {
      timeout: 10000,
    });
  });

  test("should show event cards or empty state", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/events`);
    await page.waitForLoadState("networkidle");

    // Events use <article> wrapping <Card data-testid="event-card">
    const hasContent = await page
      .locator("article")
      .or(page.locator("[data-testid='event-card']"))
      .or(page.getByText(/no.*events/i))
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(hasContent).toBeTruthy();
  });
});

// ─── Admin Prayer Moderation ─────────────────────────────────────

test.describe("Admin Prayer Moderation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
  });

  test("should display admin prayer management page", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/admin/prayer`);

    await expect(page.getByRole("heading").first()).toContainText(/prayer/i, {
      timeout: 10000,
    });
  });

  test("should show prayer requests or empty state", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/admin/prayer`);
    await page.waitForLoadState("networkidle");

    const hasContent = await page
      .getByText(/pending|approved|prayer.*request|no.*prayer|no.*requests/i)
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(hasContent).toBeTruthy();
  });
});

// ─── Admin Announcements Management ──────────────────────────────

test.describe("Admin Announcements Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
  });

  test("should display admin announcements page", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/admin/announcements`);

    await expect(page.getByRole("heading").first()).toContainText(
      /announcements/i,
      { timeout: 10000 },
    );
  });

  test("should show create announcement button", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/admin/announcements`);

    await expect(
      page
        .getByRole("button", { name: /create|new/i })
        .or(page.getByRole("link", { name: /create|new/i }))
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─── Member Prayer Page ──────────────────────────────────────────

test.describe("Member Prayer Page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, MEMBER_USER.email, MEMBER_USER.password);
  });

  test("should display prayer wall", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/prayer`);

    await expect(page.getByRole("heading").first()).toContainText(/prayer/i, {
      timeout: 10000,
    });
  });

  test("should show submit prayer request option", async ({ page }) => {
    await page.goto(`${BASE_URL}/app/prayer`);
    await page.waitForLoadState("networkidle");

    // On mobile: tabbed interface — click "Submit Request" tab first
    const submitTab = page.getByRole("tab", { name: /submit/i });
    if (await submitTab.isVisible().catch(() => false)) {
      await submitTab.click();
    }

    // Check for submit button or form
    const hasSubmit = await page
      .getByRole("button", { name: /submit prayer request/i })
      .or(page.locator("form"))
      .or(page.getByText(/submit prayer request/i))
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(hasSubmit).toBeTruthy();
  });
});

// ─── Sidebar Navigation ─────────────────────────────────────────

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, MEMBER_USER.email, MEMBER_USER.password);
  });

  test("should have navigation links to notification-relevant pages", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await page.waitForLoadState("networkidle");

    // Sidebar/nav should have links — check for links containing key route paths
    const navLinks = page.locator("a[href*='/app/']");
    await expect(navLinks.first()).toBeVisible({ timeout: 10000 });
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(3);
  });
});
