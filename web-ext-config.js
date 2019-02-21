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
    firefox: process.env.FIREFOX_BINARY || "firefoxdeveloperedition",
    browserConsole: true,
    startUrl: ["about:debugging"],
    pref: [
      "shieldStudy.logLevel=All",
      "browser.ctrlTab.recentlyUsedOrder=false",
      "extensions.federated-learning-v2_shield_mozilla_org.test.variationName=dogfooding",
      "extensions.federated-learning-v2_shield_mozilla_org.test.modelUrlEndpoint=https://public-data.telemetry.mozilla.org/awesomebar_study/latest.json",
    ],
  },
};

module.exports = defaultConfig;
