"use strict";

/* global config, studyUtils, Feature */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(startup|shutdown|install|uninstall)" }]*/

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(
  this,
  "Services",
  "resource://gre/modules/Services.jsm",
);

const STUDY = "button-icon-preference";

XPCOMUtils.defineLazyModuleGetter(
  this,
  "config",
  `resource://${STUDY}/Config.jsm`,
);
XPCOMUtils.defineLazyModuleGetter(
  this,
  "studyUtils",
  `resource://${STUDY}/StudyUtils.jsm`,
);
XPCOMUtils.defineLazyModuleGetter(
  this,
  "Feature",
  `resource://${STUDY}/lib/Feature.jsm`,
);

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
  /**
   * Change this preference to test the add-on behavior in different study
   * variations/branches (or leave it unset to use the automatic assigning
   * of a study variation/branch from weightedVariations in Config.jsm)
   */
  VARIATION_OVERRIDE_PREF: "extensions.button_icon_preference.variation",

  /**
   * Use console as our logger until there is a log() method in studyUtils that we can rely on
   */
  log: console,

  /**
   * @param addonData Array [ "id", "version", "installPath", "resourceURI", "instanceID", "webExtension" ]
   * @param reason
   * @returns {Promise<void>}
   */
  async startup(addonData, reason) {
    this.log.debug("startup", studyUtils.REASONS[reason] || reason);

    this.initStudyUtils(addonData.id, addonData.version);

    // choose and set variation
    const variation = await this.selectVariation();
    this.variation = variation;

    // Check if the user is eligible to run this study using the |isEligible|
    // function when the study is initialized
    if (reason === studyUtils.REASONS.ADDON_INSTALL) {
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
    this.feature = new Feature(
      variation,
      studyUtils,
      studyUtils.REASONS[reason],
      this.log,
    );

    // Expiration checks should be implemented in a very reliable way by the add-on since Normandy does not handle study expiration in a reliable manner
    /*
    if (this.feature.hasExpired()) {
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
        browser.runtime.onMessage.addListener(
          studyUtils.respondToWebExtensionMessage,
        );
        // other browser.runtime.onMessage handlers for your addon, if any
      });
    }

    // start up the chrome-privileged part of the study
    this.feature.start();
  },

  initStudyUtils(id, version) {
    // validate study config
    studyUtils.setup({ ...config, addon: { id, version } });
    // TODO bdanforth: patch studyUtils to setLoggingLevel as part of setup method
    studyUtils.setLoggingLevel(config.log.studyUtils.level);
  },

  // choose the variation for this particular user, then set it.
  async selectVariation() {
    const variation =
      this.getVariationFromPref(config.weightedVariations) ||
      (await studyUtils.deterministicVariation(config.weightedVariations));
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
        throw new Error(`about:config => ${
          this.VARIATION_OVERRIDE_PREF
        } set to ${name},
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
    this.log.debug("shutdown", studyUtils.REASONS[reason] || reason);

    const isUninstall =
      reason === studyUtils.REASONS.ADDON_UNINSTALL ||
      reason === studyUtils.REASONS.ADDON_DISABLE;
    if (isUninstall) {
      this.log.debug("uninstall or disable");
    }

    if (isUninstall && !studyUtils._isEnding) {
      // we are the first 'uninstall' requestor => must be user action.
      this.log.debug("probably: user requested shutdown");
      studyUtils.endStudy({ reason: "user-disable" });
    }

    // normal shutdown, or 2nd uninstall request

    // Run shutdown-related code in Feature.jsm
    // We check if feature exists because it's possible the study is shutting down before it has instantiated the feature. Ex: if the user is ineligible or if the study has expired.
    if (this.feature) {
      await this.feature.shutdown();
    }

    // Unload addon-specific modules
    Cu.unload(`resource://${STUDY}/lib/Feature.jsm`);
    Cu.unload(`resource://${STUDY}/Config.jsm`);
    Cu.unload(`resource://${STUDY}/StudyUtils.jsm`);
  },

  uninstall(addonData, reason) {
    this.log.debug("uninstall", reason);
  },

  install(addonData, reason) {
    this.log.debug("install", reason);
    // handle ADDON_UPGRADE (if needful) here
  },
};

// Expose bootstrap methods on the global
for (const methodName of ["install", "startup", "shutdown", "uninstall"]) {
  this[methodName] = Bootstrap[methodName].bind(Bootstrap);
}
