/* eslint-env node */

const defaultConfig = {
  // Global options:
  verbose: process.env.WEB_EXT_VERBOSE === 'false' ? false : true, // default to verbose mode unless the env var is set to negate this
  sourceDir: "./src/",
  artifactsDir: "./dist/",
  ignoreFiles: [".DS_Store"],
  // Command options:
  build: {
    overwriteDest: true,
  },
  run: {
    firefox: "nightly",
    browserConsole: true,
    startUrl: ["about:debugging"],
  },
};

module.exports = defaultConfig;
