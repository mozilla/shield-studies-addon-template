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
* Set `shieldStudy.logLevel` to `info`. This permits shield-add-on log output in browser console.
* (If Pioneer study) Make sure that the [Firefox Pioneer Add-on](https://addons.mozilla.org/en-US/firefox/addon/firefox-pioneer/) is installed
* Set `extensions.button-icon-preference_shield_mozilla_org.test.variationName` to `kittens` (or any other study variation/branch to test specifically)
* Go to [this study's tracking bug](tbd: replace with your study's launch bug link in bugzilla) and install the latest add-on zip file
* (If you are installing an unsigned version of the add-on, you need to set `extensions.legacy.enabled` to `true` before installing the add-on)

## Expected User Experience / Functionality

Users see:

* An icon in the browser address bar (webExtension BrowserAction) with one of 3 images (Cat, Dog, Lizard)

Clicking on the button:

* Changes the badge
* Sends telemetry

ONCE ONLY users see:

* A notification bar, introducing the feature
* Allowing them to opt out

Icon will be the same every run.

If the user clicks on the badge more than 3 times, it ends the study.

### Do these tests

1. UI APPEARANCE. OBSERVE a notification bar with these traits:

   * Icon is 'heartbeat'
   * Text is "Welcome to the new feature! Look for changes!",
   * Clickable buttons with labels 'Thanks!' AND 'I do not want this.'
   * An `x` button at the right that closes the notice.

   Test fails IF:

   * There is no bar.
   * Elements are not correct or are not displayed

2. UI functionality: Thanks!

   * Click on the 'Thanks!' button
   * Verify that the notification bar closes

3. UI functionality: I do not want this.

   * Click on the 'I do not want this.' button
   * Verify that the notification bar closes
   * Verify that the study ends
   * Verify that sent Telemetry is correct
   * Verify that the ending is `introduction-leave-study`

4. UI functionality `too-popular`

   * Click on the web extension's icon three times
   * Verify that the study ends
   * Verify that sent Telemetry is correct
   * Verify that the ending is `too-popular`
   * Verify that the user is sent to the URL specified in `src/studySetup.js` under `endings -> too-popular`.

### Design

Any UI in a Shield study should be consistent with standard Firefox design specifications. These standards can be found at [design.firefox.com](https://design.firefox.com/photon/welcome.html). Firefox logo specifications can be found [here](https://design.firefox.com/photon/visuals/product-identity-assets.html).

### Note: checking "sent Telemetry is correct"

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) log output from the add-on.
* To inspect the (unencrypted) contents individual telemetry packets, set `shieldStudy.logLevel` to `all`. This permits debug-level shield-add-on log output in the browser console. Note that this will negatively affect the performance of Firefox.
* To see the actual (encrypted if Pioneer study) payloads, go to `about:telemetry` -> Click `current ping` -> Select `Archived ping data` -> Ping Type `pioneer-study` -> Choose a payload -> Raw Payload

See [TELEMETRY.md](./TELEMETRY.md) for more details on what pings are sent by this add-on.

## Debug

To debug installation and loading of the add-on:

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) and log output from the add-on.
