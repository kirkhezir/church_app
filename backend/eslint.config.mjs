import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      'tests/',
      'check-test-members.ts',
      'test-db-connection.ts',
      'prisma/',
      'prisma.config.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Adapter/infrastructure layers bridge dynamically-typed DB/external services.
  // Suppressing no-explicit-any here is an intentional architectural trade-off
  // until the repository interfaces are fully typed against Prisma-generated types.
  {
    files: [
      'src/infrastructure/**/*.ts',
      'src/domain/interfaces/**/*.ts',
      'src/application/useCases/**/*.ts',
      'src/presentation/controllers/**/*.ts',
      'src/presentation/middleware/**/*.ts',
      'src/presentation/routes/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    ...eslintPluginPrettierRecommended,
    rules: {
      ...eslintPluginPrettierRecommended.rules,
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  }
);
