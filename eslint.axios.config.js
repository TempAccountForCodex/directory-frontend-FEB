import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { axiosImportRestriction } from "./eslint.config.js";

/**
 * Axios-only enforcement config.
 *
 * The main `eslint.config.js` keeps the legacy `src/**\/*` ignore gate so
 * `npm run lint` only lints Dashboard files (and doesn't surface unrelated
 * pre-existing lint debt across the codebase).
 *
 * This separate config enforces ONLY the axios import ban across the entire
 * `src/` tree. Run with:
 *
 *     npx eslint --config eslint.axios.config.js "src/**\/*.{ts,tsx,js,jsx}"
 *
 * or via `npm run lint:axios`.
 */
export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.min.js",
      "*.config.js",
      "*.config.ts",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    linterOptions: {
      // Pre-existing files contain many eslint-disable directives for rules
      // we don't load here; don't treat them as errors — we only enforce axios.
      reportUnusedDisableDirectives: false,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    rules: axiosImportRestriction,
  },
  {
    files: [
      "src/api/client.ts",
      "**/__tests__/**",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
);
