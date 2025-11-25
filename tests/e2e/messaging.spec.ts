/**
 * E2E Tests: Messaging System
 *
 * Tests the complete messaging flow between members
 */

import { test, expect } from "@playwright/test";

// Test users from seed data
const MEMBER_USER = {
  email: "john.doe@example.com",
  password: "Member123!",
};

const ADMIN_USER = {
  email: "admin@singburi-adventist.org",
  password: "Admin123!",
};

// Helper function to login
async function login(page, email: string, password: string) {
  await page.goto("http://localhost:5173/login");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe("Messaging System E2E", () => {
  test.describe("Message List", () => {
    test("should display messages page with inbox and sent tabs", async ({
      page,
    }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);

      // Navigate to messages
      await page.goto("http://localhost:5173/messages");

      // Verify page header
      await expect(page.locator("h1")).toContainText("Messages");
      await expect(
        page.locator("text=Your private messages with church members")
      ).toBeVisible();

      // Verify tabs are present
      await expect(
        page.locator('[role="tab"]:has-text("Inbox")')
      ).toBeVisible();
      await expect(page.locator('[role="tab"]:has-text("Sent")')).toBeVisible();
    });

    test("should switch between inbox and sent folders", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/messages");

      // Click on Sent tab
      await page.click('[role="tab"]:has-text("Sent")');

      // Wait for content to update
      await page.waitForTimeout(500);

      // Click back on Inbox tab
      await page.click('[role="tab"]:has-text("Inbox")');

      // Wait for content to update
      await page.waitForTimeout(500);
    });

    test("should show compose button", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/messages");

      // Compose button should be visible
      await expect(page.locator("text=Compose")).toBeVisible();
    });
  });

  test.describe("Compose Message", () => {
    test("should navigate to compose page", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/messages");

      // Click compose button
      await page.click("text=Compose");

      // Should navigate to compose page
      await page.waitForURL(/\/messages\/compose/);

      // Verify compose form elements
      await expect(page.locator("text=New Message")).toBeVisible();
      await expect(page.locator("label:has-text('To')")).toBeVisible();
      await expect(page.locator("label:has-text('Subject')")).toBeVisible();
      await expect(page.locator("label:has-text('Message')")).toBeVisible();
    });

    test("should search for recipients", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/messages/compose");

      // Search for a recipient
      const recipientSearch = page.getByPlaceholder("Search for a member...");
      await recipientSearch.fill("Admin");

      // Wait for search results
      await page.waitForTimeout(500);

      // Should show search results dropdown
      await expect(page.locator("text=Admin User")).toBeVisible();
    });

    test("should select recipient from search results", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/messages/compose");

      // Search and select recipient
      const recipientSearch = page.getByPlaceholder("Search for a member...");
      await recipientSearch.fill("Admin");
      await page.waitForTimeout(500);

      // Click on the result
      await page.click("text=Admin User");

      // Search should be replaced with selected recipient
      await expect(page.locator("text=Admin User")).toBeVisible();
    });

    test("should send a message successfully", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/messages/compose");

      // Search and select recipient
      const recipientSearch = page.getByPlaceholder("Search for a member...");
      await recipientSearch.fill("Admin");
      await page.waitForTimeout(500);
      await page.click("button:has-text('Admin User')");

      // Fill subject
      await page.fill("input#subject", "E2E Test Message");

      // Fill message body
      await page.fill("textarea#body", "This is a test message from E2E test.");

      // Click send button
      await page.click('button:has-text("Send Message")');

      // Should redirect to sent folder
      await page.waitForURL(/\/messages\?folder=sent/);

      // Should show the sent message
      await expect(page.locator("text=E2E Test Message")).toBeVisible();
    });

    test("should validate required fields", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/messages/compose");

      // Try to send without filling fields - button should be disabled
      const sendButton = page.locator('button:has-text("Send Message")');
      await expect(sendButton).toBeDisabled();
    });

    test("should prefill recipient from URL parameter", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);

      // Get admin user ID first by going to member directory
      await page.goto("http://localhost:5173/members");
      await page.waitForSelector('[class*="card"]', { timeout: 10000 });

      // Click on Admin User card
      await page.click("text=Admin User");

      // Wait for profile page
      await page.waitForURL(/\/members\/[a-z0-9-]+/);

      // Click send message
      await page.click("text=Send Message");

      // Should navigate to compose with recipient prefilled
      await page.waitForURL(/\/messages\/compose\?to=/);

      // Recipient should be pre-selected
      await expect(page.locator("text=Admin User")).toBeVisible();
    });
  });

  test.describe("Message Detail", () => {
    test("should display message detail when clicked", async ({ page }) => {
      // First, ensure there's a message by sending one
      await login(page, ADMIN_USER.email, ADMIN_USER.password);
      await page.goto("http://localhost:5173/messages/compose");

      // Find and select John Doe as recipient
      const recipientSearch = page.getByPlaceholder("Search for a member...");
      await recipientSearch.fill("John");
      await page.waitForTimeout(500);

      // Try to click on John Doe if available
      const johnResult = page.locator("button:has-text('John')");
      if ((await johnResult.count()) > 0) {
        await johnResult.first().click();

        // Fill message details
        await page.fill("input#subject", "Test Reply Message");
        await page.fill(
          "textarea#body",
          "This is a test message to view in detail."
        );
        await page.click('button:has-text("Send Message")');

        // Wait for redirect
        await page.waitForURL(/\/messages/);
      }

      // Now login as John and view the message
      await page.goto("http://localhost:5173/login");
      await page
        .getByRole("textbox", { name: "Email" })
        .fill(MEMBER_USER.email);
      await page
        .getByRole("textbox", { name: "Password" })
        .fill(MEMBER_USER.password);
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });

      // Go to messages inbox
      await page.goto("http://localhost:5173/messages");

      // Click on a message if available
      const messageRows = page.locator('[class*="border-b"]');
      const count = await messageRows.count();

      if (count > 0) {
        await messageRows.first().click();

        // Should navigate to message detail
        await page.waitForURL(/\/messages\/[a-z0-9-]+/);

        // Should show back button
        await expect(page.locator("text=Back to Messages")).toBeVisible();
      }
    });

    test("should allow deleting a message", async ({ page }) => {
      await login(page, MEMBER_USER.email, MEMBER_USER.password);
      await page.goto("http://localhost:5173/messages");

      // Check if there are messages
      const messageRows = page.locator('[class*="border-b"]');
      const count = await messageRows.count();

      if (count > 0) {
        // Click on first message
        await messageRows.first().click();
        await page.waitForURL(/\/messages\/[a-z0-9-]+/);

        // Click delete button
        page.on("dialog", (dialog) => dialog.accept());
        await page.click("text=Delete");

        // Should redirect back to messages
        await page.waitForURL(/\/messages/);
      }
    });
  });

  test.describe("Authentication", () => {
    test("should redirect to login if not authenticated", async ({ page }) => {
      // Try to access messages without login
      await page.goto("http://localhost:5173/messages");

      // Should redirect to login
      await page.waitForURL(/\/login/);
    });

    test("should redirect compose page if not authenticated", async ({
      page,
    }) => {
      await page.goto("http://localhost:5173/messages/compose");
      await page.waitForURL(/\/login/);
    });
  });
});
