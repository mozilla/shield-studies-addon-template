# Test plan for this add-on

## Manual / QA TEST Instructions

### Preparations

* Download a Release version of Firefox

### Install the add-on and enroll in the study

* (Create profile: <https://developer.mozilla.org/Firefox/Multiple_profiles>, or via some other method)
* Navigate to _about:config_ and set the following preferences. (If a preference does not exist, create it be right-clicking in the white area and selecting New -> String or Integer depending on the type of preference)
* Set `extensions.legacy.enabled` to `true`. This permits the loading of the embedded Web Extension since new versions of Firefox are becoming restricted to pure Web Extensions only.
* Set `extensions.button_icon_preference.variation` to `kitten` (or any other study variation/branch to test specifically)
* Go to [this study's tracking bug](tbd: replace with your study's launch bug link in bugzilla) and install the latest signed XPI

## Expected User Experience / Functionality

Users see:

* an icon in the browser address bar (webExtension BrowserAction) with one of 3 images (Cat, Dog, Lizard)

Clicking on the button:

* changes the badge
* sends telemetry

ONCE ONLY users see:

* a notification bar, introducing the featur
* allowing them to opt out

Icon will be the same every run.

If the user clicks on the badge more than 3 times, it ends the study.

### Do these tests

1. UI APPEARANCE. OBSERVE a notification bar with these traits:

   * Icon is 'heartbeat'
   * Text is one of 8 selected "questions", such as: "Do you like Firefox?". These are listed in [/addon/Config.jsm](/addon/Config.jsm) as the variable `weightedVariations`.
   * clickable buttons with labels 'yes | not sure | no' OR 'no | not sure | yes' (50/50 chance of each)
   * an `x` button at the right that closes the notice.

   Test fails IF:

   * there is no bar.
   * elements are not correct or are not displaye

2. UI functionality: VOTE

   Expect: Click on a 'vote' button (any of: `yes | not sure | no`) has all these effects

   * notice closes
   * add-on uninstalls
   * no additional tabs open
   * telemetry pings are 'correct' with this SPECIFIC `study_state` as the ending

     * ending is `voted`
     * 'vote' is correct.

3. UI functionality: 'X' button

   Click on the 'x' button.

   * notice closes
   * add-on uninstalls
   * no additional tabs open
   * telemetry pings are 'correct' with this SPECIFIC ending

     * ending is `notification-x`

4. UI functionality 'close window'

   1. Open a 2nd Firefox window.
   2. Close the initial window.

   Then observe:

   * notice closes
   * add-on uninstalls
   * no additional tabs open
   * telemetry pings are 'correct' with this SPECIFIC ending

     * ending is `window-or-fx-closed`

5. UI functionality 'too-popular'

   * Click on the web extension's icon three times
   * Verify that the study ends
   * Verify that sent Telemetry is correct
   * Verify that the user is sent to the URL specified in `addon/Config.jsm` under `endings -> too-popular`.

### Note: checking "sent Telemetry is correct"

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) log output from the add-on.

See [TELEMETRY.md](./TELEMETRY.md) for more details on what pings are sent by this add-on.

## Debug

To debug installation and loading of the add-on:

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) and log output from the add-on.

Example log output after installing the add-on:

```
install 5  bootstrap.js:125
startup ADDON_INSTALL  bootstrap.js:33
info {"studyName":"mostImportantExperiment","addon":{"id":"template-shield-study@mozilla.com","version":"1.0.0"},"variation":{"name":"kittens"},"shieldId":"8bb19b5c-99d0-cc48-ba95-c73f662bd9b3"}  bootstrap.js:67
1508111525396	shield-study-utils	DEBUG	log made: shield-study-utils
1508111525398	shield-study-utils	DEBUG	setting up!
1508111525421	shield-study-utils	DEBUG	firstSeen
1508111525421	shield-study-utils	DEBUG	telemetry in:  shield-study {"study_state":"enter"}
1508111525421	shield-study-utils	DEBUG	getting info
1508111525423	shield-study-utils	DEBUG	telemetry: {"version":3,"study_name":"mostImportantExperiment","branch":"kittens","addon_version":"1.0.0","shield_version":"4.1.0","type":"shield-study","data":{"study_state":"enter"},"testing":true}
1508111525430	shield-study-utils	DEBUG	startup 5
1508111525431	shield-study-utils	DEBUG	getting info
1508111525431	shield-study-utils	DEBUG	marking TelemetryEnvironment: mostImportantExperiment
1508111525476	shield-study-utils	DEBUG	telemetry in:  shield-study {"study_state":"installed"}
1508111525477	shield-study-utils	DEBUG	getting info
1508111525477	shield-study-utils	DEBUG	telemetry: {"version":3,"study_name":"mostImportantExperiment","branch":"kittens","addon_version":"1.0.0","shield_version":"4.1.0","type":"shield-study","data":{"study_state":"installed"},"testing":true}
1508111525479	shield-study-utils	DEBUG	getting info
1508111525686	shield-study-utils	DEBUG	getting info
1508111525686	shield-study-utils	DEBUG	respondingTo: info
init kittens  background.js:29:5
```
