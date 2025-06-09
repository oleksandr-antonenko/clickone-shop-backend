// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'lf',
          parser: 'typescript',
          singleQuote: true,
          tabWidth: 2,
          printWidth: 80,
          bracketSpacing: false,
          trailingComma: 'es5',
        },
        {
          usePrettierrc: false,
        },
      ],
      "no-console": [
        "warn",
        {
          "allow": ["warn", "error"]
        }
      ],
      "import/order": [
        "off",
        {
          groups: [
            ["builtin", "external", "internal"],
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
        },
      ],
      'object-curly-spacing': ['error', 'never'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports':'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
);