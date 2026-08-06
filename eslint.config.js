import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**', '.vercel/**', 'public/**', '**/*.config.*']
  },
  ...eslintPluginAstro.configs['flat/recommended'],
  ...tseslint.configs['flat/recommended'].map((cfg) => ({
    ...cfg,
    files: ['**/*.{ts,tsx}']
  })),
  {
    files: ['**/*.astro'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      'astro/no-set-html-directive': 'off',
      'jsx-a11y/label-has-associated-control': 'off'
    }
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  }
];
