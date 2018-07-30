/* eslint-env node, mocha */

// for unhandled promise rejection debugging
process.on("unhandledRejection", r => console.error(r)); // eslint-disable-line no-console

const assert = require("assert");
const utils = require("./utils");

describe("basic shield utils integration", function() {
  // This gives Firefox time to start, and us a bit longer during some of the tests.
  this.timeout(25000);

  let driver;
  let beginTime;
  let addonId;

  // runs ONCE
  before(async() => {
    beginTime = Date.now();
    driver = await utils.setupWebdriver.promiseSetupDriver(
      utils.FIREFOX_PREFERENCES,
    );
    addonId = await utils.setupWebdriver.installAddon(driver);
  });

  after(async() => {
    driver.quit();
  });

  beforeEach(async() => {});
  afterEach(async() => {});

  describe("should have sent the expected initiation telemetry", function() {
    let studyPings;

    before(async() => {
      // allow our shield study add-on some time to send initial pings
      await driver.sleep(2000);
      // collect sent pings
      studyPings = await utils.telemetry.getShieldPingsAfterTimestamp(
        driver,
        beginTime,
      );
      // for debugging tests
      // console.log("Pings report: ", utils.telemetry.pingsReport(studyPings));
    });

    it("should have sent at least one shield telemetry ping", async() => {
      assert(studyPings.length > 0, "at least one shield telemetry ping");
    });

    it("sent expected telemetry", function() {
      // Telemetry:  order, and summary of pings is good.
      const filteredPings = studyPings.filter(
        ping => ping.type === "shield-study",
      );

      const observed = utils.telemetry.summarizePings(filteredPings);
      const expected = [
        [
          "shield-study",
          {
            study_state: "installed",
          },
        ],
        [
          "shield-study",
          {
            study_state: "enter",
          },
        ],
      ];
      assert.deepStrictEqual(expected, observed, "telemetry pings match");
    });
  });

  describe("should have sent exit telemetry upon uninstallation", function() {
    let studyPings;

    before(async() => {
      // we are only interested in pings from this point in time forward
      beginTime = Date.now();
      // uninstalling the add-on = opting out of the study = ending the study
      await utils.setupWebdriver.uninstallAddon(driver, addonId);
      // allow our shield study add-on some time to send exit pings
      await driver.sleep(2000);
      // collect sent pings
      studyPings = await utils.telemetry.getShieldPingsAfterTimestamp(
        driver,
        beginTime,
      );
      // for debugging tests
      // console.log("Pings report: ", utils.telemetry.pingsReport(studyPings));
    });

    it("should have sent at least one shield telemetry ping", async() => {
      assert(studyPings.length > 0, "at least one shield telemetry ping");
    });

    it("sent expected telemetry", function() {
      // Telemetry:  order, and summary of pings is good.
      const filteredPings = studyPings.filter(
        ping => ping.type === "shield-study",
      );

      const observed = utils.telemetry.summarizePings(filteredPings);
      const expected = [
        [
          "shield-study",
          {
            study_state: "exit",
          },
        ],
        [
          "shield-study",
          {
            study_state: "user-disable",
            study_state_fullname: "user-disable",
          },
        ],
      ];
      assert.deepStrictEqual(expected, observed, "telemetry pings match");
    });
  });
});

describe("setup of an already expired study should result in endStudy('expired')", function() {
  // This gives Firefox time to start, and us a bit longer during some of the tests.
  this.timeout(25000);

  let driver;
  let beginTime;

  // runs ONCE
  before(async() => {
    beginTime = Date.now();

    // Set preference that simulates that the study has been running for a very long time already (0 = started running 1970-01-01 00:00:00)
    const addonWidgetId = await utils.ui.addonWidgetId();
    const customPreferences = Object.assign({}, utils.FIREFOX_PREFERENCES);
    customPreferences[
      `extensions.${addonWidgetId}.test.firstRunTimestamp`
    ] = String(0);

    driver = await utils.setupWebdriver.promiseSetupDriver(customPreferences);

    await utils.setupWebdriver.installAddon(driver);
  });

  after(async() => {
    driver.quit();
  });

  beforeEach(async() => {});
  afterEach(async() => {});

  describe("should have sent the expected telemetry", function() {
    let studyPings;

    before(async() => {
      // allow our shield study add-on some time to send initial pings
      await driver.sleep(2000);
      // collect sent pings
      studyPings = await utils.telemetry.getShieldPingsAfterTimestamp(
        driver,
        beginTime,
      );
      // for debugging tests
      // console.log("Pings report: ", utils.telemetry.pingsReport(studyPings));
    });

    it("sent expected telemetry", function() {
      // Telemetry:  order, and summary of pings is good.
      const filteredPings = studyPings.filter(
        ping => ping.type === "shield-study",
      );

      const observed = utils.telemetry.summarizePings(filteredPings);
      const expected = [
        [
          "shield-study",
          {
            study_state: "exit",
          },
        ],
        [
          "shield-study",
          {
            study_state: "expired",
            study_state_fullname: "expired",
          },
        ],
      ];
      assert.deepStrictEqual(expected, observed, "telemetry pings match");
    });
  });
});

describe("setup of a study that expires within a few seconds should result in endStudy('expired') after a few seconds", function() {
  // This gives Firefox time to start, and us a bit longer during some of the tests.
  this.timeout(25000);

  let driver;
  let beginTime;

  // runs ONCE
  before(async() => {
    beginTime = Date.now();

    // Set preference that simulates that the study will expire after a few seconds
    const msInOneDay = 60 * 60 * 24 * 1000;
    const expiresInDays = 14; // Needs to be the same as in src/studySetup.js
    const firstRunTimestamp = beginTime - msInOneDay * expiresInDays + 8000;
    const addonWidgetId = await utils.ui.addonWidgetId();
    const customPreferences = Object.assign({}, utils.FIREFOX_PREFERENCES);
    customPreferences[
      `extensions.${addonWidgetId}.test.firstRunTimestamp`
    ] = String(firstRunTimestamp);

    driver = await utils.setupWebdriver.promiseSetupDriver(customPreferences);

    await utils.setupWebdriver.installAddon(driver);
  });

  after(async() => {
    driver.quit();
  });

  beforeEach(async() => {});
  afterEach(async() => {});

  describe("should not have sent exit telemetry before expiry", function() {
    let studyPings;

    before(async() => {
      // allow our shield study add-on some time to send initial pings
      await driver.sleep(2000);
      // collect sent pings
      studyPings = await utils.telemetry.getShieldPingsAfterTimestamp(
        driver,
        beginTime,
      );
      // for debugging tests
      // console.log("Pings report: ", utils.telemetry.pingsReport(studyPings));
    });

    it("sent expected telemetry", function() {
      // Telemetry:  order, and summary of pings is good.
      const filteredPings = studyPings.filter(
        ping => ping.type === "shield-study",
      );

      const observed = utils.telemetry.summarizePings(filteredPings);
      const expected = [];
      assert.deepStrictEqual(expected, observed, "telemetry pings match");
    });
  });

  describe("should have sent exit telemetry after expiry", function() {
    let studyPings;

    before(async() => {
      // allow our shield study add-on some time to send initial pings
      await driver.sleep(10000);
      // collect sent pings
      studyPings = await utils.telemetry.getShieldPingsAfterTimestamp(
        driver,
        beginTime,
      );
      // for debugging tests
      // console.log("Pings report: ", utils.telemetry.pingsReport(studyPings));
    });

    it("sent expected telemetry", function() {
      // Telemetry:  order, and summary of pings is good.
      const filteredPings = studyPings.filter(
        ping => ping.type === "shield-study",
      );

      const observed = utils.telemetry.summarizePings(filteredPings);
      const expected = [
        [
          "shield-study",
          {
            study_state: "exit",
          },
        ],
        [
          "shield-study",
          {
            study_state: "expired",
            study_state_fullname: "expired",
          },
        ],
      ];
      assert.deepStrictEqual(expected, observed, "telemetry pings match");
    });
  });
});
