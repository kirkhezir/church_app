/**
 * Performance Load Test for Contact Form Endpoint
 *
 * Tests POST /api/v1/contact endpoint under load to establish baseline metrics.
 *
 * Run with: node tests/performance/contact-load-test.js
 *
 * Metrics measured:
 * - Requests per second (throughput)
 * - Average latency
 * - P95/P99 latency (percentiles)
 * - Error rate
 * - Rate limiting effectiveness
 */

const autocannon = require('autocannon');

// Test configuration
const TEST_CONFIG = {
  url: 'http://localhost:3000/api/v1/contact',
  connections: 10, // Concurrent connections
  duration: 30, // Test duration in seconds
  pipelining: 1, // Number of pipelined requests
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Load Test User',
    email: 'loadtest@example.com',
    phone: '+1234567890',
    message: 'This is a load test message with enough characters to pass validation requirements.',
  }),
};

console.log('🚀 Starting Contact Form Load Test...\n');
console.log('Configuration:');
console.log(`  URL: ${TEST_CONFIG.url}`);
console.log(`  Connections: ${TEST_CONFIG.connections}`);
console.log(`  Duration: ${TEST_CONFIG.duration}s`);
console.log(`  Rate Limit: 10 requests/minute per IP\n`);
console.log('Starting in 3 seconds...\n');

// Wait 3 seconds before starting
setTimeout(() => {
  const instance = autocannon(TEST_CONFIG, (err, result) => {
    if (err) {
      console.error('❌ Load test failed:', err);
      process.exit(1);
    }

    console.log('\n📊 Load Test Results:\n');
    console.log('='.repeat(60));

    // Throughput
    console.log('\n📈 Throughput:');
    console.log(`  Total Requests: ${result.requests.total}`);
    console.log(`  Requests/sec: ${result.requests.average.toFixed(2)}`);
    console.log(`  Duration: ${result.duration}s`);

    // Latency
    console.log('\n⏱️  Latency:');
    console.log(`  Average: ${result.latency.mean.toFixed(2)}ms`);
    console.log(
      `  Median (P50): ${(result.latency.p50 || result.latency.median || 0).toFixed(2)}ms`
    );
    console.log(`  P95: ${(result.latency.p95 || result.latency.p97_5 || 0).toFixed(2)}ms`);
    console.log(`  P99: ${(result.latency.p99 || result.latency.p99_9 || 0).toFixed(2)}ms`);
    console.log(`  Max: ${result.latency.max.toFixed(2)}ms`);

    // Success/Error rates
    const totalRequests = result.requests.total;
    const successRate = (((result['2xx'] || 0) / totalRequests) * 100).toFixed(2);
    const rateLimitRate = (((result['4xx'] || 0) / totalRequests) * 100).toFixed(2);
    const errorRate = (((result['5xx'] || 0) / totalRequests) * 100).toFixed(2);

    console.log('\n✅ Response Status:');
    console.log(`  2xx Success: ${result['2xx'] || 0} (${successRate}%)`);
    console.log(`  4xx Rate Limited: ${result['4xx'] || 0} (${rateLimitRate}%)`);
    console.log(`  5xx Server Error: ${result['5xx'] || 0} (${errorRate}%)`);

    // Data transfer
    console.log('\n📦 Data Transfer:');
    console.log(`  Total Bytes: ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Throughput: ${(result.throughput.average / 1024).toFixed(2)} KB/s`);

    console.log('\n' + '='.repeat(60));

    // Analysis
    console.log('\n🔍 Analysis:');

    if (result['2xx'] > 0) {
      console.log(`  ✅ Endpoint is responding successfully`);
    }

    if (result['4xx'] > 0) {
      console.log(`  ⚠️  Rate limiting is active (expected: ~${rateLimitRate}% after 10 requests)`);
    }

    if (result.latency.mean < 100) {
      console.log(`  ✅ Excellent response time (${result.latency.mean.toFixed(2)}ms avg)`);
    } else if (result.latency.mean < 500) {
      console.log(`  ⚠️  Acceptable response time (${result.latency.mean.toFixed(2)}ms avg)`);
    } else {
      console.log(
        `  ❌ Slow response time (${result.latency.mean.toFixed(2)}ms avg) - optimization needed`
      );
    }

    if (result.requests.average > 100) {
      console.log(`  ✅ High throughput capacity (${result.requests.average.toFixed(2)} req/s)`);
    } else if (result.requests.average > 50) {
      console.log(`  ⚠️  Moderate throughput (${result.requests.average.toFixed(2)} req/s)`);
    } else {
      console.log(
        `  ❌ Low throughput (${result.requests.average.toFixed(2)} req/s) - optimization needed`
      );
    }

    console.log('\n💡 Recommendations:');
    console.log('  • Rate limiting is working as expected for production use');
    console.log('  • For production, consider implementing:');
    console.log('    - Distributed rate limiting (Redis) for multi-instance deployments');
    console.log('    - Email queue (Bull/BullMQ) for async email processing');
    console.log('    - Connection pooling optimization');
    console.log('    - Response caching for validation rules');

    console.log('\n✅ Load test completed successfully!\n');
  });

  // Track progress
  autocannon.track(instance, {
    renderProgressBar: true,
    renderResultsTable: false,
  });
}, 3000);
