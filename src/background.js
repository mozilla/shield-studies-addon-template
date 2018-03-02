/* eslint no-console:off */

"use strict";

class BrowserActionButtonChoiceFeature {
  /**
   * - set image, text, click handler (telemetry)
   */
  constructor(variation) {
    console.log(
      "Initializing BrowserActionButtonChoiceFeature:",
      variation.name,
    );
    this.timesClickedInSession = 0;

    // modify BrowserAction (button) ui for this particular {variation}
    console.log("path:", `icons/${variation.name}.svg`);
    // TODO: Running into an error "values is undefined" here
    browser.browserAction.setIcon({ path: `icons/${variation.name}.svg` });
    browser.browserAction.setTitle({ title: variation.name });
    browser.browserAction.onClicked.addListener(() => this.handleButtonClick());
    console.log("initialized");
  }

  /** handleButtonClick
   *
   * - instrument browserAction button clicks
   * - change label
   */
  handleButtonClick() {
    console.log("handleButtonClick");
    // note: doesn't persist across a session, unless you use localStorage or similar.
    this.timesClickedInSession += 1;
    console.log("got a click", this.timesClickedInSession);
    browser.browserAction.setBadgeText({
      text: this.timesClickedInSession.toString(),
    });

    // telemetry: FIRST CLICK
    if (this.timesClickedInSession == 1) {
      browser.shieldUtils.telemetry({ event: "button-first-click-in-session" });
    }

    // telemetry EVERY CLICK
    browser.shieldUtils.telemetry({
      event: "button-click",
      timesClickedInSession: "" + this.timesClickedInSession,
    });

    // webExtension-initiated ending for "used-often"
    //
    // - 3 timesClickedInSession in a session ends the study.
    // - see `../Config.jsm` for what happens during this ending.
    if (this.timesClickedInSession >= 3) {
      browser.shieldUtils.endStudy({ reason: "used-often" });
    }
  }
}

/**
 * CONFIGURE and INSTRUMENT the BrowserAction button for a specific variation
 *
 *  1. Request 'info' from the shieldUtils
 *  2. We only care about the `variation` key.
 *  3. initialize the feature, using our specific variation
 */
async function runOnce() {
  // ensure we have configured shieldUtils and are supposed to run our feature
  await browser.shieldUtils.bootstrapStudy();

  // get study variation
  const { variation } = await browser.shieldUtils.info();

  // initiate the chrome-privileged part of the study add-on
  await browser.feature.start(variation);

  // initiate the non-privileged part of the study add-on
  new BrowserActionButtonChoiceFeature(variation);
}

/**
 * Fired when a profile that has this extension installed first starts up.
 * This event is not fired when a private browsing/incognito profile is started.
 */
function handleStartup() {
  console.log("handleStartup", arguments);
}

browser.runtime.onStartup.addListener(handleStartup);

/**
 * Fired when the extension is first installed, when the extension is updated
 * to a new version, and when the browser is updated to a new version.
 * @param details
 */
function handleInstalled(details) {
  console.log("handleInstalled", details.reason, details);
}

browser.runtime.onInstalled.addListener(handleInstalled);

// todo: on shutdown
// Run shutdown-related non-priviliged code

// actually start
runOnce();
