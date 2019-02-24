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

    class ProcessAwesomeBarInputEvents {
      constructor() {
        this.events = ["focus", "blur", "change", "input"];
      }

      static focus(event) {
        console.log("focus", event);
      }

      static blur(event) {
        console.log("blur", event);
      }

      static change(event) {
        console.log("change", event);
      }

      static input(event) {
        console.log("input", event);
      }
    }
    const processAwesomeBarInputEvents = new ProcessAwesomeBarInputEvents();

    /* global EveryWindow */
    Services.scriptloader.loadSubScript(
      context.extension.getURL("privileged/awesomeBar/EveryWindow.js"),
    );

    /**
     * Required to detect awesome bar interactions prior to autocomplete suggestion selection
     */
    function registerAwesomeBarInputListeners(win) {
      if (win.gURLBar && !win.closed) {
        processAwesomeBarInputEvents.events.map(eventRef => {
          win.gURLBar.addEventListener(
            eventRef,
            ProcessAwesomeBarInputEvents[eventRef],
          );
        });
      }
    }

    /**
     * Cleans up previously added listeners and prevents new listeners from being added to new windows
     */
    function unregisterAwesomeBarInputListeners(win) {
      processAwesomeBarInputEvents.events.map(eventRef => {
        win.gURLBar.removeEventListener(
          eventRef,
          ProcessAwesomeBarInputEvents[eventRef],
        );
      });
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
            EveryWindow.registerCallback(
              "set-awesome-bar-input-listeners",
              registerAwesomeBarInputListeners,
              unregisterAwesomeBarInputListeners,
            );
          },
          stop: async() => {
            Services.obs.removeObserver(
              processAutocompleteWillEnterText,
              "autocomplete-will-enter-text",
            );
            EveryWindow.unregisterCallback("set-awesome-bar-input-listeners");
          },
        },
      },
    };
  }
};
