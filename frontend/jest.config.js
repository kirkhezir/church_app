/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/?(*.)+(spec|test).{ts,tsx}'],
  transform: {
    '^.+\\.tsx?$': '<rootDir>/tests/swcTransformer.cjs',
  },
  moduleNameMapper: {
    // i18n mock — alias and all relative depths
    '^@/i18n$': '<rootDir>/tests/__mocks__/i18n.tsx',
    '\\.\\./i18n$': '<rootDir>/tests/__mocks__/i18n.tsx',
    // useTheme mock — alias and all relative depths
    '^@/hooks/useTheme$': '<rootDir>/tests/__mocks__/useTheme.ts',
    '\\.\\./hooks/useTheme$': '<rootDir>/tests/__mocks__/useTheme.ts',
    // useAuth mock — alias and all relative depths
    '^@/hooks/useAuth$': '<rootDir>/tests/__mocks__/useAuth.ts',
    '\\.\\./hooks/useAuth$': '<rootDir>/tests/__mocks__/useAuth.ts',
    // RichTextEditor mock (tiptap)
    '^@/components/editor/RichTextEditor$': '<rootDir>/tests/__mocks__/RichTextEditor.tsx',
    '\\.\\./editor/RichTextEditor$': '<rootDir>/tests/__mocks__/RichTextEditor.tsx',
    // Generic alias
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^../api/apiClient$': '<rootDir>/tests/__mocks__/apiClient.ts',
    '^../../services/api/apiClient$': '<rootDir>/tests/__mocks__/apiClient.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
  // Increase timeout for userEvent tests
  testTimeout: 30000,
};
