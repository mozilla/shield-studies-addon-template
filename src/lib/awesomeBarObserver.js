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

  async updateModel(awesomeBarState) {
    try {
      const {
        rankSelected,
        numCharsTyped,
        numSuggestionsDisplayed,
        suggestions,
      } = awesomeBarState;

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

      await this.optimizer.step(
        numSuggestionsDisplayed,
        rankSelected,
        bookmarkAndHistoryUrlSuggestions,
        bookmarkAndHistoryRankSelected,
        numCharsTyped,
        selectedSuggestion.style,
      );
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
    await this.updateModel(awesomeBarState);
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
