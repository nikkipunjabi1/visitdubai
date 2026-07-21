import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

// Next.js 16 / eslint-config-next 16 ship native flat configs — import them
// directly (no @eslint/eslintrc FlatCompat, which crashes with these arrays).
/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts'] },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
