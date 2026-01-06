# Performance Testing & Optimization Guide

## Overview

This document outlines performance testing strategies, benchmarks, and optimization techniques for the Church Management Application.

## Performance Targets

| Metric                         | Target  | Critical |
| ------------------------------ | ------- | -------- |
| First Contentful Paint (FCP)   | < 1.5s  | < 2.5s   |
| Largest Contentful Paint (LCP) | < 2.5s  | < 4.0s   |
| Time to Interactive (TTI)      | < 3.0s  | < 5.0s   |
| API Response Time (avg)        | < 200ms | < 500ms  |
| API Response Time (p95)        | < 500ms | < 1000ms |
| Bundle Size (gzipped)          | < 250KB | < 500KB  |

## Running Performance Tests

### Backend Load Tests

```bash
cd backend

# Run all performance tests
npm run test:perf

# Run specific test file
npm test -- --config=jest.performance.config.js tests/performance/analyticsLoad.test.ts
```

### Frontend Bundle Analysis

```bash
cd frontend

# Build with bundle analysis
npm run build -- --mode production

# View bundle sizes in dist folder
ls -la dist/assets/js/
```

## Backend Performance

### Database Query Optimization

#### Indexes

Ensure these indexes exist for optimal performance:

```sql
-- Members
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_deleted_at ON members(deleted_at);
CREATE INDEX idx_members_created_at ON members(created_at);
CREATE INDEX idx_members_last_login ON members(last_login_at);

-- Events
CREATE INDEX idx_events_start_date ON events(start_date_time);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_deleted_at ON events(deleted_at);

-- RSVPs
CREATE INDEX idx_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX idx_rsvps_member_id ON event_rsvps(member_id);
CREATE INDEX idx_rsvps_status ON event_rsvps(status);

-- Announcements
CREATE INDEX idx_announcements_published ON announcements(published_at);
CREATE INDEX idx_announcements_priority ON announcements(priority);

-- Messages
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_read ON messages(is_read);
```

#### Query Optimization Tips

1. **Use Prisma's select to limit fields**

   ```typescript
   const members = await prisma.member.findMany({
     select: {
       id: true,
       firstName: true,
       lastName: true,
       email: true,
     },
   });
   ```

2. **Use pagination for large lists**

   ```typescript
   const members = await prisma.member.findMany({
     skip: (page - 1) * pageSize,
     take: pageSize,
   });
   ```

3. **Use count queries efficiently**
   ```typescript
   const [members, total] = await Promise.all([
     prisma.member.findMany({ take: 10 }),
     prisma.member.count(),
   ]);
   ```

### API Response Caching

Implement Redis caching for frequently accessed data:

```typescript
// Example caching pattern
async function getCachedDashboard(userId: string) {
  const cacheKey = `dashboard:${userId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetchDashboardData(userId);
  await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min cache

  return data;
}
```

### Rate Limiting

Current rate limits:

- Authentication endpoints: 5 requests/minute
- General API: 100 requests/minute
- Heavy operations (reports): 10 requests/minute

## Frontend Performance

### Bundle Optimization

Current chunk strategy:

- `vendor-react`: React core libraries (~45KB gzipped)
- `vendor-ui`: Radix UI components (~30KB gzipped)
- `vendor-utils`: Utility libraries (~20KB gzipped)
- Dynamic imports for routes

### Code Splitting

Routes are lazy-loaded:

```typescript
const Dashboard = lazy(() => import("./pages/dashboard/DashboardPage"));
const Events = lazy(() => import("./pages/events/EventListPage"));
// etc.
```

### Image Optimization

1. Use WebP format for images
2. Implement lazy loading for images below the fold
3. Use appropriate image sizes (srcset)

```tsx
<img
  src={imageSrc}
  loading="lazy"
  srcSet={`${smallImage} 400w, ${mediumImage} 800w, ${largeImage} 1200w`}
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
/>
```

### Performance Monitoring

#### Web Vitals

Add Core Web Vitals monitoring:

```typescript
import { getCLS, getFID, getLCP, getFCP, getTTFB } from "web-vitals";

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getFCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### Sentry Performance

Enable Sentry performance monitoring:

```typescript
Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  integrations: [new BrowserTracing()],
});
```

## Load Testing

### Tools

1. **Artillery** - For API load testing
2. **k6** - For scripted load tests
3. **Lighthouse** - For frontend performance audits

### Sample Artillery Config

```yaml
# load-test.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 20
      name: "Sustained load"
    - duration: 60
      arrivalRate: 50
      name: "Peak load"

scenarios:
  - name: "Browse events"
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "member@test.com"
            password: "Test123!"
          capture:
            - json: "$.accessToken"
              as: "token"
      - get:
          url: "/api/v1/events"
          headers:
            Authorization: "Bearer {{ token }}"
      - get:
          url: "/api/v1/announcements"
          headers:
            Authorization: "Bearer {{ token }}"
```

Run with:

```bash
artillery run load-test.yml
```

## Performance Checklist

### Pre-Deployment

- [ ] Run lighthouse audit (score > 90)
- [ ] Run load tests (p95 < 1s)
- [ ] Check bundle size (< 500KB gzipped)
- [ ] Verify database indexes
- [ ] Test with simulated slow network (3G)
- [ ] Test with CPU throttling (4x slowdown)

### Monitoring

- [ ] Set up Sentry performance monitoring
- [ ] Configure alerting for slow responses
- [ ] Monitor database query times
- [ ] Track Core Web Vitals

## Troubleshooting

### Slow Database Queries

1. Check for missing indexes
2. Use `EXPLAIN ANALYZE` to understand query plans
3. Consider adding caching
4. Review N+1 query patterns

### Large Bundle Size

1. Run `npm run build -- --analyze`
2. Check for duplicate dependencies
3. Review dynamic imports
4. Consider tree-shaking imports

### Memory Issues

1. Monitor Node.js heap usage
2. Check for memory leaks in event listeners
3. Review large data processing operations
4. Implement pagination for large datasets

---

_Last updated: January 2026_
