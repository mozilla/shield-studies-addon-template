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

    const { EventManager } = ExtensionCommon;

    const EVENT = "autocomplete-will-enter-text";
    // Bookmarks are not included for now because we also want to take them into account
    const NON_BOOKMARK_OR_HISTORY_STYLES = [
      "switchtab",
      "remotetab",
      "searchengine",
      "visiturl",
      "extension",
      "suggestion",
      "keyword",
    ];

    function processAwesomeBarSearch(el, callback) {
      const popup = el.popup;
      if (!popup) {
        // eslint-disable-next-line no-console
        console.error(
          "Popup was found undefined - not triggering awesomeBar.onAutocompleteSuggestionSelected",
          el,
          el.popup,
        );
        return;
      }
      const controller = popup.view.QueryInterface(
        Ci.nsIAutoCompleteController,
      );

      const selectedIndex = popup.selectedIndex;
      const selectedStyle = controller.getStyleAt(selectedIndex);
      const searchQuery = controller.searchString;

      const numberOfSuggestions = controller.matchCount;
      const bookmarkOrHistoryUrlSuggestions = [];

      for (let i = 0; i < numberOfSuggestions; i++) {
        const isBookmarkOrHistory = isBookmarkOrHistoryStyle(
          controller.getStyleAt(i),
        );

        if (isBookmarkOrHistory) {
          const url = controller.getFinalCompleteValueAt(i);
          bookmarkOrHistoryUrlSuggestions.push(url);
        }
      }

      const selectedBookmarkOrHistoryIndex = bookmarkOrHistoryUrlSuggestions.indexOf(
        controller.getFinalCompleteValueAt(selectedIndex),
      );
      callback(
        numberOfSuggestions,
        selectedIndex,
        bookmarkOrHistoryUrlSuggestions,
        selectedBookmarkOrHistoryIndex,
        searchQuery.length,
        selectedStyle,
      );
    }

    function isBookmarkOrHistoryStyle(styleString) {
      const styles = new Set(styleString.split(/\s+/));
      const isNonBookmarkOrHistoryStyle = NON_BOOKMARK_OR_HISTORY_STYLES.some(
        s => styles.has(s),
      );
      return !isNonBookmarkOrHistoryStyle;
    }

    return {
      experiments: {
        awesomeBar: {
          onAutocompleteSuggestionSelected: new EventManager({
            context,
            name: "awesomeBar.onAutocompleteSuggestionSelected",
            register: fire => {
              Services.obs.addObserver(
                el => processAwesomeBarSearch(el, fire.async),
                EVENT,
              );
            },
          }).api(),
        },
      },
    };
  }
};
