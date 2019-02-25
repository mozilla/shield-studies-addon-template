/* global optimizer */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(svmLoss|AwesomeBarObserver)" }]*/

class AwesomeBarObserver {
  constructor(trainingStepFunction) {
    this.trainingStepFunction = trainingStepFunction;
  }

  async start() {
    browser.experiments.awesomeBar.onAutocompleteSuggestionSelected.addListener(
      async({
        numSuggestionsDisplayed,
        rankSelected,
        bookmarkAndHistoryUrlSuggestions,
        bookmarkAndHistoryRankSelected,
        numCharsTyped,
        selectedStyle,
      }) => {
        if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
          // drop the event - do not do any model training
          return false;
        }

        try {
          await this.trainingStepFunction(
            numSuggestionsDisplayed,
            rankSelected,
            bookmarkAndHistoryUrlSuggestions,
            bookmarkAndHistoryRankSelected,
            numCharsTyped,
            selectedStyle,
          );
        } catch (error) {
          await browser.study.logger.error([
            "Training failed - optimizer.step ran into an error:",
            error,
          ]);
        }
        return true;
      },
    );
    await browser.experiments.awesomeBar.start();
  }

  async stop() {
    await browser.experiments.awesomeBar.stop();
  }
}
