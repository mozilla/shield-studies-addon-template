/* eslint-env node, mocha, chai */
/* global browser, sinon, assert, AwesomeBarObserver */

"use strict";

describe("awesomeBarObserver.js", function() {
  describe("AwesomeBarObserver.numKeyDowns(observedEventsSinceLastFocus)", function() {
    it("test 1", function() {
      const observedEventsSinceLastFocus = [];
      const numKeyDowns = AwesomeBarObserver.numKeyDowns(
        observedEventsSinceLastFocus,
      );
      assert.equal(numKeyDowns, 0);
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
      const numKeyDowns = AwesomeBarObserver.numKeyDowns(
        observedEventsSinceLastFocus,
      );
      assert.equal(numKeyDowns, 3);
    });
  });
});
