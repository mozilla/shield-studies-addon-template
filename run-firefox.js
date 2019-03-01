/* eslint-env node */
/* global browser */

// for unhandled promise rejection debugging
process.on("unhandledRejection", r => console.error(r)); // eslint-disable-line no-console

const utils = require("./test/functional/utils");

const STUDY_TYPE = process.env.STUDY_TYPE || "shield";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const EXPIRE_IN_SECONDS = process.env.EXPIRE_IN_SECONDS || false;
const EXPIRED = process.env.EXPIRED || false;
const BRANCH = process.env.BRANCH || "treatment";

const run = async studyType => {
  const driver = await utils.setupWebdriver.promiseSetupDriver(
    utils.FIREFOX_PREFERENCES,
  );
  const widgetId = utils.ui.makeWidgetId(
    "extensions.button-icon-preference_shield_mozilla_org.test.variationName",
  );
  /*
  await utils.preferences.set(
    driver,
    `extensions.${widgetId}.test.studyType`,
    STUDY_TYPE,
  );
  */
  if (EXPIRE_IN_SECONDS > 0) {
    // Set preference that simulates that the study will expire after EXPIRE_IN_SECONDS seconds
    const beginTime = Date.now();
    const msInOneDay = 60 * 60 * 24 * 1000;
    const expiresInDays = 7 * 5; // 5 weeks // Needs to be the same as in src/studySetup.js
    const firstRunTimestamp =
      beginTime - msInOneDay * expiresInDays + EXPIRE_IN_SECONDS * 1000;
    await utils.preferences.set(
      driver,
      `extensions.${widgetId}.test.firstRunTimestamp`,
      String(firstRunTimestamp),
    );
  }
  if (EXPIRED) {
    // Set preference that simulates that the study has already expired before the study starts
    await utils.preferences.set(
      driver,
      `extensions.${widgetId}.test.expired`,
      true,
    );
  }
  if (BRANCH) {
    // Set preference that forces the selection of a specific branch
    await utils.preferences.set(
      driver,
      `extensions.${widgetId}.test.variationName`,
      BRANCH,
    );
  }
  await utils.preferences.set(driver, `shieldStudy.logLevel`, LOG_LEVEL);
  await utils.preferences.set(
    driver,
    `browser.ctrlTab.recentlyUsedOrder`,
    false,
  );
  if (studyType === "pioneer") {
    await utils.setupWebdriver.installPioneerOptInAddon(driver);
  }
  await utils.setupWebdriver.installAddon(driver);
  await utils.ui.openBrowserConsole(driver);

  await driver.sleep(1000 * 60 * 60 * 24);
  driver.quit();
};

run(STUDY_TYPE);
