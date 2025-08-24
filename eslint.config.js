import tsParser from '@typescript-eslint/parser';
import ts from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import n8n from 'eslint-plugin-n8n-nodes-base';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended, // ESLint JS defaults
  ...tseslint.configs.recommended, // TS rules
  eslintConfigPrettier, // disables conflicting rules with Prettier
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      prettier,
      'n8n-nodes-base': n8n,
    },
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
