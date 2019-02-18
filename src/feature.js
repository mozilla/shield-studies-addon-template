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

    const synchronizer = new ModelSynchronization(studyInfo)
    const optimizer = new FrecencyOptimizer(synchronizer, svmLoss)

    browser.experiments.awesomeBar.onHistorySearch.addListener(optimizer.step.bind(optimizer))

  }

  /* good practice to have the literal 'sending' be wrapped up */
  async sendTelemetry(payload) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the ping - do not send any telemetry
      return;
    }

    await browser.study.logger.debug("Telemetry about to be validated using browser.study.validateJSON");
    const validationResult = await browser.study.validateJSON( payload,
      {
        "type": "object",
        "properties": {
          "frecency_scores": { "type": "array", "items": { "type": "number" } },
          "model_version": { "type": "number" },
          "loss": { "type": "number" },
          "num_chars_typed": { "type": "number" },
          "num_suggestions_displayed": { "type": "number" },
          "rank_selected": { "type": "number" },
          "study_variation": { "type": "string" },
          "update": { "type": "array", "items": { "type": "number" } }
        }
      }
    );
    if (!validationResult.valid) {
      await browser.study.logger.error(["Invalid telemetry payload", payload]);
      throw new Error(validationResult);
    }

    const stringStringMap = {
      model_version: String(payload.model_version),
      frecency_scores: JSON.stringify(payload.frecency_scores),
      loss: String(payload.loss),
      update: JSON.stringify(payload.update),
      num_suggestions_displayed: String(payload.num_suggestions_displayed),
      rank_selected: String(payload.rank_selected),
      num_chars_typed: String(payload.num_chars_typed),
      study_variation: String(payload.study_variation),
    };
    return browser.study.sendTelemetry(stringStringMap);
  }

  /**
   * Called at end of study, and if the user disables the study or it gets uninstalled by other means.
   */
  async cleanup() {

    await browser.study.logger.log("Cleaning up study-specific prefs");
    const promises = [];
    for (let i = 0; i < PREFS.length; i++) {
      promises.push(browser.experiments.prefs.clearUserPref(PREFS[i]))
    }
    return Promise.all(promises);

  }

}

// make an instance of the feature class available to background.js
// construct only. will be configured after setup
window.feature = new Feature();
