/* eslint-env node, mocha */

// for unhandled promise rejection debugging
process.on("unhandledRejection", r => console.log(r)); // eslint-disable-line no-console

const assert = require("assert");
const utils = require("./utils");

/* Part 1:  Utilities */

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

  // runs ONCE
  before(async() => {
    driver = await utils.setup.promiseSetupDriver(utils.FIREFOX_PREFERENCES);
    await utils.setup.installAddon(driver);
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

  describe("introduction / orientation bar", function() {
    it("exists, carries study config", async() => {
      const notice = await getNotification(driver);
      const noticeConfig = JSON.parse(
        await notice.getAttribute("data-study-config"),
      );
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

      const newPings = await utils.pings.getShieldPingsAfterTimestamp(
        driver,
        startTime,
      );
      const observed = utils.summarizePings(newPings);

      const expected = [
        [
          "shield-study-addon",
          {
            attributes: {
              event: "introduction-accept",
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
});
