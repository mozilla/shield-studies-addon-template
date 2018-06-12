# Shield Studies Add-On Template

[![CircleCI badge](https://img.shields.io/circleci/project/github/mozilla/shield-studies-addon-template/master.svg?label=CircleCI)](https://circleci.com/gh/mozilla/shield-studies-addon-template/)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/shield-studies-addon-template/badge.svg)](https://coveralls.io/github/mozilla/shield-studies-addon-template)

## About This Repository

This repository is intended as an example repository containing templates and good
practices for creating a [Shield Study](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies) add-on for Firefox.

The develop-branch of this repository is based on WebExtensions, which are the way forward for extensions in Firefox.

### Important notice

We are working on [supporting a pure Web Extension Experiment workflow in this template](https://github.com/mozilla/shield-studies-addon-template/issues/53) with a new version, v5, of the [Shield utilities](https://github.com/mozilla/shield-studies-addon-utils/). Even though support for these workflows is not yet stable (and thus only available in the develop-branch), **we do not recommend using the master branch (using Shield Utils v4) of this template**. Creating a legacy add-on with the outdated master branch will likely result in a broken Shield study add-on in recent versions of Firefox.

Instead, we recommend that you:

* build your study as a WEE ([Web Extension Experiment](https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/index.html))
* help us test the requisite [experimental Shield API(s)](https://github.com/mozilla/shield-studies-addon-utils/)

Example Shield add-ons (implemented as WEEs) using the experimental Shield API(s):

* The develop-branch of this template
* https://github.com/mozilla/shield-studies-addon-utils/blob/develop/examples/small-study
* https://github.com/mozilla/shield-cloudstorage

Chat with us: #shield on Slack about the latest progress and how to help us move faster away from legacy add-ons.

### Aims

The aim is to bring together tools and services we've used on other Shield Study add-ons
(e.g. [dataleak-pioneer-shield-study](https://github.com/motin/dataleak-pioneer-shield-study)) into a template/example repository, so that new projects can come
along and get infrastructure together, and be up and running with code, test suites, coverage etc quickly.

### Documentation

It is intended that all parts of this repository have at least outline
documentation. If you find any parts that are missing, please file an issue or
create a PR.

### Using this template

1. Fork this repository, rename it to reflect your study. Make the repo end with `-shield-study`
2. Make this README reflect your study (including removing all of this `About This Repository` section, keeping `Seeing the add-on in action` and below)
3. Build your study add-on and make the docs reflect your study
4. File issues/PRs against https://github.com/mozilla/shield-studies-addon-template/ when you come across things to improve in the template

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
