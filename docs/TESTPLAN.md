# Test plan for this add-on

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Manual / QA TEST Instructions](#manual--qa-test-instructions)
  * [Preparations](#preparations)
  * [Install the add-on and enroll in the study](#install-the-add-on-and-enroll-in-the-study)
* [Expected User Experience / Functionality](#expected-user-experience--functionality)
  * [Do these tests](#do-these-tests)
  * [Design](#design)
  * [Note: checking "sent Telemetry is correct"](#note-checking-sent-telemetry-is-correct)
* [Debug](#debug)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Manual / QA TEST Instructions

### Preparations

* Download a Release version of Firefox

### Install the add-on and enroll in the study

* (Create profile: <https://developer.mozilla.org/Firefox/Multiple_profiles>, or via some other method)
* Navigate to _about:config_ and set the following preferences. (If a preference does not exist, create it be right-clicking in the white area and selecting New -> String)
* Set `shieldStudy.logLevel` to `All`. This permits shield-add-on log output in browser console.
* Set `extensions.button-icon-preference_shield_mozilla_org.test.variationName` to `kittens` (or any other study variation/branch to test specifically)
* Go to [this study's tracking bug](tbd: replace with your study's launch bug link in bugzilla) and install the latest add-on zip file

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

### Design

Any UI in a Shield study should be consistent with standard Firefox design specifications. These standards can be found at [design.firefox.com](https://design.firefox.com/photon/welcome.html). Firefox logo specifications can be found [here](https://design.firefox.com/photon/visuals/product-identity-assets.html).

### Note: checking "sent Telemetry is correct"

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) log output from the add-on.

See [TELEMETRY.md](./TELEMETRY.md) for more details on what pings are sent by this add-on.

## Debug

To debug installation and loading of the add-on:

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) and log output from the add-on.
