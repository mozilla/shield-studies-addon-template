/* eslint-env node */

const reporters = ["mocha", "coverage"];
if (process.env.COVERALLS_REPO_TOKEN) {
  reporters.push("coveralls");
}

module.exports = function(config) {
  config.set({
    singleRun: true,
    browsers: [
      // "Firefox",
      "FirefoxDeveloper",
      // "FirefoxAurora",
      // "FirefoxNightly",
    ],
    frameworks: ["mocha", "chai"],
    reporters,
    coverageReporter: {
      dir: "test/coverage",
      reporters: [
        {
          type: "lcov",
          subdir: "lcov",
        },
        {
          type: "html",
          subdir(browser) {
            // normalization process to keep a consistent browser name
            // across different OS
            return browser.toLowerCase().split(/[ /-]/)[0];
          },
        },
        { type: "text-summary" },
      ],
    },
    files: [
      "node_modules/sinon/pkg/sinon.js",
      "node_modules/sinon-chrome/bundle/sinon-chrome.min.js",
      "src/feature.js",
      "test/unit/*.spec.js",
    ],
    // preprocessors: { "src/feature.js": ["coverage"] },
    plugins: [
      "karma-chai",
      "karma-coveralls",
      "karma-coverage",
      "karma-firefox-launcher",
      "karma-mocha",
      "karma-mocha-reporter",
    ],
  });
};
