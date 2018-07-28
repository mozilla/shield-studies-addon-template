"use strict";

/* global ExtensionAPI */

ChromeUtils.import("resource://gre/modules/Console.jsm");
ChromeUtils.import("resource://gre/modules/Services.jsm");
ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");
ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
ChromeUtils.import("resource://gre/modules/ExtensionUtils.jsm");

/* eslint-disable no-undef */
const { EventManager } = ExtensionCommon;
const EventEmitter =
  ExtensionCommon.EventEmitter || ExtensionUtils.EventEmitter;

// eslint-disable-next-line no-undef
XPCOMUtils.defineLazyModuleGetter(
  this,
  "BrowserWindowTracker",
  "resource:///modules/BrowserWindowTracker.jsm",
);

/** Return most recent NON-PRIVATE browser window, so that we can
 * manipulate chrome elements on it.
 */
function getMostRecentBrowserWindow() {
  return BrowserWindowTracker.getTopWindow({
    private: false,
    allowPopups: false,
  });
}

/** Display instrumented 'notification bar' explaining the feature to the user
 *
 *   Telemetry Probes:
 *
 *   - {event: introduction-shown}
 *
 *   - {event: introduction-accept}
 *
 *   - {event: introduction-leave-study}
 *
 *    Note:  Bar WILL NOT SHOW if the only window open is a private window.
 *
 *    Note:  Handling of 'x' is not implemented.  For more complete implementation:
 *
 *      https://github.com/gregglind/57-perception-shield-study/blob/680124a/addon/lib/Feature.jsm#L148-L152
 *
 */
class IntroductionNotificationBarEventEmitter extends EventEmitter {
  emitShow(variationName) {
    const self = this;
    const recentWindow = getMostRecentBrowserWindow();
    const doc = recentWindow.document;
    const notificationBox = doc.querySelector(
      "#high-priority-global-notificationbox",
    );

    if (!notificationBox) return;

    // api: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Method/appendNotification
    const notice = notificationBox.appendNotification(
      "Welcome to the new feature! Look for changes!",
      "feature orienation",
      null, // icon
      notificationBox.PRIORITY_INFO_HIGH, // priority
      // buttons
      [
        {
          label: "Thanks!",
          isDefault: true,
          callback: function acceptButton() {
            // eslint-disable-next-line no-console
            console.log("clicked THANKS!");
            self.emit("introduction-accept");
          },
        },
        {
          label: "I do not want this.",
          callback: function leaveStudyButton() {
            // eslint-disable-next-line no-console
            console.log("clicked NO!");
            self.emit("introduction-leave-study");
          },
        },
      ],
      // callback for nb events
      null,
    );

    // used by testing to confirm the bar is set with the correct config
    notice.setAttribute("variation-name", variationName);

    self.emit("introduction-shown");
  }
}

this.introductionNotificationBar = class extends ExtensionAPI {
  /**
   * Extension Shutdown
   * APIs that allocate any resources (e.g., adding elements to the browser’s user interface,
   * setting up internal event listeners, etc.) must free these resources when the extension
   * for which they are allocated is shut down.
   */
  onShutdown(shutdownReason) {
    console.log("onShutdown", shutdownReason);
    // TODO: remove any active ui
  }

  getAPI(context) {
    const introductionNotificationBarEventEmitter = new IntroductionNotificationBarEventEmitter();
    return {
      introductionNotificationBar: {
        show() {
          introductionNotificationBarEventEmitter.emitShow();
        },
        onIntroductionShown: new EventManager(
          context,
          "introductionNotificationBar.onIntroductionShown",
          fire => {
            const listener = value => {
              fire.async(value);
            };
            introductionNotificationBarEventEmitter.on(
              "introduction-shown",
              listener,
            );
            return () => {
              introductionNotificationBarEventEmitter.off(
                "introduction-shown",
                listener,
              );
            };
          },
        ).api(),
        onIntroductionAccept: new EventManager(
          context,
          "introductionNotificationBar.onIntroductionAccept",
          fire => {
            const listener = value => {
              fire.async(value);
            };
            introductionNotificationBarEventEmitter.on(
              "introduction-accept",
              listener,
            );
            return () => {
              introductionNotificationBarEventEmitter.off(
                "introduction-accept",
                listener,
              );
            };
          },
        ).api(),
        onIntroductionLeaveStudy: new EventManager(
          context,
          "introductionNotificationBar.onIntroductionLeaveStudy",
          fire => {
            const listener = value => {
              fire.async(value);
            };
            introductionNotificationBarEventEmitter.on(
              "introduction-leave-study",
              listener,
            );
            return () => {
              introductionNotificationBarEventEmitter.off(
                "introduction-leave-study",
                listener,
              );
            };
          },
        ).api(),
      },
    };
  }
};
