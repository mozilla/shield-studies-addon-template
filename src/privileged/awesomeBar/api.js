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
      callback(
        numSuggestionsDisplayed,
        rankSelected,
        bookmarkAndHistoryUrlSuggestions,
        bookmarkAndHistoryRankSelected,
        numCharsTyped,
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
          /*
          addAwesomeBarInputListeners: () => {
            // If the panel was created in this window before, let's make sure to clean it up.
            const winEnum = Services.wm.getEnumerator("navigator:browser");
            while (winEnum.hasMoreElements()) {
              const win = winEnum.getNext();
              if (
                win.gURLBar &&
                !win.closed
              ) {
                const { panel, panelButton } = this._ensurePanel(win);
                panelButton.removeEventListener("command", this);
                panel.remove();
              }
            }
          },
          removeAwesomeBarInputListeners: () => {
            // If the panel was created in this window before, let's make sure to clean it up.
            const winEnum = Services.wm.getEnumerator("navigator:browser");
            while (winEnum.hasMoreElements()) {
              const win = winEnum.getNext();
              if (
                win.document &&
                win.document.getElementById(TIP_PANEL_ID) &&
                !win.closed
              ) {
                const { panel, panelButton } = this._ensurePanel(win);
                panelButton.removeEventListener("command", this);
                panel.remove();
              }
            }
          },
          */
        },
      },
    };
  }
};
