# Test plan for this add-on

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Manual / QA TEST Instructions](#manual--qa-test-instructions)
  * [Preparations](#preparations)
  * [Install the add-on and enroll in the study](#install-the-add-on-and-enroll-in-the-study)
* [Expected User Experience / Functionality](#expected-user-experience--functionality)
  * [Do these tests (in addition to ordinary regression tests)](#do-these-tests-in-addition-to-ordinary-regression-tests)
  * [Note: checking "sent telemetry is correct"](#note-checking-sent-telemetry-is-correct)
* [Debug](#debug)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Manual / QA TEST Instructions

### Preparations

* Download a Release version of Firefox

### Install the add-on and enroll in the study

* (Create profile: <https://developer.mozilla.org/Firefox/Multiple_profiles>, or via some other method)
* Navigate to _about:config_ and set the following preferences. (If a preference does not exist, create it be right-clicking in the white area and selecting New -> String)
* Set `shieldStudy.logLevel` to `info`. This permits shield-add-on log output in browser console.
* Set `extensions.federated-learning-v2_shield_mozilla_org.test.variationName` to `treatment` (or any other study variation/branch to test specifically)
* Go to [this study's tracking bug](tbd: replace with your study's launch bug link in bugzilla) and install the latest add-on zip file
* (If you are installing an unsigned version of the add-on, you need to set `extensions.legacy.enabled` to `true` before installing the add-on)

## Expected User Experience / Functionality

No user interface elements are modified directly in this study.

The awesome bar is observed and an updated model is calculated and submitted via telemetry after every interaction.

Depending on the study branch (see configuration in [../src/feature.js]()), a remote model may be fetched and applied locally (`validation: true`).

### Do these tests (in addition to ordinary regression tests)

**Fetching of the latest upstream model at study start**

* Install the add-on as per above
* Verify that the study runs
* Verify that the study add-on log out includes "Fetching model" and "Applying frecency weights"

**Fetching of the latest upstream model periodically**

* Install the add-on as per above
* Verify that the study runs
* Verify that the study add-on log out includes "Fetching model" and "Applying frecency weights" every 5 minutes, starting from a full hour (eg 12:00, 12:05, 12:10 etc)

**Sending of the updated model**

* Install the add-on as per above
* Verify that the study runs
* Open up a new tab and write "example.com" + ENTER
* Close the tab
* Open up a new tab and start writing "example.com"
* Instead of pressing ENTER, choose the "example.com" history entry in the suggestions that are shown (history entries have a wireframe globe as an icon)
* Verify that sent telemetry is correct

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

**Correct branches and weights**

* Make sure that the branches and weights in the add-on configuration ([../src/studySetup.js](../src/studySetup.js)) corresponds to the branch weights of the Experimenter entry.

### Note: checking "sent telemetry is correct"

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) log output from the add-on.
* To inspect the (unencrypted) contents individual telemetry packets, set `shieldStudy.logLevel` to `all`. This permits debug-level shield-add-on log output in the browser console. Note that this may negatively affect the performance of Firefox.
* To see the actual payloads, go to `about:telemetry` -> Click `current ping` -> Select `Archived ping data` -> Ping Type `pioneer-study` -> Choose a payload -> Raw Payload

See [TELEMETRY.md](./TELEMETRY.md) for more details on what pings are sent by this add-on.

## Debug

To debug installation and loading of the add-on:

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) and log output from the add-on.
