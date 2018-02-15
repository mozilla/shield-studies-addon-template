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

## General notes on Shield Study Engineering

Shield study add-ons are legacy (`addon/bootstrap.js`) add-ons with an optional embedded web extension (`addon/webextension/background.js`).

The web extension needs to be packaged together with a legacy add-on in order to be able to access Telemetry data, user preferences etc that are required for collecting relevant data for [Shield Studies](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies).

It is recommended to build necessary logic and user interface using in the context of the webextension and communicate with the legacy add-on code through messaging whenever privileged access is required.

## Loading the Web Extension in Firefox

You can have Firefox automatically launched and the add-on installed by running:

`$ npm run firefox`

To load the extension manually instead, open (preferably) the [Developer Edition of Firefox](https://www.mozilla.org/firefox/developer/) and load the `.xpi` using the following steps:

* Navigate to *about:config* and set `extensions.legacy.enabled` to `true`. This permits the loading of the embedded Web Extension since new versions of Firefox are becoming restricted to pure Web Extensions only.
* Navigate to *about:debugging* in your URL bar
* Select "Load Temporary Add-on"
* Find and select the latest xpi file you just built.

## Seeing the add-on in action

To debug installation and loading of the add-on:

* Navigate to *about:config* and set `shield.testing.logging.level` to `10`. This permits shield-add-on log output in browser console
* Open the Browser Console using Firefox's top menu at `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) and log output from the add-on.

See [TESTPLAN.md](./TESTPLAN.md) for more details on how to see this add-on in action and hot it is expected to behave.

## Automated launch of Firefox with add-on installed

`$ npm run firefox` starts Firefox and automatically installs the add-on in a new profile and opens the browser console automatically.

Note: This runs in a recently created profile. To have the study run despite the eligibility requirement of having at least 1 day old profiles, a config override is set in place to force the study to run.

## Automated testing

`npm run test` verifies the telemetry payload as expected at Firefox startup and add-on installation in a clean profile, then does **optimistic testing** of the *commonest path* though the study for a user

- prove the notification bar ui opens
- *clicking on the left-most button presented*.
- verifying that sent Telemetry is correct.

Code at [/test/functional_test.js](/test/functional_test.js).

Note: The functional tests are using async/await, so make sure you are running Node 7.6+

The functional testing set-up is imported from [https://github.com/mozilla/share-button-study]() which contains plenty of examples of functional tests relevant to Shield study addons.

## Watch

You can automatically build recent changes and package them into a `.xpi` by running the following from the top level directory:

`$ npm run watch`

Now, anytime a file is changed and saved, node will repackage the add-on. You must reload the add-on as before, or by clicking the "Reload" under the add-on in *about:debugging*. Note that a hard re-load is recommended to clear local storage. To do this, simply remove the add-on and reload as before.

Note: This is currently only useful if you load the extension manually - it has no effect when running `npm run firefox`.

## Directory Structure and Files

```
├── .circleci             # setup for .circle ci integration
│   └── config.yml
├── .eslintignore
├── .eslintrc.js          # mozilla, json
├── .gitignore
├── DEV.md
├── README.md             # (this file)
├── TELEMETRY.md          # Telemetry examples for this addon
├── TESTPLAN.md           # Manual QA test plan
├── WINDOWS_SETUP.md
├── about.md
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
│       │   ├── Anonymous-Lizard.svg
│       │   ├── DogHazard1.svg
│       │   ├── Grooming-Cat-Line-Art.svg
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
├── package-lock.json
├── package.json
├── run-firefox.js        # used by `npm run firefox`
├── survival.md
├── templates             # mustache templates, filled from `package.json`
│   ├── chrome.manifest.mustache
│   └── install.rdf.mustache
└── test                  # Automated tests `npm test` and circle
│   ├── Dockerfile
│   ├── docker_setup.sh
│   ├── functional_tests.js
│   ├── test_harness.js
│   ├── test_printer.py
│   └── utils.js
└── tutorial.md

>> tree -a -I 'node_modules|.git|.DS_Store'

```

This structure is set forth in [shield-studies-addon-template](https://github.com/mozilla/shield-studies-addon-template), with study-specific changes found mostly in `addon/lib`, `addon/webextension` and `addon/Config.jsm`.

## General Shield Study Engineering

Shield study add-ons are legacy (`addon/bootstrap.js`) add-ons with an optional embedded web extension (`addon/webextension/background.js`).

The web extension needs to be packaged together with a legacy add-on in order to be able to access Telemetry data, user preferences etc that are required for collecting relevant data for [Shield Studies](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies).

It is recommended to build necessary logic and user interface using in the context of the webextension and communicate with the legacy add-on code through messaging whenever privileged access is required.

For more information, see [./about.md]

### Description of what goes on when this add-on is started

During `bootstrap.js:startup(data, reason)`:

    a. `shieldUtils` imports and sets configuration from `Config.jsm`
    b. `bootstrap.js:chooseVariation` explicitly and deterministically chooses a variation from `studyConfig.weightedVariations`
    c.  the WebExtension starts up
    d.  `boostrap.js` listens for requests from the `webExtension` that are study related:  `["info", "telemetry", "endStudy"]`
    e.  `webExtension` (`background.js`) asks for `info` from `studyUtils` using `askShield` function.
    f.  Feature starts using the `variation` from that info.
    g.  Feature instruments user button to send `telemetry` and to `endStudy` if the button is clicked enough.

Tip: For more insight on what is study-specific, compare the source code of previously deployed shield studies with this template (and each other) to get an idea of what is actually relevant to change between studies vs what is mostly untouched boilerplate.

### Legacy repositories

Repositories that should no longer be used as templates for new studies:

[https://github.com/gregglind/template-shield-study]() - The incubation repo for the updated structure and contents of this repo, implemented in late 2017.
[https://github.com/benmiroglio/shield-study-embedded-webextension-hello-world-example]() - A repository that was created in 2017 to help new Shield/Pioneer engineers to quickly get up and running with a Shield add-on. It was however built upon an older and much more verbose addon template, which makes it's file structure hard to follow.
