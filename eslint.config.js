import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginPrettier from "eslint-plugin-prettier";

// Axios import ban — banned everywhere outside src/api/client.ts and tests.
// Exported so the companion `eslint.axios.config.js` can reuse it to enforce
// the rule across the full src/ tree via `npm run lint:axios` (the main
// `npm run lint` still limits itself to the Dashboard strict gate to avoid
// surfacing pre-existing unrelated lint debt).
export const axiosImportRestriction = {
  "@typescript-eslint/no-restricted-imports": [
    "error",
    {
      paths: [
        {
          name: "axios",
          message:
            'Import { apiClient } from "@/api/client" instead. Raw axios is forbidden outside src/api/client.ts.',
          allowTypeImports: true,
        },
      ],
    },
  ],
};

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
      // Legacy codebase gate: only Dashboard files are linted by `npm run lint`.
      // The axios import ban is enforced across the full tree via the separate
      // `npm run lint:axios` script (see eslint.axios.config.js).
      "src/**/*",
      "!src/components/Dashboard/**",
      "!src/pages/Dashboard/**",
    ],
  },
  // Dashboard-only: apply the axios import ban as part of the strict lint.
  {
    files: [
      "src/components/Dashboard/**/*.{ts,tsx,js,jsx}",
      "src/pages/Dashboard/**/*.{ts,tsx,js,jsx}",
    ],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: axiosImportRestriction,
  },
  // Allow axios inside the client module itself and in test files.
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
  // Existing: Dashboard-only strict lint rules (pre-existing dashboard gate).
  {
    files: [
      "src/components/Dashboard/**/*.{ts,tsx}",
      "src/pages/Dashboard/**/*.{ts,tsx}",
    ],
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
      prettier: pluginPrettier,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript for props

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // Prettier
      "prettier/prettier": "error",
    },
  },
);
