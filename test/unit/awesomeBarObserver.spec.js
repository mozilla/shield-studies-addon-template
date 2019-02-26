/* eslint-env node, mocha, chai */
/* global browser, sinon, assert, expect, AwesomeBarObserver */

"use strict";

describe("awesomeBarObserver.js", function() {
  describe("AwesomeBarObserver.numKeyDownEvents(observedEventsSinceLastFocus)", function() {
    it("test 1", function() {
      const observedEventsSinceLastFocus = [];
      const numKeyDownEvents = AwesomeBarObserver.numKeyDownEvents(
        observedEventsSinceLastFocus,
      );
      assert.equal(numKeyDownEvents, 0);
    });
    it("test 2", function() {
      const observedEventsSinceLastFocus = [
        {
          keyEvent: {
            key: "f",
          },
          type: "onKeyDown",
        },
        {
          keyEvent: {
            key: "o",
          },
          type: "onKeyDown",
        },
        {
          keyEvent: {
            key: "o",
          },
          type: "onKeyDown",
        },
        {
          keyEvent: {
            key: "Enter",
          },
          type: "onKeyDown",
        },
      ];
      const numKeyDownEvents = AwesomeBarObserver.numKeyDownEvents(
        observedEventsSinceLastFocus,
      );
      assert.equal(numKeyDownEvents, 3);
    });
  });
  describe("AwesomeBarObserver.eventsAtSelectedsFirstEntry(observedEventsSinceLastFocus)", function() {
    it("test 1", function() {
      const observedEventsSinceLastFocus = [];
      expect(() => {
        AwesomeBarObserver.eventsAtSelectedsFirstEntry(
          observedEventsSinceLastFocus,
        );
      }).to.throw("No selection event observed");
    });
    it("test 2", function() {
      const observedEventsSinceLastFocus = [
        {
          keyEvent: {
            key: "f",
          },
          type: "onKeyDown",
        },
        {
          awesomeBarState: {
            suggestions: [],
          },
          type: "onInput",
        },
        {
          awesomeBarState: {
            suggestions: [
              {
                url: "https://bar.com",
                style: "bar",
              },
            ],
          },
          type: "onAutocompleteSuggestionsUpdated",
        },
        {
          keyEvent: {
            key: "o",
          },
          type: "onKeyDown",
        },
        {
          awesomeBarState: {
            suggestions: [],
          },
          type: "onInput",
        },
        {
          // The event where the selected url first appeared
          awesomeBarState: {
            suggestions: [
              {
                url: "https://foo.com",
                style: "foo",
              },
              {
                url: "https://bar.com",
                style: "bar",
              },
            ],
          },
          type: "onAutocompleteSuggestionsUpdated",
        },
        {
          keyEvent: {
            key: "o",
          },
          type: "onKeyDown",
        },
        {
          awesomeBarState: {
            suggestions: [],
          },
          type: "onInput",
        },
        {
          awesomeBarState: {
            suggestions: [
              {
                url: "https://foo.com",
                style: "foo",
              },
              {
                url: "https://bar.com",
                style: "bar",
              },
            ],
          },
          type: "onAutocompleteSuggestionsUpdated",
        },
        {
          awesomeBarState: {
            rankSelected: 1,
            suggestions: [
              {
                url: "https://bar.com",
                style: "bar",
              },
              {
                url: "https://foo.com",
                style: "foo",
              },
            ],
          },
          type: "onAutocompleteSuggestionSelected",
        },
        {
          type: "onBlur",
        },
      ];
      const eventsAtSelectedsFirstEntry = AwesomeBarObserver.eventsAtSelectedsFirstEntry(
        observedEventsSinceLastFocus,
      );
      assert.equal(eventsAtSelectedsFirstEntry.length, 5);
    });
  });
});
