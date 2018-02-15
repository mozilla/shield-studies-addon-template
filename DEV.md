# Developing this add-on

## Getting started

```
# install depndencies
npm install

## build
npm run eslint
npm run build

## build and run
npm run firefox
```

### Details

First, make sure you are on NPM 5+ installed so that the proper dependencies are installed using the package-lock.json file.

`$ npm install -g npm`

After cloning the repo, you can run the following commands from the top level directory, one after another:

```
$ npm install
$ npm run build
```

This packages the add-on into `dist/linked-addon.xpi`. This file is the addon you load into Firefox.

Note: `linked-addon.xpi` is a symbolic link to the extension's true XPI, which is named based on the study's unique addon ID specified in `package.json`.

### Developing

You can automatically build recent changes and package them into a `.xpi` by running the following from the top level directory:

`$ npm run watch`

Now, anytime a file is changed and saved, node will repackage the add-on. You must reload the add-on as before, or by clicking the "Reload" under the add-on in *about:debugging*. Note that a hard re-load is recommended to clear local storage. To do this, simply remove the add-on and reload as before.

# Directory Structure and Files

```
├── .circleci/            # setup for .circle ci integration
├── .eslintignore
├── .eslintrc.js          # mozilla, json
├── .git/
├── .gitignore
├── README.md             # (this file)
├── TELEMETRY.md          # Telemetry examples for this addon
├── TESTPLAN.md           # Manual QA test plan
├── addon                 # Files that will go into the addon
│   ├── Config.jsm
│   ├── StudyUtils.jsm    # (copied in during `prebuild`)
│   ├── bootstrap.js      # LEGACY Bootstrap.js
│   ├── chrome.manifest   # (derived from templates)
│   ├── install.rdf       # (derived from templates)
│   │
│   ├── lib               # JSM (Firefox modules)
│   │   └── AddonPrefs.jsm
│   │   └── Feature.jsm   # does `introduction`
|   |
│   └── webextension      # modern, embedded webextesion
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
│
├── bin                   # Scripts / commands
│   └── xpi.sh            # build the XPI
│
├── dist                  # built xpis (addons)
│   ├── @template-shield-study.mozilla.com-1.1.0.xpi
│   └── linked-addon.xpi -> @template-shield-study.mozilla.com-1.1.0.xpi
│
├── package-lock.json
├── package.json
├── run-firefox.js        # command
├── sign/                 # "LEGACY-SIGNED" addons.  used by `npm sign`
│
│
├── templates             # mustache templates, filled from `package.json`
│   ├── chrome.manifest.mustache
│   └── install.rdf.mustache
│
│
└── test                  # Automated tests `npm test` and circle
    ├── Dockerfile
    ├── docker_setup.sh
    ├── functional_tests.js
    ├── test-share-study.js
    ├── test_harness.js
    ├── test_printer.py
    └── utils.js


>> tree -a -I node_modules

```

## General Shield Study Engineering

Shield study add-ons are legacy (`addon/bootstrap.js`) add-ons with an optional embedded web extension (`addon/webextension/background.js`).

The web extension needs to be packaged together with a legacy add-on in order to be able to access Telemetry data, user preferences etc that are required for collecting relevant data for [Shield Studies](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies).

It is recommended to build necessary logic and user interface using in the context of the webextension and communicate with the legacy add-on code through messaging whenever privileged access is required.

For more information, see [./about.md]


### Similar repositories

[https://github.com/benmiroglio/shield-study-embedded-webextension-hello-world-example]() - A repository that was created this week specifically to help new Shield/Pioneer engineers to quickly get up and running with a Shield add-on. It was however built upon an older and much more verbose addon template, which makes it's file structure hard to follow.
[https://github.com/gregglind/template-shield-study]() - The incubation repo for the updated structure and contents of this repo. Use this repo instead.


### Description of what goes on when this addon is started

During `bootstrap.js:startup(data, reason)`:

    a. `shieldUtils` imports and sets configuration from `Config.jsm`
    b. `bootstrap.js:chooseVariation` explicitly and deterministically chooses a variation from `studyConfig.weightedVariations`
    c.  the WebExtension starts up
    d.  `boostrap.js` listens for requests from the `webExtension` that are study related:  `["info", "telemetry", "endStudy"]`
    e.  `webExtension` (`background.js`) asks for `info` from `studyUtils` using `askShield` function.
    f.  Feature starts using the `variation` from that info.
    g.  Feature instruments user button to send `telemetry` and to `endStudy` if the button is clicked enough.

Tip: It is particularly useful to compare the source code of previously deployed shield studies with this template (and each other) to get an idea of what is actually relevant to change between studies vs what is mostly untouched boilerplate.

### Getting Data

Telemetry pings are loaded into S3 and re:dash. You can use this [Example Query](https://sql.telemetry.mozilla.org/queries/46999/source#table) as a starting point.

### Testing

Run the following to run the example set of functional tests:

`$ npm test`

Note: The functional tests are using async/await, so make sure you are running Node 7.6+

The functional testing set-up is imported from [https://github.com/mozilla/share-button-study]() which contains plenty of examples of functional tests relevant to Shield study addons.
