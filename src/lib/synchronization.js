/* global feature, FRECENCY_PREFS, MODEL_URL_ENDPOINT_TESTING_OVERRIDE_PREF */
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
      MODEL_URL_ENDPOINT_TESTING_OVERRIDE_PREF,
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
    for (let i = 0; i < FRECENCY_PREFS.length; i++) {
      await browser.experiments.prefs.setIntPref(FRECENCY_PREFS[i], model[i]);
    }

    await browser.study.logger.log("Updating all frecencies");
    browser.experiments.frecency.updateAllFrecencies();
  }

  async pushModelUpdate({
    frecencyScores,
    loss,
    weights,
    numSuggestionsDisplayed,
    rankSelected,
    bookmarkAndHistoryNumSuggestionsDisplayed,
    bookmarkAndHistoryRankSelected,
    numKeyDownEventsAtSelectedsFirstEntry,
    numKeyDownEvents,
    timeStartInteraction,
    timeEndInteraction,
    timeAtSelectedsFirstEntry,
    searchStringLength,
    selectedStyle,
  }) {
    await browser.study.logger.log("Pushing model update via telemetry");
    const payload = {
      model_version: this.iteration,
      frecency_scores: frecencyScores,
      loss,
      update: weights,
      num_suggestions_displayed: numSuggestionsDisplayed,
      rank_selected: rankSelected,
      bookmark_and_history_num_suggestions_displayed: bookmarkAndHistoryNumSuggestionsDisplayed,
      bookmark_and_history_rank_selected: bookmarkAndHistoryRankSelected,
      num_key_down_events_at_selecteds_first_entry: numKeyDownEventsAtSelectedsFirstEntry,
      num_key_down_events: numKeyDownEvents,
      time_start_interaction: timeStartInteraction,
      time_end_interaction: timeEndInteraction,
      time_at_selecteds_first_entry: timeAtSelectedsFirstEntry,
      search_string_length: searchStringLength,
      selected_style: selectedStyle,
      study_variation: this.studyInfo.variation.name,
      study_addon_version: browser.runtime.getManifest().version,
    };
    await feature.sendTelemetry(payload);
  }
}
