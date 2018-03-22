/* eslint-env node */

"use strict";

// All Mozilla specific rules and environments at:
// http://firefox-source-docs.mozilla.org/tools/lint/linters/eslint-plugin-mozilla.html

module.exports = {
  env: {
    es6: true,
  },
  extends: [
    "eslint:recommended",
    // list of rules at: https://dxr.mozilla.org/mozilla-central/source/tools/lint/eslint/eslint-plugin-mozilla/lib/configs/recommended.js
    "plugin:mozilla/recommended",
  ],
  overrides: [
    {
      files: "src/**",
      env: {
        browser: true,
        webextensions: true,
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: "module",
    ecmaFeatures: {
      jsx: false,
      experimentalObjectRestSpread: true,
    },
  },
  plugins: ["json", "mozilla"],
  root: true,
  rules: {
    "babel/new-cap": "off",
    "mozilla/no-aArgs": "warn",
    "mozilla/balanced-listeners": "off",
    "comma-dangle": ["error", "always-multiline"],
    eqeqeq: "error",
    indent: ["warn", 2, { SwitchCase: 1 }],
    "no-console": "warn",
    "no-var": "error",
    "no-shadow": "error",
    "no-unused-vars": "error",
    "prefer-const": "warn",
    "prefer-spread": "error",
    semi: ["error", "always"],
    "valid-jsdoc": "warn",
  },
};
