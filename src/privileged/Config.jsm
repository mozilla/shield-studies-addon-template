"use strict";

/* to use:

- Recall this file has chrome privileges
- Cu.import in this file will work for any 'general firefox things' (Services,etc)
  but NOT for addon-specific libs
*/

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(config|EXPORTED_SYMBOLS)" }]*/
var EXPORTED_SYMBOLS = ["config"];

var config = {
  // required STUDY key
  study: {
    /** Required for studyUtils.setup():
     *
     * - studyName
     * - endings:
     *   - map of endingName: configuration
     * - telemetry
     *   - boolean send
     *   - boolean removeTestingFlag
     *
     * All other keys are optional.
     */

    // will be used activeExperiments tagging
    studyName: "buttonFeatureExperiment",

    /** **endings**
     * - keys indicate the 'endStudy' even that opens these.
     * - urls should be static (data) or external, because they have to
     *   survive uninstall
     * - If there is no key for an endStudy reason, no url will open.
     * - usually surveys, orientations, explanations
     */
    endings: {
      /** standard endings */
      "user-disable": {
        baseUrl: "http://www.example.com/?reason=user-disable",
      },
      ineligible: {
        baseUrl: "http://www.example.com/?reason=ineligible",
      },
      expired: {
        baseUrl: "http://www.example.com/?reason=expired",
      },
      /** User defined endings */
      "used-often": {
        baseUrl: "http://www.example.com/?reason=used-often",
        study_state: "ended-positive", // neutral is default
      },
      "a-non-url-opening-ending": {
        study_state: "ended-neutral",
        baseUrl: null,
      },
      "introduction-leave-study": {
        study_state: "ended-negative",
        baseUrl: "http://www.example.com/?reason=introduction-leave-study",
      },
    },
    telemetry: {
      send: true, // assumed false. Actually send pings?
      removeTestingFlag: false, // Marks pings to be discarded, set true for to have the pings processed in the pipeline
      // TODO "onInvalid": "throw"  // invalid packet for schema?  throw||log
    },
  },

  // required LOG key
  log: {
    // Fatal: 70, Error: 60, Warn: 50, Info: 40, Config: 30, Debug: 20, Trace: 10, All: -1,
    bootstrap: {
      // Console.jsm uses "debug", whereas Log.jsm uses "Debug", *sigh*
      level: "debug",
    },
    studyUtils: {
      level: "Trace",
    },
  },

  // Will run only during first install attempt
  async isEligible() {
    // get whatever prefs, addons, telemetry, anything!
    // Cu.import can see 'firefox things', but not package things.
    return true;
  },

  // Expiration checks should be implemented in a very reliable way by
  // the add-on since Normandy does not handle study expiration in a reliable manner
  async hasExpired() {
    return false;
  },

  /* Button study branches and sample weights
     - test kittens vs. puppies if we can only have one.
       - downweight lizards.  Lizards is a 'poison' branch, meant to
         help control for novelty effect
  */
  weightedVariations: [
    {
      name: "kittens",
      weight: 1.5,
    },
    {
      name: "puppers",
      weight: 1.5,
    },
    {
      name: "lizard",
      weight: 1,
    }, // we want more puppers in our sample
  ],

  /**
   * Change this preference to be able to test the add-on behavior in different study
   * variations/branches (or leave it unset to use the automatic assigning
   * of a study variation/branch from weightedVariations in Config.jsm)
   */
  variationOverridePreference: "extensions.button_icon_preference.variation",
};
