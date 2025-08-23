import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import n8nPlugin from 'eslint-plugin-n8n-nodes-base';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
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
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
      'n8n-nodes-base': n8nPlugin,
    },
    rules: {
      'prettier/prettier': ['warn', { singleQuote: true }],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'no-console': 'off',
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
];
