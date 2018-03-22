# Shield Study Web Extension Template

![CircleCI badge](https://img.shields.io/circleci/project/github/mozilla/shield-studies-addon-template/master.svg?label=CircleCI)

## Important notice

### We are moving to Web Extensions

This is a work in progress branch for [supporting a pure Web Extension workflow in this template](https://github.com/mozilla/shield-studies-addon-template/issues/53).

## About This Repository

**Note**: This contains an example [Shield Study](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies) Web Extension. Use this as a template for yours.

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
