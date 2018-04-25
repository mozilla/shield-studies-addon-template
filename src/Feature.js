/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(Feature)" }]*/

/**  Example Feature module for a Shield Study.
 *
 *  UI:
 *  - during INSTALL only, show a notification bar with 2 buttons:
 *    - "Thanks".  Accepts the study (optional)
 *    - "I don't want this".  Uninstalls the study.
 *
 *  Firefox code:
 *  - Implements the 'introduction' to the 'button choice' study, via notification bar.
 *
 *  Demonstrates `studyUtils` API:
 *
 *  - `telemetry` to instrument "shown", "accept", and "leave-study" events.
 *  - `endStudy` to send a custom study ending.
 *
 **/
class Feature {
  /** A Demonstration feature.
   *
   *  - variation: study info about particular client study variation
   *  - reason: string of background.js install/startup/shutdown reason
   *
   */
  constructor(variation, reason) {
    const feature = this;
    this.variation = variation; // unused.  Some other UI might use the specific variation info for things.
    this.reason = reason;

    // Initiate our browser action
    new BrowserActionButtonChoiceFeature(variation);

    // perform something only during INSTALL = a new study period begins
    if (this.reason === "install") {
      browser.introductionNotificationBar.onIntroductionShown.addListener(
        () => {
          console.log("onIntroductionShown");

          // used by testing to confirm the bar is set with the correct config
          // TODO: restore if necessary to restore the tests
          // notice.setAttribute("data-study-config", JSON.stringify(this.variation));

          feature.telemetry({
            event: "onIntroductionShown",
          });
        },
      );

      browser.introductionNotificationBar.onIntroductionAccept.addListener(
        () => {
          console.log("onIntroductionAccept");
          feature.telemetry({
            event: "onIntroductionAccept",
          });
        },
      );

      browser.introductionNotificationBar.onIntroductionLeaveStudy.addListener(
        () => {
          console.log("onIntroductionLeaveStudy");
          feature.telemetry({
            event: "onIntroductionLeaveStudy",
          });
          browser.study.endStudy("introduction-leave-study");
        },
      );

      browser.introductionNotificationBar.show();
    }
  }

  /* good practice to have the literal 'sending' be wrapped up */
  telemetry(stringStringMap) {
    browser.study.telemetry(stringStringMap);
  }

  /**
   * Called at end of study, and if the user disables the study or it gets uninstalled by other means.
   */
  shutdown() {}
}

class BrowserActionButtonChoiceFeature {
  /**
   * - set image, text, click handler (telemetry)
   */
  constructor(variation) {
    console.log(
      "Initializing BrowserActionButtonChoiceFeature:",
      variation.name,
    );
    this.timesClickedInSession = 0;

    // modify BrowserAction (button) ui for this particular {variation}
    console.log("path:", `icons/${variation.name}.svg`);
    // TODO: Running into an error "values is undefined" here
    browser.browserAction.setIcon({ path: `icons/${variation.name}.svg` });
    browser.browserAction.setTitle({ title: variation.name });
    browser.browserAction.onClicked.addListener(() => this.handleButtonClick());
    console.log("initialized");
  }

  /** handleButtonClick
   *
   * - instrument browserAction button clicks
   * - change label
   */
  handleButtonClick() {
    console.log("handleButtonClick");
    // note: doesn't persist across a session, unless you use localStorage or similar.
    this.timesClickedInSession += 1;
    console.log("got a click", this.timesClickedInSession);
    browser.browserAction.setBadgeText({
      text: this.timesClickedInSession.toString(),
    });

    // telemetry: FIRST CLICK
    if (this.timesClickedInSession === 1) {
      browser.study.sendTelemetry({ event: "button-first-click-in-session" });
    }

    // telemetry EVERY CLICK
    browser.study.sendTelemetry({
      event: "button-click",
      timesClickedInSession: "" + this.timesClickedInSession,
    });

    // webExtension-initiated ending for "used-often"
    //
    // - 3 timesClickedInSession in a session ends the study.
    // - see `../Config.jsm` for what happens during this ending.
    if (this.timesClickedInSession >= 3) {
      browser.study.endStudy("used-often");
    }
  }
}
