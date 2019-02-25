/* global optimizer */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(svmLoss|AwesomeBarObserver)" }]*/

class AwesomeBarObserver {
  constructor(trainingStepFunction) {
    this.trainingStepFunction = trainingStepFunction;
  }

  async start() {
    browser.experiments.awesomeBar.onAutocompleteSuggestionSelected.addListener(
      async({
        rankSelected,
        numCharsTyped,
        numSuggestionsDisplayed,
        suggestions,
      }) => {
        if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
          // drop the event - do not do any model training
          return false;
        }

        const selectedSuggestion = suggestions[rankSelected];

        const bookmarkAndHistorySuggestions = suggestions.filter(suggestion =>
          AwesomeBarObserver.isBookmarkOrHistoryStyle(suggestion.style),
        );
        const bookmarkAndHistoryUrlSuggestions = bookmarkAndHistorySuggestions.map(
          suggestion => suggestion.url,
        );
        const bookmarkAndHistoryRankSelected = bookmarkAndHistoryUrlSuggestions.indexOf(
          selectedSuggestion.url,
        );

        try {
          await this.trainingStepFunction(
            numSuggestionsDisplayed,
            rankSelected,
            bookmarkAndHistoryUrlSuggestions,
            bookmarkAndHistoryRankSelected,
            numCharsTyped,
            selectedSuggestion.style,
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

  static isBookmarkOrHistoryStyle(styleString) {
    const NON_BOOKMARK_OR_HISTORY_STYLES = [
      "switchtab",
      "remotetab",
      "searchengine",
      "visiturl",
      "extension",
      "suggestion",
      "keyword",
    ];
    const styles = new Set(styleString.split(/\s+/));
    const isNonBookmarkOrHistoryStyle = NON_BOOKMARK_OR_HISTORY_STYLES.some(s =>
      styles.has(s),
    );
    return !isNonBookmarkOrHistoryStyle;
  }
}
