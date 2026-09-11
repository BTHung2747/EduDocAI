import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { '@next/next': nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules, '@next/next/no-page-custom-font': 'off' },
  },
  { ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'] },
);
