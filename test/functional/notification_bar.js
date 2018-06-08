/* eslint-env node, mocha */

// for unhandled promise rejection debugging
process.on("unhandledRejection", r => console.error(r)); // eslint-disable-line no-console

const assert = require("assert");
const utils = require("./utils");

/* Part 1:  Utilities */

async function getNotification(driver) {
  return utils.ui.getChromeElementBy.tagName(driver, "notification");
}

async function getFirstButton(driver) {
  return utils.ui.getChromeElementBy.className(driver, "notification-button");
}

/* Part 2:  The Tests */

// TODO glind, this is an incomplete set of tests

describe("introduction / orientation bar", function() {
  // This gives Firefox time to start, and us a bit longer during some of the tests.
  this.timeout(15000);

  let driver;
  let beginTime;
  let studyPings;

  before(async() => {
    beginTime = Date.now();
    driver = await utils.setupWebdriver.promiseSetupDriver(
      utils.FIREFOX_PREFERENCES,
    );
    await utils.setupWebdriver.installAddon(driver);
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

  after(async() => {
    driver.quit();
  });

  it("should have sent one shield-study-addon telemetry ping with payload.data.attributes.event=onIntroductionShown", async() => {
    const filteredPings = studyPings.filter(
      ping =>
        ping.type === "shield-study-addon" &&
        ping.payload.data.attributes.event === "onIntroductionShown",
    );
    assert(
      filteredPings.length > 0,
      "at least one shield-study-addon telemetry ping with payload.data.attributes.event=onIntroductionShown",
    );
  });

  it("exists, carries study config", async() => {
    const notice = await getNotification(driver);
    assert(notice !== null);
    const noticeVariationName = await notice.getAttribute("variation-name");
    assert(noticeVariationName !== undefined);
    console.log("noticeVariationName", noticeVariationName);
    assert(noticeVariationName);
  });

  it("okay button looks fine.", async() => {
    const firstButton = await getFirstButton(driver);
    assert(firstButton !== null);
    const label = await firstButton.getAttribute("label");
    assert.equal(label, "Thanks!");
  });

  it("clicking okay gives telemetry", async() => {
    const startTime = Date.now();
    const firstButton = await getFirstButton(driver);
    await firstButton.click();
    await driver.sleep(100);

    const newPings = await utils.telemetry.getShieldPingsAfterTimestamp(
      driver,
      startTime,
    );
    const observed = utils.telemetry.summarizePings(newPings);

    const expected = [
      [
        "shield-study-addon",
        {
          attributes: {
            event: "onIntroductionAccept",
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
