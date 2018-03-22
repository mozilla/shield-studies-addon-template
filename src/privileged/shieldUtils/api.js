/* global ExtensionAPI */

this.shieldUtils = class extends ExtensionAPI {
  /**
   * We don't need to override the constructor for other
   * reasons than to clarify the class member "extension"
   * being of type Extension
   *
   * @param extension Extension
   */
  constructor(extension) {
    super(extension);
    /**
     * @type Extension
     */
    this.extension = extension;
  }

  /**
   * Extension Shutdown
   * APIs that allocate any resources (e.g., adding elements to the browser’s user interface,
   * setting up internal event listeners, etc.) must free these resources when the extension
   * for which they are allocated is shut down.
   */
  onShutdown(shutdownReason) {
    console.log("onShutdown", shutdownReason);
    // TODO: debootstrap study
  }

  getAPI(context) {
    const { config } = ChromeUtils.import(
      context.extension.getURL("privileged/Config.jsm"),
    );

    // TODO: Select classes to import based on config (Pioneer or not)
    const { studyUtils } = ChromeUtils.import(
      context.extension.getURL("privileged/shieldUtils/jsm/StudyUtils.jsm"),
    );
    const studyUtilsBootstrap = ChromeUtils.import(
      context.extension.getURL(
        "privileged/shieldUtils/jsm/StudyUtilsBootstrap.jsm",
      ),
    );
    // const { PioneerUtils } = ChromeUtils.import(context.extension.getURL("privileged/shieldUtils/jsm/PioneerUtils.jsm"));
    // const { PioneerUtilsBootstrap } = ChromeUtils.import(context.extension.getURL("privileged/shieldUtils/jsm/PioneerUtilsBootstrap.jsm"));
    const bootstrap = studyUtilsBootstrap.Bootstrap(config, studyUtils);

    /*
    console.log("config", config);
    console.log("studyUtils", studyUtils);
    console.log("studyUtilsBootstrap", studyUtilsBootstrap);
    console.log("bootstrap", bootstrap);
    console.log("this.extension", this.extension);
    */

    const { extension } = this;

    // console.log("PioneerUtils", PioneerUtils);

    return {
      shieldUtils: {
        /**
         * ensure we have configured shieldUtils and are supposed to run our feature
         * @returns {Promise<void>}
         */
        async bootstrapStudy() {
          await bootstrap.startup(extension);
        },

        /**
         * current studyUtils configuration, including 'variation'
         * @returns {Promise<void>}
         */
        async info() {
          return studyUtils.info();
        },

        /**
         *
         * `telemetry`
         *
         * - check all pings for validity as "shield-study-addon" pings
         * - send a 'shield-study-addon' packet
         *
         * Good practice: send all Telemetry from one function for easier
         * logging, debugging, validation
         *
         * Note: keys, values must be strings to fulfill the `shield-study-addon`
         *   ping-type validation.  This allows `payload.data.attributes` to store
         *   correctly at Parquet at s.t.m.o.
         *
         *   Bold claim:  catching errors here
         *
         */
        async telemetry(data) {
          function throwIfInvalid(obj) {
            // Check: all keys and values must be strings,
            for (const k in obj) {
              if (typeof k !== "string")
                throw new Error(`key ${k} not a string`);
              if (typeof obj[k] !== "string")
                throw new Error(`value ${k} ${obj[k]} not a string`);
            }
            return true;
          }

          throwIfInvalid(data);
          studyUtils.telemetry(data);
        },

        /**
         * for ending a study
         * @param data
         * @returns {Promise<void>}
         */
        async endStudy(data) {
          studyUtils.endStudy(data);
        },
      },
    };
  }
};
