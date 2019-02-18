# Shield Studies Add-On Template

[![CircleCI badge](https://img.shields.io/circleci/project/github/motin/federated-learning-v2-study-addon/master.svg?label=CircleCI)](https://circleci.com/gh/motin/federated-learning-v2-study-addon/)
[![Coverage Status](https://coveralls.io/repos/github/motin/federated-learning-v2-study-addon/badge.svg)](https://coveralls.io/github/motin/federated-learning-v2-study-addon)

Federated Learning is a subarea of machine learning where the training process is distributed among many users.
Instead of sharing their data, users only have to provide weight updates to the server.

This is the second draft of a Firefox add-on study that implements the client-side part of a Federated Learning system.
Every time users perform searches in the awesome bar, the model's predictions are compared to the actual user behaviour and weight updates are computed.
These updates are collected using Telemetry.

## Study variations

- `treatment`: The full optimization process is performed, weights change after every iteration and the ranking is recomputed
- `control`: Search works exactly the same way it currently does in Firefox, we only collect additional statistics
- `control-no-decay`: In the current algorithm, frecency scores are decayed over time. `treatment` loses this effect since scores are recomputed all the time. To see if the decaying is useful and to make a fairer comparison, this variation only removes the decaying effect

## Seeing the add-on in action

See [TESTPLAN.md](./docs/TESTPLAN.md) for more details on how to get the add-on installed and tested.

## Data Collected / Telemetry Pings

See [TELEMETRY.md](./docs/TELEMETRY.md) for more details on what pings are sent by this add-on.

## Analyzing data

Telemetry pings are loaded into S3 and re:dash. Sample query:

* [All pings](https://sql.telemetry.mozilla.org/queries/61520/source)

## Improving this add-on

See [DEV.md](./docs/DEV.md) for more details on how to work with this add-on as a developer.

## References

### Version 2
- [Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=TODO)

### Version 1
- [Blog post](https://florian.github.io/federated-learning/) explaining the concepts behind federated learning
- [Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1462102)
- [Federated learning simulations](https://github.com/florian/federated-learning)
- Documentation about
   - [frecency](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places/Frecency_algorithm) (a bit outdated)
