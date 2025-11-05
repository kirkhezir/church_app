/**
 * Mock for import.meta to handle Vite environment variables in Jest tests
 */
export const mockImportMeta = {
  env: {
    VITE_API_URL: 'http://localhost:3000/api/v1',
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false,
  },
};

// Make import.meta available globally for Jest
(global as any).import = {
  meta: mockImportMeta,
};
