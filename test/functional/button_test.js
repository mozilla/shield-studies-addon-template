/* eslint-env node, mocha */

"use strict";

const assert = require("assert");
const utils = require("./utils");
const firefox = require("selenium-webdriver/firefox");
const Context = firefox.Context;
const webdriver = require("selenium-webdriver");
const By = webdriver.By;
const until = webdriver.until;

const promiseAddonButton = async driver => {
  const browserActionId = (await utils.addonWidgetId()) + "-browser-action";
  driver.setContext(Context.CHROME);
  return driver.wait(until.elementLocated(By.id(browserActionId)), 1000);
};

// Mocha can't use arrow functions as sometimes we need to call `this` and
// using an arrow function alters the binding of `this`.
// Hence we disable prefer-arrow-callback here so that mocha/no-mocha-arrows can
// be applied nicely.

describe("ui button (browserAction)", function() {
  // This gives Firefox time to start, and us a bit longer during some of the tests.
  this.timeout(10000);

  let driver;

  before(async function() {
    driver = await utils.setup.promiseSetupDriver(utils.FIREFOX_PREFERENCES);
    return utils.setup.installAddon(driver);
  });

  after(function() {
    return driver.quit();
  });

  it("exists", async function() {
    const button = await promiseAddonButton(driver);
    return assert(typeof button === "object");
  });

  it("the toolbar button label should be localized", async function() {
    const button = await promiseAddonButton(driver);
    const text = await button.getAttribute("tooltiptext");
    return assert.equal(text, "Visit Mozilla");
  });

  it("TBD responds to clicks", async() => {
    const button = await promiseAddonButton(driver);
    button.click();
    assert(true);
  });

  it("TBD sends correct telemetry", async() => {
    assert(true);
  });
});
