const defaultConfig = {
  // Global options:
  verbose: true,
  sourceDir: './src/',
  artifactsDir: './web-ext-artifacts/',
  ignoreFiles: [
    '.DS_Store',
  ],
  // Command options:
  build: {
    overwriteDest: true,
  },
  run: {
    firefox: 'nightly',
    browserConsole: true,
    startUrl: ['about:debugging'],
  },
};

module.exports = defaultConfig;
