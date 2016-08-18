const shield = require("./shield-study-facade");

exports.main = function(options, callbacks){
  console.log("Hello World! I am alive :)");
  shield.generateTelemetryIdIfNeeded().then(
  ()=> shield.main(options, callbacks))
}

exports.onUnload = function(reason){
  console.log("unloading due to " + reason);
  shield.onUnload(reason);
  console.log("unload complete");
}
