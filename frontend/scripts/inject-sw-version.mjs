/**
 * Build script to inject build timestamp into service worker
 * This enables automatic cache versioning on each deployment
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BUILD_TIMESTAMP = Date.now().toString();
const SW_PATH = join(process.cwd(), 'public', 'sw.js');

try {
  let swContent = readFileSync(SW_PATH, 'utf8');

  // Replace the placeholder with actual build timestamp
  swContent = swContent.replace('__BUILD_TIMESTAMP__', BUILD_TIMESTAMP);

  writeFileSync(SW_PATH, swContent);

  console.log(`✓ Service Worker updated with build timestamp: ${BUILD_TIMESTAMP}`);
} catch (error) {
  console.error('Failed to update service worker:', error);
  process.exit(1);
}
