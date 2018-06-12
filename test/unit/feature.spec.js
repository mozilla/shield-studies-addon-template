/* eslint-env node, mocha, chai */
/* global browser, sinon, assert, Feature */

"use strict";

describe("feature.js", function() {
  describe("Feature.iconPath(variation)", function() {
    it("should return the expected path", function() {
      const variation = {
        name: "foo",
        weight: "1.0",
      };
      const iconPath = Feature.iconPath(variation);
      assert.equal(iconPath, "icons/foo.svg");
    });
  });
});
