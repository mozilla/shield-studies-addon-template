/* eslint-env node */

const defaultConfig = {
  // Global options:
  sourceDir: "./src/",
  artifactsDir: "./dist/",
  ignoreFiles: [".DS_Store"],
  // Command options:
  build: {
    overwriteDest: true,
  },
  run: {
    firefox: process.env.FIREFOX_BINARY || "nightly",
    browserConsole: true,
    startUrl: ["about:debugging"],
    pref: [
      "shieldStudy.logLevel=info",
      "browser.ctrlTab.recentlyUsedOrder=false",
      "extensions.button-icon-preference_shield_mozilla_org.test.variationName=dogfooding",
    ],
  },
};

module.exports = defaultConfig;
