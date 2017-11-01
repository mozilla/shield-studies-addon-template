/* eslint-env node, mocha */

/* Purpose:
 *
 * Tests that are SPECIFIC TO THIS ADDON's FUNCTIONALITY
 */

// for unhandled promise rejection debugging
process.on("unhandledRejection", r => console.log(r)); // eslint-disable-line no-console

const assert = require("assert");
const utils = require("./utils");
const clipboardy = require("clipboardy");
const webdriver = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

const By = webdriver.By;
const Context = firefox.Context;
const until = webdriver.until;
const MAX_TIMES_TO_SHOW = 5; // this must match MAX_TIMES_TO_SHOW in bootstrap.js
const MOZILLA_ORG = "http://mozilla.org";

// TODO create new profile per test?
// then we can test with a clean profile every time


/* Part 1:  Test helpers */

async function postTestReset(driver) {
  // wait for the animation to end before running subsequent tests
  await utils.waitForAnimationEnd(driver);
  // close the popup
  await utils.closePanel(driver);
  // reset the counter pref to 0 so that the treatment is always shown
  // reset the addedBool pref
  await driver.executeAsyncScript((...args) => {
    const callback = args[args.length - 1];
    Components.utils.import("resource://gre/modules/Preferences.jsm");
    const COUNTER_PREF = "extensions.sharebuttonstudy.counter";
    const ADDED_BOOL_PREF = "extensions.sharebuttonstudy.addedBool";
    if (Preferences.has(COUNTER_PREF)) {
      Preferences.set(COUNTER_PREF, 0);
    }
    if (Preferences.has(ADDED_BOOL_PREF)) {
      Preferences.set(ADDED_BOOL_PREF, false);
    }
    callback();
  });
}


/* Part 2:  The Tests */

describe.only("notification bar", function() {
  // This gives Firefox time to start, and us a bit longer during some of the tests.
  this.timeout(15000);

  let driver;
  let addonId;

  before(async() => {
    driver = await utils.promiseSetupDriver();
    // await setTreatment(driver, "doorHangerAddToToolbar");

    // install the addon
    addonId = await utils.installAddon(driver);
    // add the share-button to the toolbar
    // await utils.addShareButton(driver);
  });

  after(async() => driver.quit());

  async function getNotification(driver) {
    return utils.getChromeElementBy.tagName(driver, "notification");
  }
  async function getFirstButton(driver) {
    return utils.getChromeElementBy.className(driver, "notification-button");
    // console.log(await nb.getLocation(), await nb.getAttribute("label"));
    // return nb;
  }

  async function getPings(driver) {
    const ar = ["shield-study", "shield-study-addon"];
    const out = {};
    out["shield-study"] = await utils.getTelemetryPings(driver, {type: "shield-study"});
    out["shield-study-addon"] = await utils.getTelemetryPings(driver, {type: "shield-study-addon"});
    return out;
  }


  /* Expected behaviour:

  - after install
  - get one of many treatments
  - shield agrees on which treatment. // TODO, make shield listen on global channel

  */

  // afterEach(async() => postTestReset(driver));


  // TODO, this could be a better test, but it's SOMETHING.
  it("'first button' does the right thing", async() => {
    const notice = await getNotification(driver);

    const noticeConfig = JSON.parse(await notice.getAttribute("data-study-config"));

    function expectedVoteAttributes(config, label) {
      const score = {
        "yes": "1",
        "not sure": "0",
        "no": "-1",
      };
      return {
        event: "answered",
        label,
        score: score[label],
        yesFirst: "" + Number(label == "yes"),
        promptType: config.promptType,
        branch: config.name,
        message: config.message,
      };
    }


    const nb = await getFirstButton(driver);
    const label = await nb.getAttribute("label");
    await nb.click();

    // const addons = await utils.allAddons(driver);
    // console.log(`addons ${addons}`);

    const pings = await getPings(driver);

    assert(true);

    // assert these things:
    // 1. addon isn't there.
    //   TODO broken b/c can't figure out utils.allAddons

    // 2.pings are correct (

    // 2a. order
    const states = pings["shield-study"].map(x => x.payload.data).reverse();
    const expected_states = [
      { study_state: "enter" },
      { study_state: "installed" },

      // note: it is a VOTED!
      { study_state: "ended-neutral", study_state_fullname: "voted" },
      { study_state: "exit" },
    ];

    assert.deepEqual(expected_states, states, "study states is wrong");

    // 2b. addon ping payloads
    const attributes = pings["shield-study-addon"].map(x => x.payload.data.attributes).reverse();

    var expected_addon_attributes = [
      { event: "prompted", promptType: "notificationBox-strings-1" },
      expectedVoteAttributes(noticeConfig, label),
    ];
    assert.deepEqual(expected_addon_attributes, attributes, "study-addon attributes are wrong");

    // 2c.  Normal parts of the payload are correct.
    const payloads = pings["shield-study-addon"].map(x => x.payload).reverse();
    assert.equal(payloads[0].branch, noticeConfig.name);

  });
});
