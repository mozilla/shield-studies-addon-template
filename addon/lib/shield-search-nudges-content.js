/* global content, sendAsyncMessage, Services */

const global = this;
const {utils: Cu} = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.importGlobalProperties(["URL"]);

var ShieldSearchNudges = {
  init() {
    // Start listening for location changes, but only when they finished loading.
    global.addEventListener("DOMContentLoaded", this);
    global.addMessageListener("ShieldSearchNudges:UpdateEngineOrigin", this);
    this.currentEngineOrigin = "";
  },

  handleEvent(ev) {
    switch (ev.type) {
      case "DOMContentLoaded":
        this.checkDocument();
        break;
      default:
        Components.utils.reportError("ShieldSearchNudges: unknown event.");
        break;
    }
  },

  receiveMessage(message) {
    switch (message.name) {
      case "ShieldSearchNudges:UpdateEngineOrigin":
        this.currentEngineOrigin = message.data.origin;
        this.checkDocument();
        break;
      default:
        Components.utils.reportError("ShieldSearchNudges: unknown message.");
        break;
    }
  },

  async checkDocument() {
    if (!this.currentEngineOrigin) {
      return;
    }
    const url = global.content && global.content.document.documentURI.replace(/[\\/?#]+$/, "");
    if (url == "about:home" || url == "about:newtab") {
      sendAsyncMessage("ShieldSearchNudges:OnHomePage");
    } else if (this.currentEngineOrigin.startsWith(url)) {
      sendAsyncMessage("ShieldSearchNudges:OnEnginePage");
    }
  },

  deinit() {
    global.removeEventListener("DOMContentLoaded", this);
    global.removeMessageListener("ShieldSearchNudges:UpdateEngineOrigin", this);
  }
};

ShieldSearchNudges.init();
