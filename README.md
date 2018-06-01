# Shield Study Embedded Web Extension Template

[![CircleCI badge](https://img.shields.io/circleci/project/github/mozilla/shield-studies-addon-template/master.svg?label=CircleCI)](https://circleci.com/gh/mozilla/shield-studies-addon-template/)

## Important notice

### We are moving to Web Extension Experiments

In an effort to remove the necessity of creating legacy add-ons for Shield studies, we are working on [supporting a pure Web Extension Experiment workflow in this template](https://github.com/mozilla/shield-studies-addon-template/issues/53) with a new version, v5, of the [Shield utilities](https://github.com/mozilla/shield-studies-addon-utils/). Support for these workflows is not yet stable. In the meantime, **we do not recommend using this v4 template**.

Instead, we recommend that you:
* build your study as a WEE ([Web Extension Experiment](https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/index.html))
* help us test the requisite [experimental Shield API(s)](https://github.com/mozilla/shield-studies-addon-utils/)

Example Shield add-ons (implemented as WEEs) using the experimental Shield API(s):
* https://github.com/mozilla/shield-studies-addon-utils/blob/develop/examples/small-study
* https://github.com/mozilla/shield-cloudstorage

Chat with us: #shield on Slack about the latest progress and how to help us move faster away from legacy add-ons.

## About This Repository

**Note**: This contains an example [Shield Study](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies) Legacy Add-on. Use this as a template for yours.

(Note: Make this README reflect your study).

Goal: Determine which if any TOOLBAR BUTTONS DESIGNS is the most enticing to the user.

## Seeing the add-on in action

See [TESTPLAN.md](./docs/TESTPLAN.md) for more details on how to get the add-on installed and tested.

## Data Collected / Telemetry Pings

Measure:

* Button (BrowserAction) usage.

See [TELEMETRY.md](./docs/TELEMETRY.md) for more details on what pings are sent by this add-on.

## Analyzing data

Telemetry pings are loaded into S3 and re:dash. Sample query:

* [All pings](https://sql.telemetry.mozilla.org/queries/{#your-id}/source#table)

## Improving this add-on

See [DEV.md](./docs/DEV.md) for more details on how to work with this add-on as a developer.
