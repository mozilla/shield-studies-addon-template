# Test plan for this add-on

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Manual / QA TEST Instructions](#manual--qa-test-instructions)
  * [Preparations](#preparations)
  * [Install the add-on and enroll in the study](#install-the-add-on-and-enroll-in-the-study)
* [Expected User Experience / Functionality](#expected-user-experience--functionality)
  * [Surveys](#surveys)
  * [Do these tests (in addition to ordinary regression tests)](#do-these-tests-in-addition-to-ordinary-regression-tests)
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

### Surveys

This study fires a survey at the following endings:

* `individual-opt-out`
* `expired`

### Do these tests (in addition to ordinary regression tests)

**UI appearance test 1**

* Install the add-on as per above
* Verify that the study runs
* OBSERVE a notification bar with these traits:
  * Icon is 'heartbeat'
  * Text is "Welcome to the new feature! Look for changes!",
  * Clickable buttons with labels 'Thanks!' AND 'I do not want this.'
  * An `x` button at the right that closes the notice.
* Test fails IF:
  * There is no bar.
  * Elements are not correct or are not displayed

**UI functionality test 1: Thanks!**

* Install the add-on as per above
* Verify that the study runs
* Click on the 'Thanks!' button
* Verify that the notification bar closes

**UI functionality test 2: I do not want this**

* Install the add-on as per above
* Verify that the study runs
* Click on the 'I do not want this.' button
* Verify that the notification bar closes
* Verify that the study ends
* Verify that sent Telemetry is correct
* Verify that the ending is `introduction-leave-study`

**UI functionality test 3: `too-popular`**

* Install the add-on as per above
* Verify that the study runs
* Click on the web extension's icon three times
* Verify that the study ends
* Verify that sent Telemetry is correct
* Verify that the ending is `too-popular`
* Verify that the user is sent to the URL specified in `src/studySetup.js` under `endings -> too-popular`.

(Template note: The above are example study-specific test instructions. Below are some general tests that probably should be kept in your study's test plan).

**Enabling of permanent private browsing before study has begun**

* Enable permanent private browsing
* Install the add-on as per above
* Verify that the study does not run

**Enabling of permanent private browsing after study has begun**

* Install the add-on as per above
* Verify that the study runs
* Enable permanent private browsing
* Verify that the study ends upon the subsequent restart of the browser

**Private browsing mode test 1**

* Install the add-on as per above
* Verify that the study runs
* Verify that no information is recorded and sent when private browsing mode is active

**Not showing in `about:addons`**

* Install the add-on as per above
* Verify that the study runs
* Verify that the study does not show up in `about:addons` (note: only signed study add-ons are hidden)

**Cleans up preferences upon Normandy unenrollment**

* Set the branch preference to one of the validation branches
* Enroll a client using the Normandy staging server
* Verify that the study runs
* Verify that `places.frecency.firstBucketCutoff` has a non-default value
* Unenroll a client using the Normandy staging server
* Verify that `places.frecency.firstBucketCutoff` has been restored to use the default value

**Correct branches and weights**

* Make sure that the branches and weights in the add-on configuration ([../src/studySetup.js](../src/studySetup.js)) corresponds to the branch weights of the Experimenter entry. (Note that for practical reasons, the implementation uses 7 branches instead of the 5 defined study branches. The study branches that separate use different populations for training and validation corresponding to separate branches in the implementation)

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
* Set `shieldStudy.logLevel` to `all`. This permits debug-level shield-add-on log output in the browser console.
