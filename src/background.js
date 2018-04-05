/* eslint no-console:off */
/* global studySetup, Feature */

"use strict";

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

async function initiateStudy(reason) {
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
  new Feature(variation, reason);
}

/**
 * Fired when the extension is first installed, when the extension is updated
 * to a new version, and when the browser is updated to a new version.
 * @param details
 */
function handleInstalled(details) {
  console.log("The 'handleInstalled' event was fired.", details);
  initiateStudy(details.reason);
}

/**
 * Fired when a profile that has this extension installed first starts up.
 * This event is not fired when a private browsing/incognito profile is started.
 */
async function handleStartup(details) {
  console.log("The 'handleStartup' event was fired.", details);
  initiateStudy(details.reason);
}

// todo: on shutdown
// Run shutdown-related non-privileged code

browser.runtime.onStartup.addListener(handleStartup);
browser.runtime.onInstalled.addListener(handleInstalled);
