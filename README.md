# Shield Studies Add-On Template

[![CircleCI badge](https://img.shields.io/circleci/project/github/mozilla/shield-studies-addon-template/master.svg?label=CircleCI)](https://circleci.com/gh/mozilla/shield-studies-addon-template/)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/shield-studies-addon-template/badge.svg)](https://coveralls.io/github/mozilla/shield-studies-addon-template)

## Important notice

### We are moving to WebExtensions

This is a work in progress branch for [supporting a pure WebExtension workflow in this template](https://github.com/mozilla/shield-studies-addon-template/issues/53) and it depends on version 5 of [shield-studies-addon-utils](https://github.com/mozilla/shield-studies-addon-utils/) (also work in progress).

## About This Repository

This repository is intended as an example repository containing templates and good
practices for creating a [Shield Study](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies) add-on for Firefox.

This repository is based on WebExtensions, which are the way forward for extensions in Firefox.

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
