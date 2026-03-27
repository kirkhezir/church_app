// Frontend test setup
import '@testing-library/jest-dom';

// Set process.env values that replace import.meta.env via swcTransformer
process.env.VITE_API_URL = 'http://localhost:3000/api/v1';
process.env.MODE = 'test';
process.env.DEV = '';
process.env.PROD = '';
process.env.SSR = '';
process.env.VITE_SENTRY_ENABLED = '';
process.env.VITE_SENTRY_DSN = '';
process.env.VITE_WS_URL = 'http://localhost:3000';
import { TextDecoder, TextEncoder } from 'util';

// Polyfill TextEncoder/TextDecoder for jsdom test environment
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
