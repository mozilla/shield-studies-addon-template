/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(feature)" }]*/

class Feature {
  constructor() {}

  /**
   *
   *  - variation: study info about particular client study variation
   *  - reason: string of background.js install/startup/shutdown reason
   *
   */
  async configure(studyInfo) {


  }

  /* good practice to have the literal 'sending' be wrapped up */
  sendTelemetry(stringStringMap) {
    browser.study.sendTelemetry(stringStringMap);
  }

  /**
   * Called at end of study, and if the user disables the study or it gets uninstalled by other means.
   */
  async cleanup() {}

}

// make an instance of the feature class available to background.js
// construct only. will be configured after setup
window.feature = new Feature();
