"use strict";

/**
  Remember:

  - all communication to the Legacy addon is via

    `browser.runtime.sendMessage`

  - only the webExtension can initiate messages.

  - this script runs when the 'toolbar button' is pushed

*/

// template code for talking to `studyUtils` using `browser.runtime.sendMessage`
async function msgStudyUtils(msg, data) {
  const allowed = ["endStudy", "telemetry", "info"];
  if (!allowed.includes(msg)) throw new Error(`shieldUtils doesn't know ${msg}, only knows ${allowed}`);
  try {
    const ans = await browser.runtime.sendMessage({shield: true, msg, data});
    return ans;
  } catch (e) {
    console.error("ERROR msgStudyUtils", msg, data, e);
    throw e
  }
}

class ButtonChoiceFeature {
  constructor(variation) {
    console.log("initilizing ButtonChoiceFeature:", variation.name);
    this.timesClickedInSession = 0;

    // set up the ui for this particular {variation}
    console.log("path:", `icons/${variation.name}.svg`)
    browser.browserAction.setIcon({path: `icons/${variation.name}.svg`});
    browser.browserAction.setTitle({title: variation.name});
    browser.browserAction.onClicked.addListener(() => this.handleButtonClick());
  }

  telemetry (data) {
    function throwIfInvalid (obj) {
      // simple check: all keys and values must be strings
      for (const k in obj) {
        if (typeof k !== 'string') throw new Error(`key ${k} not a string`);
        if (typeof obj[k] !== 'string') throw new Error(`value ${k} ${obj[k]} not a string`);
      }
      return true
    }
    throwIfInvalid(data);
    msgStudyUtils("telemetry", data);
  }

  handleButtonClick() {
    // note: doesn't persist across a session
    this.timesClickedInSession += 1;
    console.log("got a click", this.timesClickedInSession);
    browser.browserAction.setBadgeText({text: this.timesClickedInSession.toString()});

    // telemetry FIRST CLICK
    if (this.timesClickedInSession == 1) {
      this.telemetry({"event": "button-first-click-in-session"});
    }

    // telemetry EVERY CLICK
    this.telemetry({"event": "button-click", timesClickedInSession: ""+this.timesClickedInSession});

    // addon-initiated ending, 3 timesClickedInSession in a session
    if (this.timesClickedInSession >= 3) {
      msgStudyUtils("endStudy", {reason: "used-often"});
    }
  }
}

// initialize the feature, using our specific variation
msgStudyUtils("info").then(
  ({variation}) => new ButtonChoiceFeature(variation)
).catch(function defaultSetup() {
  // running web
  console.log("you must be running as part of `web-ext`.  You get 'corn dog'!");
  new ButtonChoiceFeature({"name": "isolatedcorndog"})
});
