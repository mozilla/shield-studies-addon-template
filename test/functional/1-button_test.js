/* eslint-env node, mocha */

// for unhandled promise rejection debugging
process.on("unhandledRejection", r => console.error(r)); // eslint-disable-line no-console

const assert = require("assert");
const utils = require("./utils");
const firefox = require("selenium-webdriver/firefox");
const Context = firefox.Context;
const webdriver = require("selenium-webdriver");
const By = webdriver.By;
const until = webdriver.until;

/* Part 1:  Utilities */

async function promiseAddonButton(driver) {
  const browserActionId = (await utils.ui.addonWidgetId()) + "-browser-action";
  driver.setContext(Context.CHROME);
  return driver.wait(until.elementLocated(By.id(browserActionId)), 1000);
}

/* Part 2:  The Tests */

// TODO glind, this is an incomplete set of tests

describe("ui button (browserAction)", function() {
  // This gives Firefox time to start, and us a bit longer during some of the tests.
  this.timeout(15000);

  let driver;

  before(async() => {
    driver = await utils.setupWebdriver.promiseSetupDriver(
      utils.FIREFOX_PREFERENCES,
    );
    await utils.setupWebdriver.installAddon(driver);
    // allow our add-on some time to set up the initial ui
    await driver.sleep(1000);
  });

  after(async() => {
    driver.quit();
  });

  it("exists", async() => {
    const button = await promiseAddonButton(driver);
    return assert(typeof button === "object");
  });

  /*
  // inactivated since our template study sets the tooltip to the current study branch
  it("the toolbar button label should be localized", async() => {
    const button = await promiseAddonButton(driver);
    const text = await button.getAttribute("tooltiptext");
    return assert.equal(text, "Visit Mozilla");
  });
  */

  it("TBD responds to clicks", async() => {
    const button = await promiseAddonButton(driver);
    button.click();
    assert(true);
  });

  it("TBD sends correct telemetry", async() => {
    assert(true);
  });
});
