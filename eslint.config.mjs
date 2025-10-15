import pluginNext from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...pluginNext,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": ["warn", { pluralComponents: true, checkFragmentShorthand: true }],
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default config;
