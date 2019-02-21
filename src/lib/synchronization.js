/* global feature, PREFS */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(ModelSynchronization)" }]*/

const URL_ENDPOINT_HUMAN_SEED =
  "https://public-data.telemetry.mozilla.org/awesomebar_study_v2/human_seed/latest.json";
const URL_ENDPOINT_CRAZY_SEED =
  "https://public-data.telemetry.mozilla.org/awesomebar_study_v2/crazy_seed/latest.json";
const MINUTES_PER_ITERATION = 5; // Should be a dividor of 60

class ModelSynchronization {
  constructor(studyInfo) {
    this.iteration = -1;
    this.studyInfo = studyInfo;
    const branchConfiguration =
      feature.branchConfigurations[studyInfo.variation.name];
    if (branchConfiguration.validation) {
      this.fetchModel();
    }
  }

  msUntilNextIteration() {
    // Begin a new iteration every MINUTES_PER_ITERATION, starting from a full hour
    const now = new Date();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    // Seconds and milliseconds until the next full minute starts
    // -1 because everything is 0-based
    const msUntilNextMinute = (60 - s - 1) * 1000 + (1000 - ms - 1);

    // Remaining minutes until the next iteration begins
    const minutesSinceLastIteration = m % MINUTES_PER_ITERATION;
    const minutesMissing =
      MINUTES_PER_ITERATION - minutesSinceLastIteration - 1;

    // Combining both
    return msUntilNextMinute + minutesMissing * 60 * 1000;
  }

  async fetchModel() {
    const { crazySeed } = this.studyInfo.variation;
    let modelUrlEndpoint = crazySeed
      ? URL_ENDPOINT_CRAZY_SEED
      : URL_ENDPOINT_HUMAN_SEED;
    const modelUrlEndPointTestingOverride = await browser.experiments.prefs.getStringPref(
      "extensions.federated-learning-v2_shield_mozilla_org.test.modelUrlEndpoint",
      "",
    );
    if (modelUrlEndPointTestingOverride !== "") {
      modelUrlEndpoint = modelUrlEndPointTestingOverride;
    }
    await browser.study.logger.log("Fetching model from " + modelUrlEndpoint);
    fetch(modelUrlEndpoint)
      .then(response => response.json())
      .then(this.applyModelUpdate.bind(this));

    this.setTimer();
  }

  setTimer() {
    setTimeout(this.fetchModel.bind(this), this.msUntilNextIteration());
  }

  async applyModelUpdate({ iteration, model }) {
    await browser.study.logger.debug({ iteration, model });
    this.iteration = iteration;

    await browser.study.logger.log("Applying frecency weights");
    for (let i = 0; i < PREFS.length; i++) {
      await browser.experiments.prefs.setIntPref(PREFS[i], model[i]);
    }

    await browser.study.logger.log("Updating all frecencies");
    browser.experiments.frecency.updateAllFrecencies();
  }

  async pushModelUpdate({
    weights,
    loss,
    numSuggestionsDisplayed,
    selectedStyle,
    selectedIndex,
    numTypedChars,
    frecencyScores,
  }) {
    await browser.study.logger.log("Pushing model update via telemetry");
    const payload = {
      model_version: this.iteration,
      frecency_scores: frecencyScores,
      loss,
      update: weights,
      num_suggestions_displayed: numSuggestionsDisplayed,
      selected_style: selectedStyle,
      rank_selected: selectedIndex,
      num_chars_typed: numTypedChars,
      study_variation: this.studyInfo.variation.name,
    };
    await feature.sendTelemetry(payload);
  }
}
