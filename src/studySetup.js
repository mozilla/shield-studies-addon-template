/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(studySetup)" }]*/

const studySetup = {
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
