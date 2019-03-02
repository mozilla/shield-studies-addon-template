/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(feature)" }]*/

/**
 * **Example template documentation - remove or replace this jsdoc in your study**
 *
 * Example Feature module for a Shield Study.
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
  constructor() {}

  /**
   * @param {Object} studyInfo Study info
   * @returns {Promise<*>} Promise that resolves after configure
   */
  async configure(studyInfo) {
    const feature = this;
    const { variation, isFirstRun } = studyInfo;

    // Initiate our browser action
    const browserActionButtonChoiceFeature = new BrowserActionButtonChoiceFeature();
    await browserActionButtonChoiceFeature.configure(variation);

    // perform something only during first run
    if (isFirstRun) {
      await browser.study.logger.log(
        "First run. showing introduction notification bar",
      );

      browser.introductionNotificationBar.onIntroductionShown.addListener(
        async() => {
          await browser.study.logger.log("onIntroductionShown");

          feature.sendTelemetry({
            event: "onIntroductionShown",
          });
        },
      );

      browser.introductionNotificationBar.onIntroductionAccept.addListener(
        async() => {
          await browser.study.logger.log("onIntroductionAccept");
          feature.sendTelemetry({
            event: "onIntroductionAccept",
          });
        },
      );

      browser.introductionNotificationBar.onIntroductionLeaveStudy.addListener(
        async() => {
          await browser.study.logger.log("onIntroductionLeaveStudy");
          feature.sendTelemetry({
            event: "onIntroductionLeaveStudy",
          });
          browser.study.endStudy("introduction-leave-study");
        },
      );

      browser.introductionNotificationBar.show(variation.name);
    }
  }

  /* good practice to have the literal 'sending' be wrapped up */
  async sendTelemetry(payload) {
    if (await browser.privacyContext.aPrivateBrowserWindowIsOpen()) {
      // drop the ping - do not send any telemetry
      return false;
    }

    await browser.study.logger.debug([
      "Telemetry about to be validated using browser.study.validateJSON",
      payload,
    ]);

    const payloadSchema = {
      type: "object",
      properties: {
        event: {
          type: "string",
        },
        timesClickedInSession: {
          type: "number",
          minimum: 0,
        },
      },
      required: ["event"],
    };
    const validationResult = await browser.study.validateJSON(
      payload,
      payloadSchema,
    );

    // Use to update study.payload.schema.json
    // console.log(JSON.stringify(payloadSchema));

    if (!validationResult.valid) {
      await browser.study.logger.error([
        "Invalid telemetry payload",
        { payload, validationResult },
      ]);
      throw new Error("Invalid telemetry payload");
    }

    // Submit ping using a custom schema/topic
    /*
    await browser.telemetry.submitPing("study-schema-foo", payload, {
      addClientId: true,
    });
    */

    // Submit ping using study utils - allows for automatic querying of study data in re:dash
    const shieldStudyAddonPayload = {
      event: String(payload.event),
      timesClickedInSession: String(payload.timesClickedInSession),
    };
    await browser.study.sendTelemetry(shieldStudyAddonPayload);
    await browser.study.logger.log("Telemetry submitted:");
    await browser.study.logger.log({ payload, shieldStudyAddonPayload });
    return true;
  }

  /**
   * Called at end of study, and if the user disables the study or it gets uninstalled by other means.
   * @returns {Promise<*>} Promise that resolves after cleanup
   */
  async cleanup() {}

  /**
   * Example of a static utility function that can be unit-tested
   *
   * @param {Object} variation The study variation
   * @returns {string} The path to the variation's icon
   */
  static iconPath(variation) {
    return `icons/${variation.name}.svg`;
  }
}

/**
 * **Example browser action handling code - remove or replace in your study**
 */
class BrowserActionButtonChoiceFeature {
  /**
   * - set image, text, click handler (telemetry)
   * @param {Object} variation The study variation
   * @returns {Promise<*>} Promise that resolves after configuration
   */
  async configure(variation) {
    await browser.study.logger.log(
      "Initializing BrowserActionButtonChoiceFeature:",
      variation.name,
    );
    this.timesClickedInSession = 0;

    // modify BrowserAction (button) ui for this particular {variation}
    await browser.study.logger.log("path:", `icons/${variation.name}.svg`);
    // TODO: Running into an error "values is undefined" here
    browser.browserAction.setIcon({ path: Feature.iconPath(variation) });
    browser.browserAction.setTitle({ title: variation.name });
    browser.browserAction.onClicked.addListener(() => this.handleButtonClick());
    await browser.study.logger.log("initialized");
  }

  /**
   * handleButtonClick
   *
   * - instrument browserAction button clicks
   * - change label
   * @returns {Promise<*>} Promise that resolves after handling
   */
  async handleButtonClick() {
    await browser.study.logger.log("handleButtonClick");
    // note: doesn't persist across a session, unless you use localStorage or similar.
    this.timesClickedInSession += 1;
    await browser.study.logger.log("got a click", this.timesClickedInSession);
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
      timesClickedInSession: this.timesClickedInSession,
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

// make an instance of the feature class available to background.js
// construct only. will be configured after setup
window.feature = new Feature();
