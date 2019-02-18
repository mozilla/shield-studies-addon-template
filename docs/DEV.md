# Developing this add-on

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Preparations](#preparations)
* [Getting started](#getting-started)
* [Details](#details)
* [Loading the Web Extension in Firefox](#loading-the-web-extension-in-firefox)
* [Seeing the add-on in action](#seeing-the-add-on-in-action)
* [Automated testing](#automated-testing)
  * [Unit tests](#unit-tests)
  * [Functional tests](#functional-tests)
* [Directory Structure and Files](#directory-structure-and-files)
* [General Shield Study Engineering](#general-shield-study-engineering)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Preparations

* Download Developer and Nightly versions of Firefox (only Developer/Nightly will allow bundled web extension experiments, and Developer is the default target for the automated tests)

## Getting started

```shell
# install dependencies
npm install

## run
npm start

## run and reload on filechanges
npm run watch

# run and reload on filechanges, with a variation/branch set by preference
npm run watch -- --pref extensions.button-icon-preference_shield_mozilla_org.test.variationName=kittens

# run and reload on filechanges, with a specific Firefox installation
npm run watch -- -f "/Applications/Firefox Nightly.app/Contents/MacOS/firefox-bin"

## lint
npm run lint

## build
npm run build
```

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

Generates stub code and API docs from `src/privileged/*/schema.yaml`. See <https://github.com/motin/webext-experiment-utils> for more information.

## Manual testing

Launch the built add-on as already expired study:

```shell
EXPIRED=1 npm run test:manual
```

Launch the built add-on as expiring within a few seconds:

```shell
EXPIRE_SECONDS=5 npm run test:manual
```

Code at [./run-firefox.js](./run-firefox.js). 

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

Runs functional tests using the Selenium driver, verifying the telemetry payload at Firefox startup and add-on installation in a clean profile.

Code at [/test/functional/](/test/functional/).

Note: The study variation/branch during tests is overridden by a preference in the FIREFOX_PREFERENCES section of `test/utils.js`.

## Components

### Experiment APIs

- `frecency`: For interacting with the `moz_places` table and recalculating / changing frecency scores
- `awesomeBar`: For observing interactions with the awesome bar. The required information for history / bookmark searches is retrieved (number of typed characters, selected suggestion, features of other suggestions)
- `prefs`: For reading and writing preferences. This is just used to update the weights
- `privacyContext`: For determining if a private session is active
- `study` from [`shield-studies-addon-utils`](https://github.com/mozilla/shield-studies-addon-utils) for study related helpers

### Core components

- `synchronization`: Everything related to the federated learning protocol. Currently that means sending weight updates back using Telemetry and reading the current model from S3
- `optimization`: For computing model updates
- `studySetup` is adapted from [`shield-studies-addon-utils`](https://github.com/mozilla/shield-studies-addon-utils) and configures the study
- `main.js` connects everything.

## Directory Structure and Files

This add-on uses the structure is set forth in [shield-studies-addon-template](https://github.com/mozilla/shield-studies-addon-template), with study-specific changes found mostly in `src/lib/`, `src/background.js`, `src/privileged/` and `src/studySetup.js`.

## General Shield Study Engineering

Shield study add-ons are web extensions (`src/`) with at least one background script (`src/background.js`) and one or more embedded Web Extension Experiments (`src/privileged/*/api.js`) that allows them to run privileged code.

Privileged code allows access to Telemetry data, user preferences etc that are required for collecting relevant data for [Shield Studies](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies).

It is recommended to build necessary logic and user interface using in the context of the web extension whenever possible and only utilize privileged code when strictly necessary.

For more information, see <https://github.com/mozilla/shield-studies-addon-utils/> (especially <https://github.com/mozilla/shield-studies-addon-utils/blob/master/docs/engineering.md>).
