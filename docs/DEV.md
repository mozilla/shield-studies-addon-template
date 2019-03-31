# Developing this add-on

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Preparations](#preparations)
* [Getting started](#getting-started)
* [Details](#details)
* [Loading the Web Extension in Firefox](#loading-the-web-extension-in-firefox)
* [Seeing the add-on in action](#seeing-the-add-on-in-action)
* [Format code using prettier and eslint --fix](#format-code-using-prettier-and-eslint---fix)
* [Generate stub code and API docs](#generate-stub-code-and-api-docs)
* [Manual testing](#manual-testing)
* [Automated testing](#automated-testing)
  * [Unit tests](#unit-tests)
  * [Functional tests](#functional-tests)
* [Directory Structure and Files](#directory-structure-and-files)
* [General Shield Study Engineering](#general-shield-study-engineering)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Preparations

* Download Developer and Nightly versions of Firefox (only Developer/Nightly will allow bundled web extension experiments, and Developer is the default target for the automated tests)

## Getting started

```shell
# install dependencies
npm install

## run
npm start

## run and reload on filechanges
npm run watch

## lint
npm run lint

## build
npm run build
```

Use [../web-ext-config.js](../web-ext-config.js) to configure testing preferences and which Firefox flavor the above commands should use. (Pioneer studies note: web-ext can not be used to launch Pioneer studies - refer to the Manual testing section below for Pioneer studies).

## Details

First, make sure you are on NPM 8+ installed:

```shell
npm install -g npm
```

Clone the repo:

```shell
git clone https://github.com/mozilla/shield-studies-addon-template.git
```

After cloning the repo, you can run the following commands from the top level directory, one after another:

```shell
npm install
npm run build
```

This packages the add-on into an zip file which is stored in `dist/`. This file is what you load into Firefox.

## Loading the Web Extension in Firefox

You can have Firefox automatically launched and the add-on installed by running:

```shell
npm start
```

Note: This runs in a recently created profile, where no changes will be saved. For more information, see <https://developer.mozilla.org/Add-ons/WebExtensions/Getting_started_with_web-ext>

To automatically reload the extension on file changes:

```shell
npm run watch
```

To load the extension manually instead, open (preferably) the [Developer Edition of Firefox](https://www.mozilla.org/firefox/developer/) and load the `.zip` using the following steps:

* Navigate to _about:debugging_ in your URL bar
* Select "Load Temporary Add-on"
* Find and select the latest zip file you just built.

## Seeing the add-on in action

To debug installation and loading of the add-on, check the Browser Console that is automatically opened on start. (Usually accessible using Firefox's top menu at `Tools > Web Developer > Browser Console`).

This will display Shield (loading/telemetry) and log output from the add-on as long as the preference `shieldStudy.logLevel` is set to `All` or similar.

See [TESTPLAN.md](./TESTPLAN.md) for more details on how to see this add-on in action and hot it is expected to behave.

## Format code using prettier and eslint --fix

```shell
npm run format
```

## Generate stub code and API docs

```shell
npm run generate
```

Generates stub code and API docs from `src/privileged/*/schema.yaml` using <https://github.com/motin/webext-experiment-utils>.

## Manual testing

Launch the built add-on as already expired study:

```shell
EXPIRED=1 npm run test:manual
```

Launch the built add-on as expiring within a few seconds:

```shell
EXPIRE_IN_SECONDS=5 npm run test:manual
```

Launch the built add-on as with a specific variation set:

```shell
BRANCH=control npm run test:manual
```

For more options, see the code at [./run-firefox.js](./run-firefox.js).

## Automated testing

```shell
npm test
```

Runs both unit and functional tests.

### Unit tests

```shell
npm run test:unit
```

Runs unit tests using Karma.

Code at [./test/unit/](./test/unit/). Configuration at [./karma.conf.js](./karma.conf.js).

Code coverage is instrumented by the istanbul babel plugin and is only enabled and reported for those files that use the babel preprocessor in [./karma.conf.js](./karma.conf.js).

Note: [The karma firefox launcher](https://github.com/karma-runner/karma-firefox-launcher) expects that the firefox binaries are located in slightly different places than `web-ext`. Example on how to workaround this on OSX:

```shell
cd /Applications/
ln -s FirefoxBeta.app FirefoxAurora.app
ln -s Firefox\ Nightly.app FirefoxNightly.app
```

### Functional tests

(To run the functional tests, package.json has to be updated to reflect the built add-on zip filename the declaration of `npm run test:func` - this is silly and there is an issue about it here: https://github.com/mozilla/shield-studies-addon-template/issues/75 - but we are stuck with having to manually update it for the time being.)

```shell
npm run test:func
```

Runs functional tests using the Selenium driver in a clean profile:

* `0-study_utils_integration.js` - Verifies the telemetry payload throughout the study life cycle.
* `1-button_test.js` - _Example test_ Tests the browser action
* `2-notification_bar.js` - _Example test_ Test the notification bar

Code at [/test/functional/](/test/functional/).

Note: The study variation/branch during tests is overridden by a preference in the FIREFOX_PREFERENCES section of `test/utils.js`.

The example tests is inspired by tests in <https://github.com/mozilla/share-button-study>.

## Directory Structure and Files

```
├── .babelrc              # Used by karma to track code coverage in unit tests
├── .circleci             # Setup for .circle ci integration
│   ├── config.yml
│   └── reports
│       └── .gitignore
├── .eslintignore
├── .eslintrc.js          # Linting configuration for mozilla, json etc
├── .gitignore
├── LICENSE
├── README.md
├── dist                  # Built zips (add-ons)
│   ├── .gitignore
│   └── button_icon_preference_-_shield_study_example-2.0.0.zip
├── docs
│   ├── DEV.md
│   ├── TELEMETRY.md      # Telemetry examples for this add-on
│   ├── TESTPLAN.md       # Manual QA test plan
│   └── WINDOWS_SETUP.md
├── karma.conf.js
├── package-lock.json
├── package.json
├── run-firefox.js
├── src                   # Files that will go into the add-on
│   ├── _locales
│   │   ├── en-US
│   │   │   └── messages.json
│   │   └── fr
│   │       └── messages.json
│   ├── background.js     # Background script that contains a study life-cycle handler class and such boilerplate
│   ├── feature.js        # Initiate your study logic using the Feature class in this file
│   ├── icons
│   │   ├── LICENSE
│   │   ├── isolatedcorndog.svg # Icon used in the example study (remove in your add-on)
│   │   ├── kittens.svg         # Icon used in the example study (remove in your add-on)
│   │   ├── lizard.svg          # Icon used in the example study (remove in your add-on)
│   │   ├── puppers.svg         # Icon used in the example study (remove in your add-on)
│   │   ├── shield-icon.256.png
│   │   ├── shield-icon.48.png
│   │   ├── shield-icon.98.png
│   │   └── shield-icon.svg
│   ├── manifest.json     # The WebExtension manifest. Use this to declare permissions and web extension experiments etc
│   ├── privileged
│   │   ├── .gitignore
│   │   ├── introductionNotificationBar
│   │   │   ├── api.js
│   │   │   └── schema.json
│   │   ├── panel
│   │   │   ├── blurts.EveryWindow.jsm
│   │   │   └── cookiesrest.EveryWindow.js
│   │   ├── privacyContext
│   │   │   ├── api.js
│   │   │   ├── api.md
│   │   │   ├── schema.json
│   │   │   ├── schema.yaml
│   │   │   └── stubApi.js
│   │   └── study
│   │       ├── api.js
│   │       └── schema.json
│   └── studySetup.js
└── test                  # Automated tests `npm test` and circle
│   ├── .eslintrc.js
│   ├── ensure_minimum_node_version.js
│   ├── functional
│   │   ├── 0-study_utils_integration.js
│   │   ├── 1-button_test.js
│   │   ├── 2-notification_bar.js
│   │   └── utils.js
│   ├── results           # Code coverage and log artifacts from test runs
└── web-ext-config.js     # Configuration options used by the `web-ext` command

>> tree -a -I 'node_modules|.git|.DS_Store'
```

This add-on uses the structure is set forth in [shield-studies-addon-template](https://github.com/mozilla/shield-studies-addon-template), with study-specific changes found mostly in `src/background.js`, `src/privileged/` and `src/studySetup.js`.

## General Shield Study Engineering

Shield study add-ons are web extensions (`src/`) with at least one background script (`src/background.js`) and one or more embedded Web Extension Experiments (`src/privileged/*/api.js`) that allows them to run privileged code.

Privileged code allows access to Telemetry data, user preferences etc that are required for collecting relevant data for [Shield Studies](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies).

It is recommended to build necessary logic and user interface using in the context of the web extension whenever possible and only utilize privileged code when strictly necessary.

For more information, see <https://github.com/mozilla/shield-studies-addon-utils/> (especially <https://github.com/mozilla/shield-studies-addon-utils/blob/master/docs/engineering.md>).
