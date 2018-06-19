/* eslint-env node */

const reporters = ["mocha", "istanbul"];
if (process.env.COVERALLS_REPO_TOKEN) {
  reporters.push("coveralls");
}

module.exports = function(config) {
  config.set({
    singleRun: true,
    browsers: [
      // "Firefox",
      // "FirefoxAurora", // Firefox Beta
      "FirefoxDeveloper",
      "FirefoxNightly",
    ],
    frameworks: ["mocha", "chai"],
    reporters,
    istanbulReporter: {
      dir: "test/coverage",
      reporters: [
        {
          type: "lcov",
          subdir: "lcov",
        },
        {
          type: "html",
        },
        {
          type: "text-summary",
        },
      ],
    },
    files: [
      "node_modules/sinon/pkg/sinon.js",
      "node_modules/sinon-chrome/bundle/sinon-chrome.min.js",
      "src/feature.js",
      "test/unit/*.spec.js",
    ],
    preprocessors: { "src/feature.js": ["babel"] },
    plugins: [
      "karma-babel-preprocessor",
      "karma-chai",
      "karma-coveralls",
      "karma-istanbuljs-reporter",
      "karma-firefox-launcher",
      "karma-mocha",
      "karma-mocha-reporter",
    ],
  });
};
