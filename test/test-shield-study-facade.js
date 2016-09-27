const { expect } = require('chai');

const N_variations = 10;

const { variationsMod } = require('../lib/shield-study-facade');

exports['test right keys'] = function (assert) {
  let expected = ['isEligible','cleanup','variations'];
  expect(variationsMod).to.have.all.keys(expected);
};

exports['test all variations are functions'] = function (assert) {
  for (let k in variationsMod.variations) {
    expect(variationsMod.variations[k]).to.be.a('function');
  }
};

exports['test there are {N_variations} variations'] = function (assert) {
  expect(Object.keys(variationsMod.variations).length).to.equal(N_variations);
};

exports['test all variations are safe to call more than once'] = function (assert) {
  for (let k in variationsMod.variations) {
    // how would we know?
    expect(false).to.be.true;
    variationsMod.variations[k](); // does something
    variationsMod.variations[k](); // probably doesn't do it again
  }
};

exports['test cleanup works and is multicallable'] = function (assert) {
  // do something the study would do.
  variationsMod.cleanup();
  expect(false).to.be.true;

  variationsMod.cleanup();
  expect(false).to.be.true;
};

exports['test isEligible works and is multicallable'] = function (assert) {
  // setup: make the user not eligible
  expect(false).to.be.true;
  expect(variationsMod.isEligible()).to.be.true;
};

require('sdk/test').run(exports);
