# Developing this add-on

### Preparations

* Download a Developer and Nightly versions of Firefox (only Developer/Nightly will allow running unsigned legacy extensions, and Nightly is the default target for the automated tests)

## Getting started

```bash
# install dependencies
npm install

## build
npm run eslint
npm run build

## build and run
npm run firefox
```

## Details

First, make sure you are on NPM 5+ installed so that the proper dependencies are installed using the package-lock.json file.

`$ npm install -g npm`

Clone the repo:

`$ git clone https://github.com/mozilla/shield-studies-addon-template.git`

After cloning the repo, you can run the following commands from the top level directory, one after another:

```
$ npm install
$ npm run build
```

This packages the add-on into an xpi file which is stored in `dist/`. This file is what you load into Firefox.

## Loading the Web Extension in Firefox

You can have Firefox automatically launched and the add-on installed by running:

`$ npm run firefox`

To load the extension manually instead, open (preferably) the [Developer Edition of Firefox](https://www.mozilla.org/firefox/developer/) and load the `.xpi` using the following steps:

* Navigate to _about:config_ and set `extensions.legacy.enabled` to `true`. This permits the loading of the embedded Web Extension since new versions of Firefox are becoming restricted to pure Web Extensions only.
* Navigate to _about:debugging_ in your URL bar
* Select "Load Temporary Add-on"
* Find and select the latest xpi file you just built.

## Seeing the add-on in action

To debug installation and loading of the add-on:

* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) and log output from the add-on.

See [TESTPLAN.md](./TESTPLAN.md) for more details on how to see this add-on in action and hot it is expected to behave.

## Automated launch of Firefox with add-on installed

`$ npm run firefox` starts Firefox and automatically installs the add-on in a new profile and opens the browser console automatically.

Note: This runs in a recently created profile, and the study variation/branch is overridden by a preference in the FIREFOX_PREFERENCES section of `test/utils.js`.

## Automated testing

`npm run test` verifies the telemetry payload as expected at Firefox startup and add-on installation in a clean profile, then does **optimistic testing** of the _commonest path_ though the study for a user

* prove the notification bar ui opens
* _clicking on the left-most button presented_.
* verifying that sent Telemetry is correct.

Code at [/test/functional_test.js](/test/functional_test.js).

Note: The functional tests are using async/await, so make sure you are running Node 7.6+

The functional testing set-up is imported from <https://github.com/mozilla/share-button-study> which contains plenty of examples of functional tests relevant to Shield study addons.

## Watch

You can automatically build recent changes and package them into a `.xpi` by running the following from the top level directory:

`$ npm run watch`

Now, anytime a file is changed and saved, node will repackage the add-on. You must reload the add-on as before, or by clicking the "Reload" under the add-on in _about:debugging_. Note that a hard re-load is recommended to clear local storage. To do this, simply remove the add-on and reload as before.

Note: This is currently only useful if you load the extension manually - it has no effect when running `npm run firefox`.

## Directory Structure and Files

```
├── .circleci             # setup for .circle ci integration
│   └── config.yml
├── .eslintignore
├── .eslintrc.js          # mozilla, json
├── .gitignore
├── LICENSE
├── README.md             # (this file)
├── addon                 # Files that will go into the addon
│   ├── Config.jsm        # Study-specific configuration regarding branches, eligibility etc
│   ├── StudyUtils.jsm    # (copied in during `prebuild`)
│   ├── bootstrap.js      # LEGACY Bootstrap.js
│   ├── chrome.manifest   # (derived from templates)
│   ├── icon.png
│   ├── install.rdf       # (derived from templates)
│   ├── lib               # JSM (Firefox modules)
│   │   └── Feature.jsm   # contains study-specific privileged code
│   └── webextension      # study-specific embedded webextension
│       ├── .eslintrc.json
│       ├── background.js
│       ├── icons
│       │   ├── LICENSE
│       │   ├── isolatedcorndog.svg
│       │   ├── kittens.svg
│       │   ├── lizard.svg
│       │   └── puppers.svg
│       └── manifest.json
├── bin                   # Scripts / commands
│   └── xpi.sh            # build the XPI
├── dist                  # built xpis (addons)
│   ├── .gitignore
│   ├── @template-button-study.shield.mozilla.com-1.2.0.xpi
│   └── linked-addon.xpi -> @template-button-study.shield.mozilla.com-1.2.0.xpi
├── docs
│   ├── DEV.md
│   ├── TELEMETRY.md      # Telemetry examples for this addon
│   ├── TESTPLAN.md       # Manual QA test plan
│   └── WINDOWS_SETUP.md
├── package-lock.json
├── package.json
├── run-firefox.js        # used by `npm run firefox`
├── templates             # mustache templates, filled from `package.json`
│   ├── chrome.manifest.mustache
│   └── install.rdf.mustache
└── test                  # Automated tests `npm test` and circle
    ├── Dockerfile
    ├── docker_setup.sh
    ├── functional_tests.js
    ├── test_harness.js
    ├── test_printer.py
    └── utils.js

>> tree -a -I 'node_modules|.git|.DS_Store'
```

This structure is set forth in [shield-studies-addon-template](https://github.com/mozilla/shield-studies-addon-template), with study-specific changes found mostly in `addon/lib`, `addon/webextension` and `addon/Config.jsm`.

## General Shield Study Engineering

Shield study add-ons are legacy (`addon/bootstrap.js`) add-ons with an optional embedded web extension (`addon/webextension/background.js`).

The web extension needs to be packaged together with a legacy add-on in order to be able to access Telemetry data, user preferences etc that are required for collecting relevant data for [Shield Studies](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies).

It is recommended to build necessary logic and user interface using in the context of the web extension and communicate with the legacy add-on code through messaging whenever privileged access is required.

For more information, see <https://github.com/mozilla/shield-studies-addon-utils/> (especially <https://github.com/mozilla/shield-studies-addon-utils/blob/master/docs/engineering.md>).
