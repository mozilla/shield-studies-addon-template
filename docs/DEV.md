# Developing this add-on

### Preparations

* Download Developer and Nightly versions of Firefox (only Developer/Nightly will allow bundled web extension experiments, and Nightly is the default target for the automated tests)

## Getting started

```
# install dependencies
npm install

## run
npm start

## run and reload on filechanges
npm run watch

# run and reload on filechanges, with a variation/branch set by preference
npm run watch -- --pref extensions.button_icon_preference.variation='kittens'

# run and reload on filechanges, with a variation/branch set by preference, with a specific Firefox installation
npm run watch -- --pref extensions.button_icon_preference.variation='kittens' -f "/Applications/Firefox Nightly.app/Contents/MacOS/firefox-bin"

## lint
npm run lint

## build
npm run build
```

## Details

First, make sure you are on NPM 5+ installed so that the proper dependencies are installed using the package-lock.json file.

```
npm install -g npm
```

Clone the repo:

```
git clone https://github.com/mozilla/shield-studies-addon-template.git
```

After cloning the repo, you can run the following commands from the top level directory, one after another:

```
npm install
npm run build
```

This packages the add-on into an zip file which is stored in `dist/`. This file is what you load into Firefox.

## Loading the Web Extension in Firefox

You can have Firefox automatically launched and the add-on installed by running:

```
npm start
```

Note: This runs in a recently created profile, where no changes will be saved. For more information, see <https://developer.mozilla.org/Add-ons/WebExtensions/Getting_started_with_web-ext>

To automatically reload the extension on file changes:

```
npm run watch
```

To load the extension manually instead, open (preferably) the [Developer Edition of Firefox](https://www.mozilla.org/firefox/developer/) and load the `.zip` using the following steps:

* Navigate to _about:debugging_ in your URL bar
* Select "Load Temporary Add-on"
* Find and select the latest zip file you just built.

## Seeing the add-on in action

To debug installation and loading of the add-on, check the Browser Console that is automatically opened on start. (Usually accessible using Firefox's top menu at `Tools > Web Developer > Browser Console`).

This will display Shield (loading/telemetry) and log output from the add-on.

See [TESTPLAN.md](./TESTPLAN.md) for more details on how to see this add-on in action and hot it is expected to behave.

## Automated testing

```
npm run test
```

Runs tests using the Selenium driver, verifying the telemetry payload at Firefox startup and add-on installation in a clean profile, then does **optimistic testing** of the _commonest path_ though the study for a user:

* prove the notification bar ui opens
* _clicking on the left-most button presented_.
* verifying that sent Telemetry is correct.

Code at [/test/functional_tests.js](/test/functional_tests.js).

Note: The study variation/branch during tests is overridden by a preference in the FIREFOX_PREFERENCES section of `test/utils.js`.

(The functional tests are using async/await, so make sure you are running Node 7.6+)

The functional testing set-up is a minimal set of tests imported from <https://github.com/mozilla/share-button-study> which contains plenty of examples of functional tests relevant to Shield study addons.

## Directory Structure and Files

```
├── .circleci             # Setup for .circle ci integration
│   └── config.yml
├── .eslintignore
├── .eslintrc.js          # Linting configuration for mozilla, json etc
├── .gitignore
├── LICENSE
├── README.md
├── dist                  # Built zips (add-ons)
│   ├── .gitignore
│   └── button_icon_preference_study_shield_study_example_-2.0.0.zip
├── docs
│   ├── DEV.md
│   ├── TELEMETRY.md      # Telemetry examples for this addon
│   ├── TESTPLAN.md       # Manual QA test plan
│   └── WINDOWS_SETUP.md
├── package-lock.json
├── package.json
├── src                   # Files that will go into the addon
│   ├── .eslintrc.json
│   ├── background.js     # Background scripts, independent of web pages or browser windows
│   ├── icon.png
│   ├── icons             # Icons used in the example study (remove in your add-on)
│   │   ├── LICENSE
│   │   ├── isolatedcorndog.svg
│   │   ├── kittens.svg
│   │   ├── lizard.svg
│   │   └── puppers.svg
│   ├── manifest.json     # The only file that every extension using WebExtension APIs must contain
│   └── privileged
│       ├── Config.jsm    # Study-specific configuration regarding branches, eligibility, expiration etc
│       ├── feature
│       │   ├── api.js
│       │   ├── jsm
│       │   │   └── Feature.jsm   # Contains study-specific privileged code
│       │   └── schema.json
│       └── shieldUtils
│           ├── api.js
│           ├── jsm
│           │   ├── StudyUtils.jsm              # (copied in during `prebuild` and `prewatch`)
│           │   └── StudyUtilsBootstrap.jsm     # Code from legacy bootstrap.js to be assimilated into StudyUtils
│           └── schema.json
└── test                  # Automated tests `npm test` and circle
│   ├── Dockerfile
│   ├── docker_setup.sh
│   ├── functional_tests.js
│   ├── test_harness.js
│   ├── test_printer.py
│   └── utils.js
└── web-ext-config.js     # Configuration options used by the `web-ext` command

>> tree -a -I 'node_modules|.git|.DS_Store'
```

This structure is set forth in [shield-studies-addon-template](https://github.com/mozilla/shield-studies-addon-template), with study-specific changes found mostly in `src/background.js`, `src/privileged/feature/` and `src/privileged/Config.jsm`.

## General Shield Study Engineering

Shield study add-ons are web extensions (`src/`) with background scripting (`src/background.js`) with embedded web extension experiments (`src/privileged/*/api.js`) that allows them to run privileged code.

Privileged code allows access Telemetry data, user preferences etc that are required for collecting relevant data for [Shield Studies](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies).

It is recommended to build necessary logic and user interface using in the context of the web extension whenever possible and only utilize privileged code when strictly necessary.

For more information, see <https://github.com/mozilla/shield-studies-addon-utils/> (especially <https://github.com/mozilla/shield-studies-addon-utils/blob/master/docs/engineering.md>).
