/**
 * E2E Tests for Health Check Endpoints
 */

import { test, expect } from "@playwright/test";

test.describe("Health Check Endpoints", () => {
  const baseUrl =
    process.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:3000";

  test("GET /health returns basic health status", async ({ request }) => {
    const response = await request.get(`${baseUrl}/health`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("status", "ok");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("uptime");
    expect(data).toHaveProperty("environment");
  });

  test("GET /health/detailed returns detailed health status", async ({
    request,
  }) => {
    const response = await request.get(`${baseUrl}/health/detailed`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("components");
    expect(data.components).toHaveProperty("database");
    expect(data.components).toHaveProperty("memory");
    expect(data).toHaveProperty("process");
  });

  test("GET /health/ready returns readiness status", async ({ request }) => {
    const response = await request.get(`${baseUrl}/health/ready`);

    // Ready endpoint returns 200 if ready, 503 if not
    const statusCode = response.status();
    expect([200, 503]).toContain(statusCode);

    const data = await response.json();
    expect(data).toHaveProperty("ready");
  });

  test("GET /health/live returns liveness status", async ({ request }) => {
    const response = await request.get(`${baseUrl}/health/live`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("alive", true);
  });

  test("GET /health/metrics returns Prometheus metrics", async ({
    request,
  }) => {
    const response = await request.get(`${baseUrl}/health/metrics`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("uptime_seconds");
    expect(data).toHaveProperty("memory_heap_used_bytes");
    expect(data).toHaveProperty("memory_heap_total_bytes");
    expect(data).toHaveProperty("memory_rss_bytes");
  });

  test("Health check response time should be under 500ms", async ({
    request,
  }) => {
    const startTime = Date.now();
    const response = await request.get(`${baseUrl}/health`);
    const endTime = Date.now();

    expect(response.ok()).toBeTruthy();
    expect(endTime - startTime).toBeLessThan(500);
  });
});
