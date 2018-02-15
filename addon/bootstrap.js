"use strict";

/* global config, studyUtils, Feature */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(startup|shutdown|install|uninstall)" }]*/

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Services",
  "resource://gre/modules/Services.jsm");

const STUDY = "button-icon-preference";

XPCOMUtils.defineLazyModuleGetter(this, "config",
  `resource://${STUDY}/Config.jsm`);
XPCOMUtils.defineLazyModuleGetter(this, "studyUtils",
  `resource://${STUDY}/StudyUtils.jsm`);
XPCOMUtils.defineLazyModuleGetter(this, "Feature",
  `resource://${STUDY}/lib/Feature.jsm`);

/* Example addon-specific module imports.  Remember to Unload during shutdown() below.

  // https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Using

  Ideally, put ALL your feature code in a Feature.jsm file,
  NOT in this bootstrap.js.

  XPCOMUtils.defineLazyModuleGetter(this, "SomeModule",
  `resource://${STUDY}/lib/SomeModule.jsm`);

  XPCOMUtils.defineLazyModuleGetter(this, "Preferences",
    "resource://gre/modules/Preferences.jsm");
*/

this.Bootstrap = {

  VARIATION_OVERRIDE_PREF: "extensions.button_icon_preference.variation",

  /**
   * @param addonData Array [ "id", "version", "installPath", "resourceURI", "instanceID", "webExtension" ]  bootstrap.js:48
   * @param reason
   * @returns {Promise<void>}
   */
  async startup(addonData, reason) {

    this.REASONS = studyUtils.REASONS;

    this.initLog();

    this.log.debug("startup", this.REASONS[reason] || reason);

    this.initStudyUtils(addonData.id, addonData.version);

    // choose and set variation
    const variation = await this.selectVariation();
    this.variation = variation;
    this.reason = reason;

    // Check if the user is eligible to run this study using the |isEligible|
    // function when the study is initialized (install or upgrade, the latter
    // being interpreted as a new install).
    if (reason === this.REASONS.ADDON_INSTALL || reason === this.REASONS.ADDON_UPGRADE) {
      //  telemetry "enter" ONCE
      studyUtils.firstSeen();
      const eligible = await config.isEligible();
      if (!eligible) {
        this.log.debug("User is ineligible, ending study.");
        // 1. uses config.endings.ineligible.url if any,
        // 2. sends UT for "ineligible"
        // 3. then uninstalls addon
        await studyUtils.endStudy({ reason: "ineligible" });
        return;
      }
    }

    /*
    * Adds the study to the active list of telemetry experiments,
    * and sends the "installed" telemetry ping if applicable
    */
    await studyUtils.startup({ reason });

    // log what the study variation and other info is.
    this.log.debug(`info ${JSON.stringify(studyUtils.info())}`);

    // initiate the chrome-privileged part of the study add-on
    this.feature = new Feature(variation, studyUtils, this.REASONS[reason], this.log);

    // if you have code to handle expiration / long-timers, it could go here
    /*
    if (this.feature.hasExpired()) {
      // Please note that the general study expiration should probably be taken care of by Normandy.
      await studyUtils.endStudy({ reason: "expired" });
      return;
    }
    */

    // IF your study has an embedded webExtension, start it.
    const { webExtension } = addonData;
    if (webExtension) {
      webExtension.startup().then(api => {
        const { browser } = api;
        /** spec for messages intended for Shield =>
         * {shield:true,msg=[info|endStudy|telemetry],data=data}
         */
        browser.runtime.onMessage.addListener(studyUtils.respondToWebExtensionMessage);
        // other browser.runtime.onMessage handlers for your addon, if any
      });
    }

    // start up the chrome-privileged part of the study
    this.feature.start();

  },

  /*
  * Create a new instance of the ConsoleAPI, so we can control
  * the maxLogLevel with Config.jsm.
  */
  initLog() {
    XPCOMUtils.defineLazyGetter(this, "log", () => {
      const ConsoleAPI =
        Cu.import("resource://gre/modules/Console.jsm", {}).ConsoleAPI;
      const consoleOptions = {
        maxLogLevel: config.log.bootstrap.level,
        prefix: "TPStudy",
      };
      return new ConsoleAPI(consoleOptions);
    });
  },

  initStudyUtils(id, version) {
    // validate study config
    studyUtils.setup({ ...config, addon: { id, version } });
    // TODO bdanforth: patch studyUtils to setLoggingLevel as part of setup method
    studyUtils.setLoggingLevel(config.log.studyUtils.level);
  },

  // choose the variation for this particular user, then set it.
  async selectVariation() {
    const variation = this.getVariationFromPref(config.weightedVariations) ||
      await studyUtils.deterministicVariation(config.weightedVariations);
    studyUtils.setVariation(variation);
    this.log.debug(`studyUtils has config and variation.name: ${variation.name}.
      Ready to send telemetry`);
    return variation;
  },

  // helper to let Dev or QA set the variation name
  getVariationFromPref(weightedVariations) {
    const name = Services.prefs.getCharPref(this.VARIATION_OVERRIDE_PREF, "");
    if (name !== "") {
      const variation = weightedVariations.filter(x => x.name === name)[0];
      if (!variation) {
        throw new Error(`about:config => ${this.VARIATION_OVERRIDE_PREF} set to ${name},
          but no variation with that name exists.`);
      }
      return variation;
    }
    return name;
  },

  /**
   * Shutdown needs to distinguish between USER-DISABLE and other
   * times that `endStudy` is called.
   *
   * studyUtils._isEnding means this is a '2nd shutdown'.
   */
  async shutdown(addonData, reason) {
    this.log.debug("shutdown", this.REASONS[reason] || reason);

    const isUninstall = (reason === this.REASONS.ADDON_UNINSTALL
      || reason === this.REASONS.ADDON_DISABLE);
    if (isUninstall) {
      this.log.debug("uninstall or disable");
    }

    if (isUninstall && !studyUtils._isEnding) {
      // we are the first 'uninstall' requestor => must be user action.
      this.log.debug("probably: user requested shutdown");
      studyUtils.endStudy({ reason: "user-disable" });
    }

    // normal shutdown, or 2nd uninstall request

    // If clause neccessary since study could end due to user ineligible or study expired, in which case feature is not initialized
    if (this.feature) {
      await this.feature.shutdown();
    }

    // Unload addon-specific modules
    Cu.unload(`resource://${STUDY}/lib/Feature.jsm`);
    Cu.unload(`resource://${STUDY}/Config.jsm`);
    Cu.unload(`resource://${STUDY}/StudyUtils.jsm`);
  },

  uninstall() {
    this.log.debug("uninstall", this.REASONS[this.reason] || this.reason);
  },

  install() {
    this.log.debug("install", this.REASONS[this.reason] || this.reason);
    // handle ADDON_UPGRADE (if needful) here
  },
};

// Expose bootstrap methods on the global
for (const methodName of ["install", "startup", "shutdown", "uninstall"]) {
  this[methodName] = Bootstrap[methodName].bind(Bootstrap);
}
