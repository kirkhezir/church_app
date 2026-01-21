# Cache Busting and Auto-Update Fix

## Overview
This document explains the caching issues that were causing manual refresh requirements and the fixes implemented.

## Problems Identified

### 1. Aggressive Service Worker Caching
- **Issue**: Service worker cached static assets for 7 days
- **Impact**: Users saw old content even after new deployments
- **Symptoms**: Required hard refresh (Ctrl+Shift+R) to see updates

### 2. Stale-While-Revalidate Strategy
- **Issue**: Service worker served cached content first, updated in background
- **Impact**: Users always saw old version on first load after deployment

### 3. No Cache Versioning
- **Issue**: Service worker used static version number (v2)
- **Impact**: No automatic cache invalidation on new deployments

### 4. Missing Cache Headers
- **Issue**: Vercel used default caching for HTML/JS
- **Impact**: Browser and CDN caching prevented updates

## Solutions Implemented

### 1. Dynamic Cache Versioning ✅

**File**: `frontend/public/sw.js`

```javascript
// Before (Static version)
const CACHE_VERSION = 'v2';

// After (Build timestamp)
const BUILD_TIMESTAMP = '__BUILD_TIMESTAMP__';
const CACHE_VERSION = `v${BUILD_TIMESTAMP}`;
```

**Build Script**: `frontend/scripts/inject-sw-version.mjs`
- Automatically injects build timestamp during build
- Each deployment gets unique cache version
- Forces cache refresh automatically

### 2. Network-First Strategy for HTML ✅

**File**: `frontend/public/sw.js`

```javascript
// HTML pages - always network first to get latest version
if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
  return;
}
```

**Benefits**:
- Always fetches fresh HTML from network
- Falls back to cache only when offline
- Ensures users get latest app shell

### 3. Automatic Update Detection ✅

**File**: `frontend/src/main.tsx`

```javascript
// Check for updates every 60 seconds
setInterval(() => {
  registration.update();
}, 60000);

// Prompt user when update available
registration.addEventListener('updatefound', () => {
  // ... show update prompt
});
```

**Features**:
- Checks for SW updates every minute
- Prompts user to reload for updates
- Auto-reloads on SW activation

### 4. Proper Cache Headers ✅

**File**: `vercel.json` & `frontend/vercel.json`

```json
"headers": [
  {
    "source": "/sw.js",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
  },
  {
    "source": "/(.*).html",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
  },
  {
    "source": "/assets/(.*)",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
  }
]
```

**Strategy**:
- `max-age=0` for HTML/SW.js → Always check for updates
- `max-age=31536000, immutable` for hashed assets → Cache forever
- `must-revalidate` → Force revalidation when stale

### 5. Client-Side Cache Management ✅

**New Feature**: Manual cache clearing

```javascript
navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
```

**SW Message Handler**:
```javascript
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear all caches
  }
});
```

## Deployment Process Updates

### Updated Build Command

**Before**:
```json
"build": "tsc && vite build"
```

**After**:
```json
"build": "tsc && vite build && node scripts/inject-sw-version.mjs"
```

### What Happens on Deploy

1. **Build Process**:
   ```
   TypeScript compile → Vite build → Inject SW version → Deploy
   ```

2. **Cache Version**:
   ```
   Build timestamp: 1737464000000
   Cache version: v1737464000000
   ```

3. **Service Worker**:
   - New SW installed with new version
   - Old caches deleted automatically
   - Clients notified of update

4. **User Experience**:
   - Within 60 seconds, update detected
   - Prompt: "New version available! Reload to update?"
   - Click OK → Instant update

## Testing the Fix

### Verify Auto-Updates Work

1. **Make a visible change**:
   ```bash
   # Edit any frontend file
   git add .
   git commit -m "test: verify auto-update"
   git push
   ```

2. **Wait for deployment**:
   - Vercel builds (~2 minutes)
   - Service worker updates (~60 seconds)

3. **Check console**:
   ```
   Service Worker updated to version: v1737464000000
   New service worker activated, reloading page...
   ```

4. **User sees**:
   - Update prompt appears
   - Click "OK" to reload
   - New version loaded immediately

### Manual Testing

**Check Service Worker Version**:
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW version:', reg.active);
});
```

**Force Update Check**:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

**Clear All Caches**:
```javascript
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

## Branch Strategy Update

### From Development to Production

**Previous**: `001-full-stack-web` (development branch)
**New**: `main` (production branch)

**Reason for Change**:
- Standard practice: `main` = production
- Clearer deployment pipeline
- Better CI/CD integration

### Deployment Configuration

All configs updated to use `main`:
- ✅ `render.yaml` - Backend deployment
- ✅ `vercel.json` - Frontend deployment  
- ✅ `.github/workflows/*.yml` - CI/CD pipelines

## No More Hard Refresh Needed! 🎉

### What Changed for Users

**Before**:
- Deploy new version
- Users see old version
- Must press Ctrl+Shift+R (hard refresh)
- Still might see cached content

**After**:
- Deploy new version
- Within 60 seconds, user sees prompt
- Click "OK" → Instant update
- No manual refresh needed

### Fallback Options

If update doesn't appear:

1. **Wait 60 seconds** - Auto-check runs
2. **Reload page** - Triggers SW check
3. **Clear site data** - DevTools → Application → Clear storage

## Monitoring & Debugging

### Check Cache Version

```javascript
// Get current SW cache version
caches.keys().then(keys => console.log('Cache keys:', keys));
```

### Service Worker Lifecycle

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Installing:', reg.installing);
  console.log('Waiting:', reg.waiting);
  console.log('Active:', reg.active);
});
```

### Network vs Cache

Open DevTools → Network → Disable cache during testing

## Summary

| Feature | Before | After |
|---------|--------|-------|
| Cache Strategy | Stale-while-revalidate | Network-first |
| Cache Version | Static (v2) | Build timestamp |
| Update Check | Manual | Every 60 seconds |
| User Action | Hard refresh | Click prompt |
| HTML Cache | 7 days | 0 seconds |
| Asset Cache | Default | 1 year (immutable) |

## Related Files

- `frontend/public/sw.js` - Service worker (updated)
- `frontend/src/main.tsx` - SW registration (updated)
- `frontend/scripts/inject-sw-version.mjs` - Build script (new)
- `frontend/package.json` - Build command (updated)
- `vercel.json` - Cache headers (updated)
- `frontend/vercel.json` - Cache headers (updated)

---

**Result**: Users now see updates automatically within 60 seconds of deployment, with a simple reload prompt. No more manual hard refresh required! 🚀
