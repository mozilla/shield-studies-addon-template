/** index.js **/
const self = require('sdk/self');
console.log(Object.keys(require('./study')));
console.log(Object.keys(require('./study').study));

require('./study').study.startup(self.loadReason);
