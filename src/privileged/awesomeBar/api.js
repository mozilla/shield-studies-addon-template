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

    function autocompletePopupMetadata(popup) {
      const controller = popup.view.QueryInterface(
        Ci.nsIAutoCompleteController,
      );

      const rankSelected = popup.selectedIndex;
      const numCharsTyped = controller.searchString.length;
      const numSuggestionsDisplayed = controller.matchCount;

      const suggestions = [];
      for (let i = 0; i < numSuggestionsDisplayed; i++) {
        suggestions.push({
          style: controller.getStyleAt(i),
          url: controller.getFinalCompleteValueAt(i),
        });
      }

      return {
        rankSelected,
        numCharsTyped,
        numSuggestionsDisplayed,
        suggestions,
      };
    }

    /**
     * @param {object} el The URL bar element
     * @returns {void}
     */
    function processAutocompleteWillEnterText(el) {
      console.log("processAutocompleteWillEnterText", el, el.popup);
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

      const {
        rankSelected,
        numCharsTyped,
        numSuggestionsDisplayed,
        suggestions,
      } = autocompletePopupMetadata(popup);

      const selectedSuggestion = suggestions[rankSelected];

      const bookmarkAndHistorySuggestions = suggestions.filter(suggestion =>
        isBookmarkOrHistoryStyle(suggestion.style),
      );
      const bookmarkAndHistoryUrlSuggestions = bookmarkAndHistorySuggestions.map(
        suggestion => suggestion.url,
      );
      const bookmarkAndHistoryRankSelected = bookmarkAndHistoryUrlSuggestions.indexOf(
        selectedSuggestion.url,
      );

      awesomeBarEventEmitter.emit(
        "awesomeBar.onAutocompleteSuggestionSelected",
        numSuggestionsDisplayed,
        rankSelected,
        bookmarkAndHistoryUrlSuggestions,
        bookmarkAndHistoryRankSelected,
        numCharsTyped,
        selectedSuggestion.style,
      );
    }

    /**
     * Note: The text is actually not reverted, it remains in the awesome bar, but the
     * autocomplete popup has been cancelled by some mean, like pressing escape
     * @param {object} el The URL bar element
     * @returns {void}
     */
    function processAutocompleteDidRevertText(el) {
      console.log("processAutocompleteDidRevertText", el);
    }

    const gURLBarEvents = ["focus", "blur", "change", "input"];

    const { setTimeout } = ChromeUtils.import(
      "resource://gre/modules/Timer.jsm",
    );

    class UrlBarEventListeners {
      static focus(event) {
        console.log("focus");
        UrlBarEventListeners.debug(event);
      }

      static blur(event) {
        console.log("blur");
        UrlBarEventListeners.debug(event);
      }

      static change(event) {
        console.log("change");
        UrlBarEventListeners.debug(event);
      }

      static async input(event) {
        console.log("input");
        UrlBarEventListeners.debug(event);
        await UrlBarEventListeners.waitForSearchResults(event.srcElement);
        console.log("input event - after search results are in");
        UrlBarEventListeners.debug(event);
      }

      static debug(event) {
        console.log(event, event.srcElement, event.srcElement.popup);

        const autocompleteDebug = () => {
          const {
            rankSelected,
            numCharsTyped,
            numSuggestionsDisplayed,
            suggestions,
          } = autocompletePopupMetadata(event.srcElement.popup);

          console.log({
            rankSelected,
            numCharsTyped,
            numSuggestionsDisplayed,
            suggestions,
          });
        };

        autocompleteDebug();
      }

      /**
       * @param {object} el The URL bar element
       * @returns {Promise} Resolves after the search results are in
       */
      static waitForSearchResults(el) {
        return new Promise((resolve, reject) => {
          el.onSearchComplete = () => {
            resolve();
          };
          // Timeout after 1000ms if no search results are in
          setTimeout(() => {
            reject();
          }, 1000);
        });
      }
    }

    /* global EveryWindow */
    Services.scriptloader.loadSubScript(
      context.extension.getURL("privileged/awesomeBar/EveryWindow.js"),
    );

    /**
     * Required to detect awesome bar interactions prior to autocomplete suggestion selection
     * @param {object} win The chrome window object
     * @returns {void}
     */
    function registerAwesomeBarInputListeners(win) {
      if (win.gURLBar && !win.closed) {
        gURLBarEvents.map(eventRef => {
          win.gURLBar.addEventListener(
            eventRef,
            UrlBarEventListeners[eventRef],
          );
        });
      }
    }

    /**
     * Cleans up previously added listeners and prevents new listeners from being added to new windows
     * @param {object} win The chrome window object
     * @returns {void}
     */
    function unregisterAwesomeBarInputListeners(win) {
      gURLBarEvents.map(eventRef => {
        win.gURLBar.removeEventListener(
          eventRef,
          UrlBarEventListeners[eventRef],
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
            Services.obs.addObserver(
              processAutocompleteDidRevertText,
              "autocomplete-did-revert-text",
            );
            EveryWindow.registerCallback(
              "set-awesome-bar-interaction-listeners",
              registerAwesomeBarInputListeners,
              unregisterAwesomeBarInputListeners,
            );
          },
          stop: async() => {
            Services.obs.removeObserver(
              processAutocompleteWillEnterText,
              "autocomplete-will-enter-text",
            );
            Services.obs.removeObserver(
              processAutocompleteDidRevertText,
              "autocomplete-did-revert-text",
            );
            EveryWindow.unregisterCallback(
              "set-awesome-bar-interaction-listeners",
            );
          },
        },
      },
    };
  }
};
