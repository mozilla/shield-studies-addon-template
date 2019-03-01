/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "getStudySetup" }]*/

/**
 *  Overview:
 *
 *  - constructs a well-formatted `studySetup` for use by `browser.study.setup`
 *  - mostly declarative, except that some fields are set at runtime
 *    asynchronously.
 *
 *  Advanced features:
 *  - testing overrides from preferences
 *  - expiration time
 *  - some user defined endings.
 *  - study defined 'shouldAllowEnroll' logic.
 */

/** Base for studySetup, as used by `browser.study.setup`.
 *
 * Will be augmented by 'getStudySetup'
 */
const baseStudySetup = {
  // used for activeExperiments tagging (telemetryEnvironment.setActiveExperiment)
  activeExperimentName: browser.runtime.id,

  // use either "shield" or "pioneer" telemetry semantics and data pipelines
  studyType: "shield",

  // telemetry
  telemetry: {
    // Actually submit the pings to Telemetry. [default if omitted: false]
    send: true,
    // Marks pings with testing=true. Set flag to `true` for pings are meant to be seen by analysts [default if omitted: false]
    removeTestingFlag: true,
    // Keep an internal telemetry archive. Useful for verifying payloads of Pioneer studies without risking actually sending any unencrypted payloads [default if omitted: false]
    internalTelemetryArchive: false,
  },

  // endings with urls
  endings: {
    /** normandy-defined endings - https://firefox-source-docs.mozilla.org/toolkit/components/normandy/normandy/data-collection.html */
    "install-failure": {
      baseUrls: [],
    },
    "individual-opt-out": {
      baseUrls: [
        "https://qsurvey.mozilla.com/s3/Shield-Study-Example-Survey/?reason=individual-opt-out",
      ],
    },
    "general-opt-out": {
      baseUrls: [],
    },
    "recipe-not-seen": {
      baseUrls: [],
    },
    uninstalled: {
      baseUrls: [],
    },
    "uninstalled-sideload": {
      baseUrls: [],
    },
    unknown: {
      baseUrls: [],
    },
    /** study-utils-defined endings */
    "user-disable": {
      baseUrls: [
        "https://qsurvey.mozilla.com/s3/Shield-Study-Example-Survey/?reason=user-disable",
      ],
    },
    ineligible: {
      baseUrls: [],
    },
    expired: {
      baseUrls: [
        "https://qsurvey.mozilla.com/s3/Shield-Study-Example-Survey/?reason=expired",
      ],
    },
    /** study-defined endings */
    "used-often": {
      baseUrls: [
        "https://qsurvey.mozilla.com/s3/Shield-Study-Example-Survey/?reason=used-often",
      ],
      category: "ended-positive",
    },
    "a-non-url-opening-ending": {
      baseUrls: [],
      category: "ended-neutral",
    },
    "introduction-leave-study": {
      baseUrls: [
        "https://qsurvey.mozilla.com/s3/Shield-Study-Example-Survey/?reason=introduction-leave-study",
      ],
      category: "ended-negative",
    },
  },

  /**
   * Button study branches and sample weights
   * - test kittens vs. puppers if we can only have one.
   * - downweight lizards. Lizards is a 'poison' branch, meant to help control for novelty effect
   * - we want more puppers in our sample
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
    },
  ],

  // maximum time that the study should run, from the first run
  expire: {
    days: 14,
  },
};

async function isCurrentlyEligible(studySetup) {
  let allowed;
  const dataPermissions = await browser.study.getDataPermissions();
  if (studySetup.studyType === "shield") {
    allowed = dataPermissions.shield;
  }
  if (studySetup.studyType === "pioneer") {
    allowed = dataPermissions.pioneer;
  }
  // Users with private browsing on autostart are not eligible
  if (await browser.privacyContext.permanentPrivateBrowsing()) {
    await browser.study.logger.log("Permanent private browsing, exiting study");
    allowed = false;
  }
  return allowed;
}

/**
 * Determine, based on common and study-specific criteria, if enroll (first run)
 * should proceed.
 *
 * False values imply that *during first run only*, we should endStudy(`ineligible`)
 *
 * Add your own enrollment criteria as you see fit.
 *
 * (Guards against Normandy or other deployment mistakes or inadequacies).
 *
 * This implementation caches in local storage to speed up second run.
 *
 * @param {object} studySetup A complete study setup object
 * @returns {Promise<boolean>} answer An boolean answer about whether the user should be
 *       allowed to enroll in the study
 */
async function wasEligibleAtFirstRun(studySetup) {
  // Cached answer.  Used on 2nd run
  const localStorageResult = await browser.storage.local.get(
    "allowedEnrollOnFirstRun",
  );
  if (localStorageResult.allowedEnrollOnFirstRun === true) return true;

  // First run, we must calculate the answer.
  // If false, the study will endStudy with 'ineligible' during `setup`
  const allowed = await isCurrentlyEligible(studySetup);

  // cache the answer
  await browser.storage.local.set({ allowedEnrollOnFirstRun: allowed });
  return allowed;
}

/**
 * Augment declarative studySetup with any necessary async values
 *
 * @return {object} studySetup A complete study setup object
 */
async function getStudySetup() {
  // shallow copy
  const studySetup = Object.assign({}, baseStudySetup);

  studySetup.allowEnroll = await wasEligibleAtFirstRun(studySetup);

  // If the eligibility criterias are not dependent on the state of the first run only
  // but rather should be checked on every browser launch, skip the use
  // of wasEligibleAtFirstRun and instead use the below:
  // studySetup.allowEnroll = await wasEligibleAtFirstRun(studySetup);

  const testingOverrides = await browser.study.getTestingOverrides();
  studySetup.testing = {
    variationName: testingOverrides.variationName,
    firstRunTimestamp: testingOverrides.firstRunTimestamp,
    expired: testingOverrides.expired,
  };
  // TODO: Possible add testing override for studySetup.telemetry.internalTelemetryArchive

  // Set testing flag on shield-study-addon pings in case any testing override is set
  if (studySetup.testing.variationName !== null) {
    await browser.study.logger.log(
      `Note: The branch/variation is overridden for testing purposes ("${
        studySetup.testing.variationName
      }")`,
    );
    studySetup.telemetry.removeTestingFlag = false;
  }
  if (studySetup.testing.firstRunTimestamp !== null) {
    await browser.study.logger.log(
      `Note: The firstRunTimestamp property is set to "${JSON.stringify(
        studySetup.testing.firstRunTimestamp,
      )}" for testing purposes `,
    );
    studySetup.telemetry.removeTestingFlag = false;
  }
  if (studySetup.testing.expired !== null) {
    await browser.study.logger.log(
      `Note: The expired flag is set to "${JSON.stringify(
        studySetup.testing.expired,
      )}" for testing purposes `,
    );
    studySetup.telemetry.removeTestingFlag = false;
  }

  return studySetup;
}
