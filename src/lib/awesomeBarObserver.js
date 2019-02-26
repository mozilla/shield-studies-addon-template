/* global FrecencyOptimizer */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(svmLoss|AwesomeBarObserver)" }]*/

class AwesomeBarObserver {
  constructor(synchronizer) {
    this.frecencyOptimizer = new FrecencyOptimizer(
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
      await browser.study.logger.debug([
        "awesomeBarObserver.updateModel entered",
        {
          observedEventsSinceLastFocus: this.observedEventsSinceLastFocus,
        },
      ]);
      const selectionEvent = this.observedEventsSinceLastFocus
        .slice()
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
          searchStringLength,
          numSuggestionsDisplayed,
          suggestions,
        } = selectionEvent.awesomeBarState;

        const numKeyDownEvents = AwesomeBarObserver.numKeyDownEvents(
          this.observedEventsSinceLastFocus,
        );

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

        const eventsAtSelectedsFirstEntry = AwesomeBarObserver.eventsAtSelectedsFirstEntry(
          this.observedEventsSinceLastFocus,
        );
        const numKeyDownEventsAtFirstAppearanceOfSelected = AwesomeBarObserver.numKeyDownEvents(
          eventsAtSelectedsFirstEntry,
        );

        await this.frecencyOptimizer.step(
          numSuggestionsDisplayed,
          rankSelected,
          bookmarkAndHistoryUrlSuggestions,
          bookmarkAndHistoryRankSelected,
          numKeyDownEventsAtFirstAppearanceOfSelected,
          numKeyDownEvents,
          searchStringLength,
          selectedStyle,
        );
      } else {
        // Find awesomeBarState at latest search result update if any
        const latestUpdateEvent = this.observedEventsSinceLastFocus
          .slice()
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
            searchStringLength,
            numSuggestionsDisplayed,
            suggestions,
          } = latestUpdateEvent.awesomeBarState;

          const numKeyDownEventsAtFirstAppearanceOfSelected = -1;
          const numKeyDownEvents = AwesomeBarObserver.numKeyDownEvents(
            this.observedEventsSinceLastFocus,
          );

          const bookmarkAndHistorySuggestions = suggestions.filter(suggestion =>
            AwesomeBarObserver.isBookmarkOrHistoryStyle(suggestion.style),
          );
          const bookmarkAndHistoryUrlSuggestions = bookmarkAndHistorySuggestions.map(
            suggestion => suggestion.url,
          );
          const bookmarkAndHistoryRankSelected = -1;
          const selectedStyle = "";

          await this.frecencyOptimizer.step(
            numSuggestionsDisplayed,
            rankSelected,
            bookmarkAndHistoryUrlSuggestions,
            bookmarkAndHistoryRankSelected,
            numKeyDownEventsAtFirstAppearanceOfSelected,
            numKeyDownEvents,
            searchStringLength,
            selectedStyle,
          );
        } else {
          // 3. The autocomplete popup did not get some suggestions displayed and none was selected

          const focusEvent = this.observedEventsSinceLastFocus
            .slice()
            .reverse()
            .find(observedEvent => {
              return (
                observedEvent.awesomeBarState &&
                observedEvent.type === "onFocus"
              );
            });

          const rankSelected = -1;

          const { searchStringLength } = focusEvent.awesomeBarState;

          const numKeyDownEventsAtFirstAppearanceOfSelected = -1;
          const numKeyDownEvents = AwesomeBarObserver.numKeyDownEvents(
            this.observedEventsSinceLastFocus,
          );

          const numSuggestionsDisplayed = 0;
          const bookmarkAndHistoryUrlSuggestions = [];
          const bookmarkAndHistoryRankSelected = -1;
          const selectedStyle = "";

          await this.frecencyOptimizer.step(
            numSuggestionsDisplayed,
            rankSelected,
            bookmarkAndHistoryUrlSuggestions,
            bookmarkAndHistoryRankSelected,
            numKeyDownEventsAtFirstAppearanceOfSelected,
            numKeyDownEvents,
            searchStringLength,
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

  /**
   * @param {array} observedEventsSinceLastFocus Self-explanatory hopefully
   * @returns {int} the amount of key down events since last focus, excluding "Enter" key down events
   */
  static numKeyDownEvents(observedEventsSinceLastFocus) {
    const keyDownEvents = observedEventsSinceLastFocus.filter(observedEvent => {
      return (
        observedEvent.type === "onKeyDown" &&
        observedEvent.keyEvent &&
        observedEvent.keyEvent.key !== "Enter"
      );
    });
    return keyDownEvents.length;
  }

  /**
   * @param {array} observedEventsSinceLastFocus Self-explanatory hopefully
   * @returns {int} The eventsAtSelectedsFirstEntry
   */
  static eventsAtSelectedsFirstEntry(observedEventsSinceLastFocus) {
    const selectionEvent = observedEventsSinceLastFocus
      .slice()
      .reverse()
      .find(observedEvent => {
        return (
          observedEvent.awesomeBarState &&
          observedEvent.type === "onAutocompleteSuggestionSelected"
        );
      });

    if (!selectionEvent) {
      throw new Error("No selection event observed");
    }

    const selectedUrl =
      selectionEvent.awesomeBarState.suggestions[
        selectionEvent.awesomeBarState.rankSelected
      ].url;

    const eventWhereTheSelectedUrlAppearedForTheFirstTime = observedEventsSinceLastFocus.find(
      observedEvent => {
        return (
          observedEvent.awesomeBarState &&
          observedEvent.awesomeBarState.suggestions.find(
            suggestion => suggestion.url === selectedUrl,
          )
        );
      },
    );

    if (!eventWhereTheSelectedUrlAppearedForTheFirstTime) {
      throw new Error("No event with the selected url observed");
    }

    const index = observedEventsSinceLastFocus.indexOf(
      eventWhereTheSelectedUrlAppearedForTheFirstTime,
    );
    return observedEventsSinceLastFocus.slice(0, index);
  }
}
