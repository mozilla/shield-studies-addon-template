# Shield Studies Add-On Template

[![CircleCI badge](https://img.shields.io/circleci/project/github/mozilla/shield-studies-addon-template/master.svg?label=CircleCI)](https://circleci.com/gh/mozilla/shield-studies-addon-template/)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/shield-studies-addon-template/badge.svg)](https://coveralls.io/github/mozilla/shield-studies-addon-template)

This repository is intended as an example repository containing templates and good
practices for creating an [Add-On Experiment](https://mana.mozilla.org/wiki/display/FIREFOX/Pref-Flip+and+Add-On+Experiments) for Firefox.

See [TEMPLATE.md](./docs/TEMPLATE.md) for more details on how to use the template.
Note: Remove or adapt this text after you have cloned/merged the template to your own study add-on repo.

## Seeing the add-on in action

See [TESTPLAN.md](./docs/TESTPLAN.md) for more details on how to get the add-on installed and tested.

## Data Collected / Telemetry Pings

See [TELEMETRY.md](./docs/TELEMETRY.md) for more details on what pings are sent by this add-on.

## Analyzing data

Telemetry pings are loaded into S3 and re:dash. Sample query:

* [All pings](https://sql.telemetry.mozilla.org/queries/{#your-id}/source#table)

(OR, if Pioneer, use the below instead)

Telemetry pings are loaded into the encrypted Pioneer pipeline.

## Improving this add-on

See [DEV.md](./docs/DEV.md) for more details on how to work with this add-on as a developer.

## References

* [Experimenter](https://experimenter.services.mozilla.com/experiments/TODO/)
* [Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=TODO)
