/* eslint-env node */
/* eslint no-console:off */

// The geckodriver package downloads and installs geckodriver for us.
// We use it by requiring it.
require("geckodriver");
const cmd = require("selenium-webdriver/lib/command");
const firefox = require("selenium-webdriver/firefox");
const webdriver = require("selenium-webdriver");
const FxRunnerUtils = require("fx-runner/lib/utils");
const Fs = require("fs-extra");
const By = webdriver.By;
const Context = firefox.Context;
const until = webdriver.until;
const path = require("path");

// Note: Geckodriver already has quite a good set of default preferences
// for disabling various items.
// https://github.com/mozilla/geckodriver/blob/master/src/marionette.rs
const FIREFOX_PREFERENCES = {
  // Ensure e10s is turned on.
  "browser.tabs.remote.autostart": true,
  "browser.tabs.remote.autostart.1": true,
  "browser.tabs.remote.autostart.2": true,

  // Improve debugging using `browser toolbox`.
  "devtools.chrome.enabled": true,
  "devtools.debugger.remote-enabled": true,
  "devtools.debugger.prompt-connection": false,

  // Removing warning for `about:config`
  "general.warnOnAboutConfig": false,

  // Force variation for testing
  "extensions.button_icon_preference.variation": "kittens",

  /** WARNING: gecko webdriver sets many additional prefs at:
   * https://dxr.mozilla.org/mozilla-central/source/testing/geckodriver/src/prefs.rs
   *
   * In, particular, this DISABLES actual telemetry uploading
   * ("toolkit.telemetry.server", Pref::new("https://%(server)s/dummy/telemetry/")),
   *
   */
};

// useful if we need to test on a specific version of Firefox
async function promiseActualBinary(binary) {
  try {
    let normalizedBinary = await FxRunnerUtils.normalizeBinary(binary);
    normalizedBinary = path.resolve(normalizedBinary);
    await Fs.stat(normalizedBinary);
    return normalizedBinary;
  } catch (ex) {
    if (ex.code === "ENOENT") {
      throw new Error(`Could not find ${binary}`);
    }
    throw ex;
  }
}

/**
 * Uses process.env.FIREFOX_BINARY
 */
module.exports.promiseSetupDriver = async() => {
  const profile = new firefox.Profile();

  // TODO, allow 'actually send telemetry' here.
  Object.keys(FIREFOX_PREFERENCES).forEach(key => {
    profile.setPreference(key, FIREFOX_PREFERENCES[key]);
  });

  // TODO glind, allow config to re-use profile
  const options = new firefox.Options();
  options.setProfile(profile);

  const builder = new webdriver.Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options);

  const binaryLocation = await promiseActualBinary(
    process.env.FIREFOX_BINARY || "nightly",
  );

  // console.log(binaryLocation);
  await options.setBinary(new firefox.Binary(binaryLocation));
  const driver = await builder.build();
  // Firefox will be started up by now
  driver.setContext(Context.CHROME);

  return driver;
};

/* let's actually just make this a constant */
const MODIFIER_KEY = (function getModifierKey() {
  const modifierKey =
    process.platform === "darwin"
      ? webdriver.Key.COMMAND
      : webdriver.Key.CONTROL;
  return modifierKey;
})();

module.exports.MODIFIER_KEY = MODIFIER_KEY;

// TODO glind general wrapper for 'async with callback'?

/* Firefox UI helper functions */

// such as:  "social-share-button"
module.exports.addButtonFromCustomizePanel = async(driver, buttonId) =>
  driver.executeAsyncScript(callback => {
    // see https://dxr.mozilla.org/mozilla-central/rev/211d4dd61025c0a40caea7a54c9066e051bdde8c/browser/base/content/browser-social.js#193
    Components.utils.import("resource:///modules/CustomizableUI.jsm");
    CustomizableUI.addWidgetToArea(buttonId, CustomizableUI.AREA_NAVBAR);
    callback();
  });

module.exports.removeButtonFromNavbar = async(driver, buttonId) => {
  try {
    await driver.executeAsyncScript(callback => {
      Components.utils.import("resource:///modules/CustomizableUI.jsm");
      CustomizableUI.removeWidgetFromArea(buttonId);
      callback();
    });

    // TODO glind fix this, I think this is supposed to prove it's dead.
    const button = await module.exports.promiseAddonButton(driver);
    return button === null;
  } catch (e) {
    if (e.name === "TimeoutError") {
      return false;
    }
    throw e;
  }
};

const promiseManifest = async() => {
  const manifestJson = await Fs.readFile(
    path.resolve("src/manifest.json"),
    "utf8",
  );
  return JSON.parse(manifestJson);
};
module.exports.promiseManifest = promiseManifest;

/**
 * The widget id is used to identify add-on specific chrome elements. Examples:
 *  - Browser action - {addonWidgetId}-browser-action
 *  - Page action - {addonWidgetId}-page-action
 * Search for makeWidgetId(extension.id) in the Firefox source code for more examples.
 * @returns {Promise<*>}
 */
const addonWidgetId = async() => {
  /**
   * From firefox/browser/components/extensions/ExtensionPopups.jsm
   */
  function makeWidgetId(id) {
    id = id.toLowerCase();
    // FIXME: This allows for collisions.
    return id.replace(/[^a-z0-9_-]/g, "_");
  }

  const manifest = await promiseManifest();
  return makeWidgetId(manifest.applications.gecko.id);
};
module.exports.addonWidgetId = addonWidgetId;

module.exports.installAddon = async(driver, fileLocation) => {
  // references:
  //    https://bugzilla.mozilla.org/show_bug.cgi?id=1298025
  //    https://github.com/mozilla/geckodriver/releases/tag/v0.17.0
  fileLocation =
    fileLocation || path.join(process.cwd(), process.env.ADDON_ZIP);

  const executor = driver.getExecutor();
  executor.defineCommand(
    "installAddon",
    "POST",
    "/session/:sessionId/moz/addon/install",
  );
  const installCmd = new cmd.Command("installAddon");

  const session = await driver.getSession();
  installCmd.setParameters({
    sessionId: session.getId(),
    path: fileLocation,
    temporary: true,
  });
  await executor.execute(installCmd);
  console.log(`Add-on at ${fileLocation} installed`);
};

module.exports.uninstallAddon = async(driver, id) => {
  const executor = driver.getExecutor();
  executor.defineCommand(
    "uninstallAddon",
    "POST",
    "/session/:sessionId/moz/addon/uninstall",
  );
  const uninstallCmd = new cmd.Command("uninstallAddon");

  const session = await driver.getSession();
  uninstallCmd.setParameters({ sessionId: session.getId(), id });
  await executor.execute(uninstallCmd);
};

/* this is NOT WORKING FOR UNKNOWN HARD TO EXLAIN REASONS
=> Uncaught WebDriverError: InternalError: too much recursion
module.exports.allAddons = async(driver) => {
  // callback is how you get the return back from the script
  return driver.executeAsyncScript(async(callback,) => {
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    const L = await AddonManager.getAllAddons();
    callback(await L);
  });
};
*/

/** Returns array of pings of type `type` in reverse sorted order by timestamp
 * first element is most recent ping
 *
 * as seen in shield-study-addon-util's `utils.jsm`
 * options
 * - type:  string or array of ping types
 * - n:  positive integer. at most n pings.
 * - timestamp:  only pings after this timestamp.
 * - headersOnly: boolean, just the 'headers' for the pings, not the full bodies.
 */
const getTelemetryPings = async(driver, passedOptions) => {
  // callback is how you get the return back from the script
  return driver.executeAsyncScript(async(options, callback) => {
    let { type } = options;
    const { n, timestamp, headersOnly } = options;
    Components.utils.import("resource://gre/modules/TelemetryArchive.jsm");
    // {type, id, timestampCreated}
    let pings = await TelemetryArchive.promiseArchivedPingList();
    if (type) {
      if (!(type instanceof Array)) {
        type = [type]; // Array-ify if it's a string
      }
    }
    if (type) pings = pings.filter(p => type.includes(p.type));

    if (timestamp) pings = pings.filter(p => p.timestampCreated > timestamp);

    pings.sort((a, b) => b.timestampCreated - a.timestampCreated);
    if (n) pings = pings.slice(0, n);
    const pingData = headersOnly
      ? pings
      : pings.map(ping => TelemetryArchive.promiseArchivedPingById(ping.id));

    callback(await Promise.all(pingData));
  }, passedOptions);
};
module.exports.getTelemetryPings = getTelemetryPings;

const getShieldPingsAfterTimestamp = async(driver, ts) => {
  return getTelemetryPings(driver, {
    type: ["shield-study", "shield-study-addon"],
    timestamp: ts,
  });
};
module.exports.getShieldPingsAfterTimestamp = getShieldPingsAfterTimestamp;

module.exports.summarizePings = pings => {
  return pings.map(p => [p.payload.type, p.payload.data]);
};


// TODO glind, this interface feels janky
// this feels like it wants to be $ like.
// not obvious right now, moving on!
class getChromeElementBy {
  static async _get1(driver, method, selector) {
    driver.setContext(Context.CHROME);
    try {
      return await driver.wait(
        until.elementLocated(By[method](selector)),
        1000,
      );
    } catch (e) {
      // if there an error, the button was not found
      console.error(e);
      return null;
    }
  }
  static async id(driver, id) {
    return this._get1(driver, "id", id);
  }

  static async className(driver, className) {
    return this._get1(driver, "className", className);
  }

  static async tagName(driver, tagName) {
    return this._get1(driver, "tagName", tagName);
  }
}
module.exports.getChromeElementBy = getChromeElementBy;

module.exports.promiseUrlBar = driver => {
  driver.setContext(Context.CHROME);
  return driver.wait(until.elementLocated(By.id("urlbar")), 1000);
};

module.exports.takeScreenshot = async(
  driver,
  filepath = "./screenshot.png",
) => {
  try {
    const data = await driver.takeScreenshot();
    return await Fs.outputFile(filepath, data, "base64");
  } catch (screenshotError) {
    throw screenshotError;
  }
};

module.exports.gotoURL = async(driver, url) => {
  // navigate to a regular page
  driver.setContext(Context.CONTENT);
  await driver.get(url);
  driver.setContext(Context.CHROME);
};

class SearchError extends Error {
  constructor(condition) {
    const message = `Could not find ping satisfying condition: ${condition.toString()}`;
    super(message);
    this.message = message;
    this.name = "SearchError";
  }
}

module.exports.searchTelemetry = (conditionArray, telemetryArray) => {
  const resultingPings = [];
  for (const condition of conditionArray) {
    const index = telemetryArray.findIndex(ping => condition(ping));
    if (index === -1) {
      throw new SearchError(condition);
    }
    resultingPings.push(telemetryArray[index]);
  }
  return resultingPings;
};

// TODO glind, specific to share-button-study but useful to demo patterns.
// TODO glind, generalize, document, or destroy

// module.exports.copyUrlBar = async(driver) => {
//   const urlBar = await getChromeElementBy.id(driver,'urlbar');
//   const urlBar = await module.exports.promiseUrlBar(driver);
//   await urlBar.sendKeys(webdriver.Key.chord(MODIFIER_KEY, "A"));
//   await urlBar.sendKeys(webdriver.Key.chord(MODIFIER_KEY, "C"));
// };

// module.exports.testAnimation = async(driver) => {
//   const button = await module.exports.promiseAddonButton(driver);
//   if (button === null) { return { hasClass: false, hasColor: false }; }
//
//   const buttonClassString = await button.getAttribute("class");
//   const buttonColor = await button.getCssValue("background-color");
//
//   const hasClass = buttonClassString.split(" ").includes("social-share-button-on");
//   const hasColor = buttonColor.includes("43, 153, 255");
//   return { hasClass, hasColor };
// };

// module.exports.waitForClassAdded = async(driver) => {
//  try {
//    const animationTest = await driver.wait(async() => {
//      const { hasClass } = await module.exports.testAnimation(driver);
//      return hasClass;
//    }, 1000);
//    return animationTest;
//  } catch (e) {
//    if (e.name === "TimeoutError") { return null; }
//    throw (e);
//  }
// };
//
// module.exports.waitForAnimationEnd = async(driver) => {
//  try {
//    return await driver.wait(async() => {
//      const { hasClass, hasColor } = await module.exports.testAnimation(driver);
//      return !hasClass && !hasColor;
//    }, 1000);
//  } catch (e) {
//    if (e.name === "TimeoutError") { return null; }
//    throw (e);
//  }
// };

// module.exports.testPanel = async(driver, panelId) => {
//   driver.setContext(Context.CHROME);
//   try { // if we can't find the panel, return false
//     return await driver.wait(async() => {
//       // need to execute JS, since state is not an HTML attribute, it's a property
//       const panelState = await driver.executeAsyncScript((panelIdArg, callback) => {
//         const shareButtonPanel = window.document.getElementById(panelIdArg);
//         if (shareButtonPanel === null) {
//           callback(null);
//         } else {
//           const state = shareButtonPanel.state;
//           callback(state);
//         }
//       }, panelId);
//       return panelState === "open";
//     }, 1000);
//   } catch (e) {
//     if (e.name === "TimeoutError") { return null; }
//     throw e;
//   }
// };

// module.exports.closePanel = async(driver, target = null) => {
//   if (target !== null) {
//     target.sendKeys(webdriver.Key.ESCAPE);
//   } else {
//     const urlbar = await module.exports.promiseUrlBar(driver);
//     await urlbar.sendKeys(webdriver.Key.ESCAPE);
//   }
// };
