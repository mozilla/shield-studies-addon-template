/* eslint-env node, mocha */

/* Purpose:
 *
 * Tests that are SPECIFIC TO THIS ADDON's FUNCTIONALITY
 */

// for unhandled promise rejection debugging
process.on("unhandledRejection", r => console.log(r)); // eslint-disable-line no-console

const assert = require("assert");
const utils = require("./utils");

// TODO create new profile per test?
// then we can test with a clean profile every time

/* Part 1:  Utilities */

async function getShieldPingsAfterTimestamp(driver, ts) {
  return utils.getTelemetryPings(driver, {type: ["shield-study", "shield-study-addon"], timestamp: ts});
}

function summarizePings(pings) { return pings.map(p => [p.payload.type, p.payload.data]); }


async function getNotification(driver) {
  return utils.getChromeElementBy.tagName(driver, "notification");
}

async function getFirstButton(driver) {
  return utils.getChromeElementBy.className(driver, "notification-button");
}


/* Part 2:  The Tests */

describe("basic functional tests", function() {
  // This gives Firefox time to start, and us a bit longer during some of the tests.
  this.timeout(15000);

  let driver;
  let pings;

  // runs ONCE
  before(async() => {
    const beginTime = Date.now();
    driver = await utils.promiseSetupDriver();
    // await setTreatment(driver, "doorHangerAddToToolbar");

    // install the addon
    await utils.installAddon(driver);
    // add the share-button to the toolbar
    // await utils.addShareButton(driver);
    // allow our shield study addon some time to send initial pings
    await driver.sleep(1000);
    // collect sent pings
    pings = await getShieldPingsAfterTimestamp(driver, beginTime);
    // console.log(pingsReport(pings).report);

  });

  after(async() => {
    driver.quit();
  });

  beforeEach(async() => {});
  afterEach(async() => {});

  /* Expected behaviour:

  - after install
  - get one of many treatments
  - shield agrees on which treatment.

  */

  // TODO glind, this is an incomplete set of tests

  it("should send shield telemetry pings", async() => {
    assert(pings.length > 0, "at least one shield telemetry ping");
  });

  it("at least one shield-study telemetry ping with study_state=installed", async() => {
    const foundPings = utils.searchTelemetry([
      ping => ping.type === "shield-study" && ping.payload.data.study_state === "installed",
    ], pings);
    assert(foundPings.length > 0, "at least one shield-study telemetry ping with study_state=installed");
  });

  it("at least one shield-study telemetry ping with study_state=enter", async() => {
    const foundPings = utils.searchTelemetry([
      ping => ping.type === "shield-study" && ping.payload.data.study_state === "enter",
    ], pings);
    assert(foundPings.length > 0, "at least one shield-study telemetry ping with study_state=enter");
  });

  it("telemetry: has entered, installed, shown", function() {
    // Telemetry:  order, and summary of pings is good.
    const observed = summarizePings(pings);
    const expected = [
      [
        "shield-study-addon",
        {
          "attributes": {
            "event": "introduction-shown",
          },
        },
      ],
      [
        "shield-study",
        {
          "study_state": "installed",
        },
      ],
      [
        "shield-study",
        {
          "study_state": "enter",
        },
      ],
    ];
    assert.deepEqual(expected, observed, "telemetry pings do not match");
  });

  describe("introduction / orientation bar", function() {
    it("exists, carries study config", async() => {
      const notice = await getNotification(driver);
      const noticeConfig = JSON.parse(await notice.getAttribute("data-study-config"));
      assert(noticeConfig.name);
      assert(noticeConfig.weight);
    });

    it("okay button looks fine.", async() => {
      const firstButton = await getFirstButton(driver);
      const label = await firstButton.getAttribute("label");
      assert.equal(label, "Thanks!");
    });

    it("clicking okay gives telemetry", async() => {
      const startTime = Date.now();
      const firstButton = await getFirstButton(driver);
      await firstButton.click();
      await driver.sleep(100);

      const newPings = await getShieldPingsAfterTimestamp(driver, startTime);
      const observed = summarizePings(newPings);

      const expected = [
        [
          "shield-study-addon",
          {
            "attributes": {
              "event": "introduction-accept",
            },
          },
        ],
      ];
      // this would add new telemetry
      assert.deepEqual(expected, observed, "telemetry pings do not match");

    });

    it("TBD click on NO uninstalls addon", async() => {
      assert(true);
    });
  });

  describe("ui button (browserAction)", function() {
    it("TBD exists", async() => {
      assert(true);
    });
    it("TBD responds to clicks", async() => {
      assert(true);
    });
    it("TBD sends correct telemetry", async() => {
      assert(true);
    });
  });
});
