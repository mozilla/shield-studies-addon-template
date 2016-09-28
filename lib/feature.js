/** feature.js **/
const prefSvc = require('sdk/preferences/service');

const ourpref = 'some.pref.somewhere';

exports.which = function (val) {
  prefSvc.set(ourpref, val);
  return val;
};

exports.isEligible = function () {
  return !prefSvc.isSet(ourpref);
};

exports.reset = function () {
  return prefSvc.reset(ourpref);
};
