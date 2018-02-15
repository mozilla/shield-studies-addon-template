# Shield Study Embedded Web Extension Template

## Under Construction

### Check out changes under review before forking

This repo is undergoing big changes. A [huge PR](https://github.com/mozilla/shield-studies-addon-template/pull/49) is currently under review for improvements to build an embedded WebExtension Shield study.

### We are moving to WebExtension Experiments

In an effort to move to WebExtensions, we are also working on making a Shield study [WebExtension Experiment](https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/index.html) template. That template will ultimately replace this one.

![CircleCI badge](https://img.shields.io/circleci/project/github/mozilla/shield-studies-addon-template/master.svg?label=CircleCI)

## About This Study

**Note**: This is toy / demonstration [Shield Study](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies) Legacy Add-on. Use this as a template for yours

(Note: get these from your PHD).

Goal: Determine which if any TOOLBAR BUTTONS DESIGNS is the most enticing to the user.

## Seeing the add-on in action

See [TESTPLAN.md](./TESTPLAN.md) for more details on how to get the add-on installed and tested.

## Data Collected / Telemetry Pings

Measure:

* Button (BrowserAction) usage.

See [TELEMETRY.md](./TELEMETRY.md) for more details on what pings are sent by this add-on.

## Analyzing data

Telemetry pings are loaded into S3 and re:dash. Sample query:

* [All pings](https://sql.telemetry.mozilla.org/queries/{#your-id}/source#table)

## Improving this add-on

See [DEV.md](./DEV.md) for more details on how to work with this add-on as a developer.
