/* global FRECENCY_PREFS, ModelSynchronization, svmLoss, FrecencyOptimizer, AwesomeBarObserver */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(feature)" }]*/

class Feature {
  constructor() {
    this.branchConfigurations = {
      control: {
        training: false,
        validation: false,
        crazySeed: false,
      },
      dogfooding: {
        training: true,
        validation: true,
        crazySeed: false,
      },
      "dogfooding-crazy": {
        training: true,
        validation: true,
        crazySeed: true,
      },
      "non-dogfooding-training": {
        training: true,
        validation: false,
        crazySeed: false,
      },
      "non-dogfooding-validation": {
        training: false,
        validation: true,
        crazySeed: false,
      },
      "non-dogfooding-crazy-training": {
        training: true,
        validation: false,
        crazySeed: true,
      },
      "non-dogfooding-crazy-validation": {
        training: false,
        validation: true,
        crazySeed: true,
      },
    };
  }

  /**
   *
   *  - variation: study info about particular client study variation
   *  - reason: string of background.js install/startup/shutdown reason
   *
   * @param {Object} studyInfo Study info
   * @returns {Promise<*>} Promise that resolves after configure
   */
  async configure(studyInfo) {
    const synchronizer = new ModelSynchronization(studyInfo);
    const branchConfiguration = this.branchConfigurations[
      studyInfo.variation.name
    ];
    if (branchConfiguration.training) {
      const optimizer = new FrecencyOptimizer(synchronizer, svmLoss);
      this.awesomeBarObserver = new AwesomeBarObserver(
        optimizer.step.bind(optimizer),
      );
      this.awesomeBarObserver.start();
    }
  }

  /* good practice to have the literal 'sending' be wrapped up */
  async sendTelemetry(payload) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the ping - do not send any telemetry
      return false;
    }

    await browser.study.logger.debug([
      "Telemetry about to be validated using browser.study.validateJSON",
      payload,
    ]);
    const validationResult = await browser.study.validateJSON(payload, {
      type: "object",
      properties: {
        frecency_scores: {
          type: "array",
          items: {
            type: "number",
          },
        },
        loss: {
          type: "number",
        },
        model_version: {
          type: "number",
        },
        num_chars_typed: {
          type: "number",
          minimum: 0,
        },
        num_suggestions_displayed: {
          type: "number",
          minimum: 1,
        },
        rank_selected: {
          type: "number",
          minimum: 0,
        },
        bookmark_and_history_num_suggestions_displayed: {
          type: "number",
          minimum: 0,
        },
        bookmark_and_history_rank_selected: {
          type: "number",
          minimum: -1,
        },
        selected_style: {
          type: "string",
        },
        study_addon_version: {
          type: "string",
        },
        study_variation: {
          type: "string",
        },
        update: {
          type: "array",
          minItems: 22,
          maxItems: 22,
          items: {
            type: "number",
          },
        },
      },
      required: [
        "frecency_scores",
        "loss",
        "model_version",
        "num_chars_typed",
        "num_suggestions_displayed",
        "rank_selected",
        "bookmark_and_history_num_suggestions_displayed",
        "bookmark_and_history_rank_selected",
        "selected_style",
        "study_addon_version",
        "study_variation",
        "update",
      ],
    });
    if (!validationResult.valid) {
      await browser.study.logger.error([
        "Invalid telemetry payload",
        { payload, validationResult },
      ]);
      throw new Error("Invalid telemetry payload");
    }

    // Submit ping using the frecency-update schema/topic - will be picked up by the streaming ETL job
    await browser.telemetry.submitPing("frecency-update", payload, {
      addClientId: true,
    });

    // Also submit ping using study utils - allows for automatic querying of study data in re:dash
    const shieldStudyAddonPayload = {
      model_version: String(payload.model_version),
      frecency_scores: JSON.stringify(payload.frecency_scores),
      loss: String(payload.loss),
      update: JSON.stringify(payload.update),
      num_suggestions_displayed: String(payload.num_suggestions_displayed),
      rank_selected: String(payload.rank_selected),
      bookmark_and_history_num_suggestions_displayed: String(
        payload.bookmark_and_history_num_suggestions_displayed,
      ),
      bookmark_and_history_rank_selected: String(
        payload.bookmark_and_history_rank_selected,
      ),
      selected_style: String(payload.selected_style),
      num_chars_typed: String(payload.num_chars_typed),
      study_variation: String(payload.study_variation),
      study_addon_version: String(payload.study_addon_version),
    };
    await browser.study.sendTelemetry(shieldStudyAddonPayload);
    await browser.study.logger.log("Telemetry submitted:");
    await browser.study.logger.log({ payload, shieldStudyAddonPayload });
    return true;
  }

  /**
   * Called at end of study, and if the user disables the study or it gets uninstalled by other means.
   * @returns {Promise<*>} Promise that resolves after cleanup
   */
  async cleanup() {
    if (this.awesomeBarObserver) {
      await this.awesomeBarObserver.stop();
    }
    await browser.study.logger.log("Cleaning up study-specific prefs");
    const promises = [];
    for (let i = 0; i < FRECENCY_PREFS.length; i++) {
      promises.push(browser.experiments.prefs.clearUserPref(FRECENCY_PREFS[i]));
    }
    return Promise.all(promises);
  }
}

// make an instance of the feature class available to background.js
// construct only. will be configured after setup
window.feature = new Feature();
