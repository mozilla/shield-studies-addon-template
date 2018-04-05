/* eslint no-console:off */
/* global studySetup */

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
    if (this.timesClickedInSession === 1) {
      browser.study.telemetry({ event: "button-first-click-in-session" });
    }

    // telemetry EVERY CLICK
    browser.study.telemetry({
      event: "button-click",
      timesClickedInSession: "" + this.timesClickedInSession,
    });

    // webExtension-initiated ending for "used-often"
    //
    // - 3 timesClickedInSession in a session ends the study.
    // - see `../Config.jsm` for what happens during this ending.
    if (this.timesClickedInSession >= 3) {
      browser.study.endStudy({ reason: "used-often" });
    }
  }
}

class Study {
  // Should run only upon install event
  // Use web extension experiments to get whatever prefs, add-ons,
  // telemetry, anything necessary for the check
  static async isEligible() {
    // browser.prefs.get('my.favorite.pref');
    return true;
  }

  // Expiration checks should be implemented in a very reliable way by
  // the add-on since Normandy does not handle study expiration in a reliable manner
  static async hasExpired() {
    return false;
  }
}

async function initiateStudy() {
  // Set dynamic study configuration flags
  studySetup.eligible = await Study.isEligible();
  studySetup.expired = await Study.hasExpired();
  // Ensure we have configured study and are supposed to run our feature
  await browser.study.configure(studySetup);
  // Run the startup study checks
  await browser.study.startup();
  // Read the active study variation
  const { variation } = await browser.study.info();
  // Initiate our study-specific feature
  new BrowserActionButtonChoiceFeature(variation);
}

/**
 * Fired when the extension is first installed, when the extension is updated
 * to a new version, and when the browser is updated to a new version.
 * @param details
 */
function handleInstalled(details) {
  console.log(
    "The 'handleInstalled' event was fired.",
    details.reason,
    details,
  );
  initiateStudy();
}

/**
 * Fired when a profile that has this extension installed first starts up.
 * This event is not fired when a private browsing/incognito profile is started.
 */
async function handleStartup() {
  console.log("The 'handleStartup' event was fired.", arguments);
}

// todo: on shutdown
// Run shutdown-related non-privileged code

browser.runtime.onStartup.addListener(handleStartup);
browser.runtime.onInstalled.addListener(handleInstalled);
