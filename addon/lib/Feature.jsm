"use strict";

/**
 * Feature module for the Search Nudges Shield Study.
 **/

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(EXPORTED_SYMBOLS|Feature)" }]*/

const { utils: Cu, interfaces: Ci } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "UITour",
  "resource:///modules/UITour.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "clearInterval",
  "resource://gre/modules/Timer.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "setInterval",
  "resource://gre/modules/Timer.jsm");

const EXPORTED_SYMBOLS = ["Feature"];
const NUDGES_SHOWN_COUNT_MAX = 4;
const PREF_NUDGES_SHOWN_COUNT = "extensions.shield-search-nudges.shown_count";
const PREF_NUDGES_DISMISSED_CLICKAB = "extensions.shield-search-nudges.clicked-awesomebar";
const PREF_NUDGES_DISMISSED_WITHOK = "extensions.shield-search-nudges.oked";
const SEARCH_ENGINE_TOPIC = "browser-search-engine-modified";
const SEARCH_SERVICE_TOPIC = "browser-search-service";
const STRING_TIP_GENERAL = "urlbarSearchTip.onboarding";
const STRING_TIP_REDIRECT = "urlbarSearchTip.engineIsCurrentPage";
const TIP_PANEL_ID = "shield-search-nudges-panel";
const TIP_ANCHOR_SELECTOR = "#identity-icon";

/**
 * Return a browser window as soon as possible. If there's no window available
 * yet, simply wait for the first browser window to open.
 */
async function getBrowserWindow() {
  const window = Services.wm.getMostRecentWindow("navigator:browser");
  if (window) {
    return window;
  }

  return waitForCondition(() => Services.wm.getMostRecentWindow("navigator:browser"));
}

function waitForCondition(condition, msg, interval = 100, maxTries = 50) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const intervalID = setInterval(async function() {
      if (tries >= maxTries) {
        clearInterval(intervalID);
        msg += ` - timed out after ${maxTries} tries.`;
        reject(msg);
        return;
      }

      let conditionPassed = false;
      try {
        conditionPassed = await condition();
      } catch (e) {
        msg += ` - threw exception: ${e}`;
        clearInterval(intervalID);
        reject(msg);
        return;
      }

      if (conditionPassed) {
        clearInterval(intervalID);
        resolve(conditionPassed);
      }
      tries++;
    }, interval);
  });
}

function getFocusedBrowserWindow() {
  const window = Services.focus.activeWindow;
  return window && window.document.documentURI == "chrome://browser/content/browser.xul" ?
    window : Services.wm.getMostRecentWindow("navigator:browser");
}

class Feature {
  /**
   * The feature this study implements.
   *
   *  - studyUtils:  the configured studyUtils singleton.
   *  - reasonName: string of bootstrap.js startup/shutdown reason
   *
   */
  constructor(studyUtils, reasonName, log, libPath) {
    this.studyUtils = studyUtils;
    this.reasonName = reasonName;
    this.log = log;
    this.libPath = libPath;
    this.frameScript = `${this.libPath}/shield-search-nudges-content.js`;

    // Example log statement
    this.log.debug("Feature constructor");
  }

  async getMessageManager() {
    const window = await getBrowserWindow();
    if (!window) {
      return null;
    }

    return window.getGroupMessageManager("browsers");
  }

  async start() {
    this.log.debug("Feature start");

    // Perform something only during INSTALL = a new study period begins.
    if (this.reasonName === "ADDON_INSTALL") {
      this.resetPrefs();
    }

    await this.loadFrameScript();
    await this.connectWithSearch();
  }

  /**
   * Resets the pref to their default values. 
   * @return {[type]} [description]
   */
  resetPrefs() {
    Services.prefs.setIntPref(PREF_NUDGES_SHOWN_COUNT, 0);
    Services.prefs.setBoolPref(PREF_NUDGES_DISMISSED_CLICKAB, false);
    Services.prefs.setBoolPref(PREF_NUDGES_DISMISSED_WITHOK, false);
  }

  /**
   * Load a frame script that will be available to each browser window.
   */
  async loadFrameScript() {
    const mm = await this.getMessageManager();
    if (!mm) {
      return;
    }
    mm.loadFrameScript(this.frameScript, true);
    mm.addMessageListener("ShieldSearchNudges:OnEnginePage", this);
    mm.addMessageListener("ShieldSearchNudges:OnHomePage", this);
  }

  async connectWithSearch() {
    await new Promise(resolve => {
      if (Services.search.isInitialized) {
        resolve();
        return;
      }
      Services.obs.addObserver(function observer(subject, topic, data) {
        if (data != "init-complete") {
          return;
        }
        Services.obs.removeObserver(observer, SEARCH_SERVICE_TOPIC);
        resolve();
      }, SEARCH_SERVICE_TOPIC);
    });

    Services.obs.addObserver(this, SEARCH_ENGINE_TOPIC);

    await this.sendCurrentEngineToContent();
  }

  /**
   * Called at end of study, and if the user disables the study or it gets
   * uninstalled by other means.
   *
   * @param {Boolean} [isUninstall]
   */
  async shutdown(isUninstall = false) {
    const window = await getBrowserWindow();
    if (!window) {
      return;
    }

    const mm = window.getGroupMessageManager("browsers");
    mm.removeMessageListener("ShieldSearchNudges:OnEnginePage", this);
    mm.removeMessageListener("ShieldSearchNudges:OnHomePage", this);
    // Unload the frame script.
    mm.loadFrameScript("data,:!!ShieldSearchNudges && ShieldSearchNudges.deinit();" +
      "ShieldSearchNudges = null; Components.utils.forceGC();", true);
    Services.obs.removeObserver(this, SEARCH_ENGINE_TOPIC);

    if (this.panel) {
      this.panel.removeNode();
    }
  }

  receiveMessage(message) {
    dump("INCOMING!! " + message.name + "\n");
    switch (message.name) {
      case "ShieldSearchNudges:OnEnginePage":
        this.maybeShowRedirectTip();
        break;
      case "ShieldSearchNudges:OnHomePage":
        this.maybeShowGeneralTip();
        break;
      default:
        Cu.reportError("ShieldSearchNudges: unknown message name.");
        break;
    }
  }

  observe(engine, topic, verb) {
    if (topic != SEARCH_ENGINE_TOPIC || ver != "engine-current") {
      return;
    }
    this.sendCurrentEngineToContent();
  }

  handleEvent(event) {
    // Button was clicked!!
  }

  async sendCurrentEngineToContent() {
    const mm = await this.getMessageManager();
    if (!mm) {
      return;
    }

    const engine = Services.search.currentEngine.wrappedJSObject;
    let origin = "";
    if (engine._isDefault) {
      origin = new URL(engine.getSubmission("").uri.spec).origin;
    }
    mm.broadcastAsyncMessage("ShieldSearchNudges:UpdateEngineOrigin", {origin});
  }

  maybeShowGeneralTip() {
    const window = this._getWindowIfNotExpired();
    if (!window) {
      return;
    }

    this._showTip(window, "general");
  }

  maybeShowRedirectTip() {
    const window = this._getWindowIfNotExpired();
    if (!window) {
      return;
    }

    this._showTip(window, "redirect");
  }

  /**
   * None of the tips (or nudges) are allowed to be shown when one of these
   * conditions has been met:
   *
   * 1. The AwesomeBar was clicked whilst one of the tips was shown,
   * 2. One of the tips was dismissed by clicking the 'Okay, got it' button,
   * 3. The tips were shown more than four times in sum.
   * 
   * @return {Boolean}
   */
  hasExpired() {
    return Services.prefs.getBoolPref(PREF_NUDGES_DISMISSED_CLICKAB, false) ||
      Services.prefs.getBoolPref(PREF_NUDGES_DISMISSED_WITHOK, false) ||
      Services.prefs.getIntPref(PREF_NUDGES_SHOWN_COUNT, 0) > NUDGES_SHOWN_COUNT_MAX;
  }

  /**
   * Good practice to have the literal 'sending' be wrapped up
   *
   * @param {Object} stringStringMap
   */
  telemetry(stringStringMap) {
    this.studyUtils.telemetry(stringStringMap);
  }

  async _showTip(window, type) {
    const anchor = window.document.querySelector(TIP_ANCHOR_SELECTOR);
    dump("SHOW TIP?? " + anchor + "\n");
    if (!anchor) {
      return;
    }

    const engine = Services.search.currentEngine;
    const [button, content] = await this._getStrings(window, type, engine);
dump("2. SHOW TIP?? " + button + ", " + content + "\n");
    const {panel, panelBody, panelImage, panelDescription, panelButton} = this._ensurePanel(window);
    panelImage.src = engine.iconURI.spec;
    panelDescription.textContent = content;
    panelButton.setAttribute("label", button);
    panel.hidden = false;
dump("3. SHOW TIP??\n");
    panel.openPopup(anchor, "bottomcenter topright", 0, 0);

    // UITour.showInfo(window, anchor, "", content, engine.iconURI.spec, [
    //   {
    //     style: "primary",
    //     label: "Okay, got it",
    //     callback() {
    //       Cu.reportError("OHAI!!");
    //       Services.prefs.setBoolPref(PREF_NUDGES_DISMISSED_WITHOK, true);
    //     }
    //   }
    // ]);
  }

  async _getStrings(window, type, engine) {
    if (!this._okayString) {
      const asStrings = await new Promise(async resolve => {
        let data = {};
        try {
          const locale = Cc["@mozilla.org/browser/aboutnewtab-service;1"]
            .getService(Ci.nsIAboutNewTabService).activityStreamLocale;
          const request = await fetch(`resource://activity-stream/prerendered/${locale}/activity-stream-strings.js`);
          const text = await request.text();
          const [json] = text.match(/{[^]*}/);
          data = JSON.parse(json);
        } catch (ex) {
          Cu.reportError("Failed to load strings for Activity Stream about:preferences");
        }
        resolve(data);
      });
      this._okayString = asStrings.section_disclaimer_topstories_buttontext || "Okay, got it";
    }

    const bundle = window.gBrowserBundle;
    return [this._okayString, bundle.formatStringFromName(type == "general" ?
      STRING_TIP_GENERAL : STRING_TIP_REDIRECT, [engine.name], 1)];
  }

  _ensurePanel(window) {
    // <panel id="UITourTooltip"
    //    type="arrow"
    //    hidden="true"
    //    noautofocus="true"
    //    align="start"
    //    orient="vertical"
    //    role="alert">
    //   <vbox>
    //     <hbox id="UITourTooltipBody">
    //       <image id="UITourTooltipIcon"/>
    //       <vbox flex="1">
    //         <description id="UITourTooltipDescription" flex="1"/>
    //       </vbox>
    //     </hbox>
    //     <hbox id="UITourTooltipButtons" flex="1" align="center"/>
    //   </vbox>
    // </panel>

    const {document} = window;
    let panel = document.getElementById(TIP_PANEL_ID);
    if (panel) {
      if (panel.state == "showing" || panel.state == "open") {
        panel.hidePopup();
      }
      return {
        panel,
        panelBody: panel.querySelector("vbox > hbox"),
        panelImage: panel.querySelector("vbox > hbox > image"),
        panelDescription: panel.querySelector("vbox > hbox > vbox > description"),
        panelButton: panel.querySelector("vbox > button")
      };
    }

    panel = document.createElement("panel");
    const attrs = [["id", TIP_PANEL_ID], ["type", "arrow"], ["hidden", "true"],
      ["noautofocus", "true"], ["align", "start"], ["orient", "vertical"], ["role", "alert"],
      ["style", "max-width: 30em"]];
    for (let [name, value] of attrs) {
      panel.setAttribute(name, value);
    }

    const panelBody = panel.appendChild(document.createElement("vbox"))
      .appendChild(document.createElement("hbox"));
    const panelImage = panelBody.appendChild(document.createElement("image"));
    const panelDescription = panelBody.appendChild(document.createElement("vbox"))
      .appendChild(document.createElement("description"));
    const panelButton = panelBody.parentNode/*.appendChild(document.createElement("hbox"))*/
      .appendChild(document.createElement("button"));
    panelButton.setAttribute("style", "-moz-appearance: none; margin: 1em -16px -16px; border: none; border-top-color: currentcolor; border-top-style: none; border-top-width: medium; border-top: 1px solid var(--panel-separator-color); padding: 8px 20px; color: inherit; background-color: transparent;");
    for (let flexElement of [panelDescription, panelDescription.parentNode, panelButton.parentNode]) {
      flexElement.setAttribute("flex", "1");
    }

    document.documentElement.appendChild(panel);
    panelButton.addEventListener("command", this);

    return {panel, panelBody, panelImage, panelDescription, panelButton};
  }

  _getWindowIfNotExpired() {
    if (this.hasExpired()) {
      // TODO: end the study?
      return null;
    }

    // `getFocusedBrowserWindow` may return `null` when the focused window is
    // _not_ a browser window, but that's ok - in that case we don't want to show
    // a tip (or nudge) anyway.
    return getFocusedBrowserWindow();
  }
}

// webpack:`libraryTarget: 'this'`
this.EXPORTED_SYMBOLS = EXPORTED_SYMBOLS;
this.Feature = Feature;
