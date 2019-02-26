/* global FrecencyOptimizer */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(svmLoss|AwesomeBarObserver)" }]*/

class AwesomeBarObserver {
  constructor(synchronizer) {
    this.optimizer = new FrecencyOptimizer(
      synchronizer,
      FrecencyOptimizer.svmLoss,
    );
    this.eventsToObserve = [
      "onFocus",
      "onBlur",
      "onKeyDown",
      "onKeyPress",
      "onInput",
      "onAutocompleteSuggestionsHidden",
      "onAutocompleteSuggestionsUpdated",
      "onAutocompleteSuggestionSelected",
    ];
    this.observedEventsSinceLastFocus = [];
  }
  async start() {
    this.eventsToObserve.map(eventRef => {
      browser.experiments.awesomeBar[eventRef].addListener(
        this[eventRef].bind(this),
      );
    });
    await browser.experiments.awesomeBar.start();
  }

  async stop() {
    await browser.experiments.awesomeBar.stop();
    this.eventsToObserve.map(eventRef => {
      browser.experiments.awesomeBar[eventRef].removeListener(this[eventRef]);
    });
  }

  /**
   * Three main interactions with the awesome bar trigger a model update via study telemetry:
   * 1. A suggestion was selected from the autocomplete popup
   * 2. The autocomplete popup got some suggestions displayed but none were selected
   * 3. The autocomplete popup did not get some suggestions displayed and none was selected
   * @returns {Promise<boolean>} Promise that resolves when the method has completed
   */
  async updateModel() {
    try {
      console.log("updateModel TODO", this.observedEventsSinceLastFocus);

      const selectionEvent = this.observedEventsSinceLastFocus
        .reverse()
        .find(observedEvent => {
          return (
            observedEvent.awesomeBarState &&
            observedEvent.type === "onAutocompleteSuggestionSelected"
          );
        });

      // 1. A suggestion was selected from the autocomplete popup
      if (selectionEvent) {
        const {
          rankSelected,
          numCharsTyped,
          numSuggestionsDisplayed,
          suggestions,
        } = selectionEvent.awesomeBarState;

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
        const selectedStyle = selectedSuggestion.style;

        await this.optimizer.step(
          numSuggestionsDisplayed,
          rankSelected,
          bookmarkAndHistoryUrlSuggestions,
          bookmarkAndHistoryRankSelected,
          numCharsTyped,
          selectedStyle,
        );
      } else {
        // Find awesomeBarState at latest search result update if any
        const latestUpdateEvent = this.observedEventsSinceLastFocus
          .reverse()
          .find(observedEvent => {
            return (
              observedEvent.awesomeBarState &&
              observedEvent.type === "onAutocompleteSuggestionsUpdated"
            );
          });

        // 2. The autocomplete popup got some suggestions displayed but none were selected
        if (latestUpdateEvent) {
          const rankSelected = -1;

          const {
            numCharsTyped,
            numSuggestionsDisplayed,
            suggestions,
          } = latestUpdateEvent.awesomeBarState;

          const bookmarkAndHistorySuggestions = suggestions.filter(suggestion =>
            AwesomeBarObserver.isBookmarkOrHistoryStyle(suggestion.style),
          );
          const bookmarkAndHistoryUrlSuggestions = bookmarkAndHistorySuggestions.map(
            suggestion => suggestion.url,
          );
          const bookmarkAndHistoryRankSelected = -1;
          const selectedStyle = "";

          await this.optimizer.step(
            numSuggestionsDisplayed,
            rankSelected,
            bookmarkAndHistoryUrlSuggestions,
            bookmarkAndHistoryRankSelected,
            numCharsTyped,
            selectedStyle,
          );
        } else {
          // 3. The autocomplete popup did not get some suggestions displayed and none was selected
          const rankSelected = -1;
          const numCharsTyped = 0;
          const numSuggestionsDisplayed = 0;
          const bookmarkAndHistoryUrlSuggestions = [];
          const bookmarkAndHistoryRankSelected = -1;
          const selectedStyle = "";

          await this.optimizer.step(
            numSuggestionsDisplayed,
            rankSelected,
            bookmarkAndHistoryUrlSuggestions,
            bookmarkAndHistoryRankSelected,
            numCharsTyped,
            selectedStyle,
          );
        }
      }
    } catch (error) {
      // Surfacing otherwise silent errors
      // eslint-disable-next-line no-console
      console.error(error.toString());
      throw new Error(error.toString());
    }
    return true;
  }

  async onFocus(awesomeBarState) {
    // Always reset on focus, since it marks the beginning of the awesome bar interaction
    this.observedEventsSinceLastFocus = [];
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the event - do not do any model training
      return false;
    }
    this.observedEventsSinceLastFocus.push({
      awesomeBarState,
      timestamp: new Date(),
      type: "onFocus",
    });
    return true;
  }

  async onBlur(awesomeBarState) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the event - do not do any model training
      return false;
    }
    this.observedEventsSinceLastFocus.push({
      awesomeBarState,
      timestamp: new Date(),
      type: "onBlur",
    });
    console.log("onBlur", this.observedEventsSinceLastFocus);
    await this.updateModel(awesomeBarState);
    return true;
  }

  async onKeyDown(keyEvent) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the event - do not do any model training
      return false;
    }
    this.observedEventsSinceLastFocus.push({
      keyEvent,
      timestamp: new Date(),
      type: "onKeyDown",
    });
    return true;
  }

  async onKeyPress(keyEvent) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the event - do not do any model training
      return false;
    }
    this.observedEventsSinceLastFocus.push({
      keyEvent,
      timestamp: new Date(),
      type: "onKeyPress",
    });
    return true;
  }

  async onInput(awesomeBarState) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the event - do not do any model training
      return false;
    }
    this.observedEventsSinceLastFocus.push({
      awesomeBarState,
      timestamp: new Date(),
      type: "onInput",
    });
    return true;
  }

  async onAutocompleteSuggestionsHidden(awesomeBarState) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the event - do not do any model training
      return false;
    }
    this.observedEventsSinceLastFocus.push({
      awesomeBarState,
      timestamp: new Date(),
      type: "onAutocompleteSuggestionsHidden",
    });
    return true;
  }

  async onAutocompleteSuggestionsUpdated(awesomeBarState) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the event - do not do any model training
      return false;
    }
    this.observedEventsSinceLastFocus.push({
      awesomeBarState,
      timestamp: new Date(),
      type: "onAutocompleteSuggestionsUpdated",
    });
    return true;
  }

  async onAutocompleteSuggestionSelected(awesomeBarState) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the event - do not do any model training
      return false;
    }
    this.observedEventsSinceLastFocus.push({
      awesomeBarState,
      timestamp: new Date(),
      type: "onAutocompleteSuggestionSelected",
    });
    return true;
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
