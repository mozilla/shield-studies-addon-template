/* global ExtensionAPI */

this.feature = class extends ExtensionAPI {
  static onShutdown(shutdownReason) {
    console.log("onShutdown", shutdownReason);
  }

  getAPI(context) {
    const { studyUtils } = ChromeUtils.import(
      context.extension.getURL("privileged/shieldUtils/jsm/StudyUtils.jsm"),
    );
    const { Feature } = ChromeUtils.import(
      context.extension.getURL("privileged/feature/jsm/Feature.jsm"),
    );

    /*
    console.log("config", config);
    console.log("studyUtils", studyUtils);
    console.log("Feature", Feature);
    */

    const { startupReason } = this.extension;

    return {
      feature: {
        async start(variation) {
          this.feature = new Feature(variation, studyUtils, startupReason);
          return this.feature.start();
        },

        introductionNotificationBar() {
          this.feature.introductionNotificationBar();
        },
      },
    };
  }
};
