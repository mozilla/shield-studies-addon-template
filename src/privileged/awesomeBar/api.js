/* global ExtensionAPI, Ci */

"use strict";

this.awesomeBar = class extends ExtensionAPI {
  getAPI(context) {
    const { Services } = ChromeUtils.import(
      "resource://gre/modules/Services.jsm",
      {},
    );

    const { ExtensionCommon } = ChromeUtils.import(
      "resource://gre/modules/ExtensionCommon.jsm",
    );

    const { EventManager, EventEmitter } = ExtensionCommon;

    const awesomeBarEventEmitter = new EventEmitter();

    function processAutocompleteWillEnterText(el) {
      function isBookmarkOrHistoryStyle(styleString) {
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
        const isNonBookmarkOrHistoryStyle = NON_BOOKMARK_OR_HISTORY_STYLES.some(
          s => styles.has(s),
        );
        return !isNonBookmarkOrHistoryStyle;
      }

      const popup = el.popup;
      if (!popup) {
        // eslint-disable-next-line no-console
        console.error(
          "Popup was found undefined - not emitting awesomeBar.onAutocompleteSuggestionSelected",
          el,
          el.popup,
        );
        return;
      }
      const controller = popup.view.QueryInterface(
        Ci.nsIAutoCompleteController,
      );

      const rankSelected = popup.selectedIndex;
      const selectedStyle = controller.getStyleAt(rankSelected);
      const numCharsTyped = controller.searchString.length;

      const numSuggestionsDisplayed = controller.matchCount;
      const bookmarkAndHistoryUrlSuggestions = [];

      for (let i = 0; i < numSuggestionsDisplayed; i++) {
        const isBookmarkOrHistory = isBookmarkOrHistoryStyle(
          controller.getStyleAt(i),
        );

        if (isBookmarkOrHistory) {
          const url = controller.getFinalCompleteValueAt(i);
          bookmarkAndHistoryUrlSuggestions.push(url);
        }
      }

      const bookmarkAndHistoryRankSelected = bookmarkAndHistoryUrlSuggestions.indexOf(
        controller.getFinalCompleteValueAt(rankSelected),
      );
      awesomeBarEventEmitter.emit(
        "awesomeBar.onAutocompleteSuggestionSelected",
        numSuggestionsDisplayed,
        rankSelected,
        bookmarkAndHistoryUrlSuggestions,
        bookmarkAndHistoryRankSelected,
        numCharsTyped,
        selectedStyle,
      );
    }

    return {
      experiments: {
        awesomeBar: {
          onAutocompleteSuggestionSelected: new EventManager(
            context,
            "awesomeBar.onAutocompleteSuggestionSelected",
            fire => {
              const listener = (event, ...args) => {
                fire.async(...args);
              };
              awesomeBarEventEmitter.on(
                "awesomeBar.onAutocompleteSuggestionSelected",
                listener,
              );
              return () => {
                awesomeBarEventEmitter.off(
                  "awesomeBar.onAutocompleteSuggestionSelected",
                  listener,
                );
              };
            },
          ).api(),
          start: async() => {
            Services.obs.addObserver(
              processAutocompleteWillEnterText,
              "autocomplete-will-enter-text",
            );
          },
          stop: async() => {
            Services.obs.removeObserver(
              processAutocompleteWillEnterText,
              "autocomplete-will-enter-text",
            );
          },
        },
      },
    };
  }
};
