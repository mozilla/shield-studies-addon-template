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

    const { ExtensionUtils } = ChromeUtils.import(
      "resource://gre/modules/ExtensionUtils.jsm",
      {},
    );
    const { ExtensionError } = ExtensionUtils;

    const awesomeBarEventEmitter = new EventEmitter();

    /**
     * @param {object} el The URL bar element
     * @returns {object} The awesome bar state
     */
    function awesomeBarState(el) {
      try {
        const popup = el.popup;
        if (!popup) {
          // eslint-disable-next-line no-console
          console.error(
            "Awesome bar autocomplete popup was found undefined while attempting to assess the state of the awesome bar",
            el,
            el.popup,
          );
          return {};
        }

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
      } catch (error) {
        // Surfacing otherwise silent errors
        throw new ExtensionError(error.toString());
      }
    }

    /**
     * @param {object} el The URL bar element
     * @returns {void}
     */
    function processAutocompleteWillEnterText(el) {
      awesomeBarEventEmitter.emit(
        "awesomeBar.onAutocompleteSuggestionSelected",
        awesomeBarState(el),
      );
    }

    /**
     * Note: The text is actually not reverted, it remains in the awesome bar, but the
     * autocomplete popup has been cancelled by some means, like pressing escape
     * @param {object} el The URL bar element
     * @returns {void}
     */
    function processAutocompleteDidRevertText(el) {
      awesomeBarEventEmitter.emit(
        "awesomeBar.onAutocompleteSuggestionsHidden",
        awesomeBarState(el),
      );
    }

    const gURLBarEvents = ["focus", "blur", "change", "input"];

    const { clearTimeout, setTimeout } = ChromeUtils.import(
      "resource://gre/modules/Timer.jsm",
    );

    class UrlBarEventListeners {
      static focus(event) {
        awesomeBarEventEmitter.emit(
          "awesomeBar.onFocus",
          awesomeBarState(event.srcElement),
        );
      }

      static blur(event) {
        awesomeBarEventEmitter.emit(
          "awesomeBar.onBlur",
          awesomeBarState(event.srcElement),
        );
      }

      static async input(event) {
        awesomeBarEventEmitter.emit(
          "awesomeBar.onInput",
          awesomeBarState(event.srcElement),
        );
        await UrlBarEventListeners.waitForSearchResults(event.srcElement);
        awesomeBarEventEmitter.emit(
          "awesomeBar.onAutocompleteSuggestionsUpdated",
          awesomeBarState(event.srcElement),
        );
      }

      /**
       * @param {object} el The URL bar element
       * @returns {Promise} Resolves after the search results are in
       */
      static waitForSearchResults(el) {
        return new Promise((resolve, reject) => {
          // Fallback timeout after 1000ms if no search results are in by then
          const timer = setTimeout(() => {
            reject();
          }, 1000);
          el.onSearchComplete = () => {
            clearTimeout(timer);
            resolve();
          };
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
      if (win.gURLBar) {
        gURLBarEvents.map(eventRef => {
          win.gURLBar.removeEventListener(
            eventRef,
            UrlBarEventListeners[eventRef],
          );
        });
      }
    }

    /**
     * Proxy between awesomeBarEventEmitter.emit("awesomeBar.onAutocompleteSuggestionSelected", ...args)
     * and the actual web extension event being emitted
     * @param {string} eventRef the event reference, eg "onAutocompleteSuggestionSelected"
     * @returns {void}
     */
    const eventManagerFactory = eventRef => {
      const eventId = `awesomeBar.${eventRef}`;
      return new EventManager(context, eventId, fire => {
        const listener = (event, ...args) => fire.async(...args);
        awesomeBarEventEmitter.on(eventId, listener);
        return () => {
          awesomeBarEventEmitter.off(eventId, listener);
        };
      });
    };

    return {
      experiments: {
        awesomeBar: {
          // Event boilerplate with listeners that forwards all but the first argument to the web extension event
          onAutocompleteSuggestionSelected: eventManagerFactory(
            "onAutocompleteSuggestionSelected",
          ).api(),
          onFocus: eventManagerFactory("onFocus").api(),
          onBlur: eventManagerFactory("onBlur").api(),
          onInput: eventManagerFactory("onInput").api(),
          onAutocompleteSuggestionsHidden: eventManagerFactory(
            "onAutocompleteSuggestionsHidden",
          ).api(),
          onAutocompleteSuggestionsUpdated: eventManagerFactory(
            "onAutocompleteSuggestionsUpdated",
          ).api(),
          // Functions
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
