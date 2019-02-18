# Telemetry sent by this add-on

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Usual Firefox Telemetry is mostly unaffected](#usual-firefox-telemetry-is-mostly-unaffected)
* [Study-specific endings](#study-specific-endings)
* [`shield-study` pings (common to all shield-studies)](#shield-study-pings-common-to-all-shield-studies)
* [`shield-study-addon` pings, specific to THIS study.](#shield-study-addon-pings-specific-to-this-study)
* [Example sequence for a 'voted => not sure' interaction](#example-sequence-for-a-voted--not-sure-interaction)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Data we are collecting

No direct information about search queries or the user's history is collected.
The idea behind federated learning is that sensitive data does not leave the user's computer.
Instead, clients send back abstract model improvements.
These updates are derived from local data but are much harder to interpret.

Additionally to the updates, we are also collecting meta information about search queries, e.g. how many suggestions were displayed and which rank the selected one had.
This information is used to evaluate the quality of the model.

## Usual Firefox Telemetry is mostly unaffected

* No change: `main` and other pings are UNAFFECTED by this add-on, except that [shield-studies-addon-utils](https://github.com/mozilla/shield-studies-addon-utils) adds the add-on id as an active experiment in the telemetry environment.
* Respects telemetry preferences. If user has disabled telemetry, no telemetry will be sent.

## Study-specific endings

This study has no surveys and as such has NO SPECIFIC ENDINGS.

## `shield-study` pings (common to all shield-studies)

[shield-studies-addon-utils](https://github.com/mozilla/shield-studies-addon-utils) sends the usual packets.

## `shield-study-addon` pings, specific to THIS study.

Every time a `freceny-update` ping is submitted (see below), a corresponding `shield-study-addon` ping is submitted, allowing for automatic querying of study data in re:dash. Note that `shield-study-addon` pings only accepts string attributes, why a stringification of all ping attributes is performed before submitting the `shield-study-addon` ping. This does not affect the `freceny-update` ping. 

## `frecency-update` ping ([schema](https://github.com/mozilla-services/mozilla-pipeline-schemas/tree/dev/templates/telemetry/frecency-update))

This ping is sent every time an enrolled user performs a history / bookmark search in the awesome bar.
The following data is sent with this ping:

| name                        | type              | description                                                                                         |
|-----------------------------|-------------------|-----------------------------------------------------------------------------------------------------|
| `model_version`             | integer           | the version of the model that all the other data is based on                                        |
| `study_variation`           | string            | in what variation is the user enrolled in (e.g. treatment, control)                                 |
| `update`                    | array of floats   | the model improvement that the user is proposing                                                    |
| `loss`                      | float             | a number quantifying how well the model worked                                                      |
| `num_suggestions_displayed` | integer           | how many history / bookmark suggestions were displayed?                                             |
| `rank_selected`             | integer           | what was the position of the selected suggestion? (should be minimized by the optimization process) |
| `num_chars_typed`           | integer           | how many characters did the user type? (should be minimized by the optimization process)            |
| `frecency_scores`           | array of integers | what scores did the model assign to the suggestions?                                                |

### Example ping

```json
{
    "frecency_scores": [
      38223,
      3933.4,
      304933.3,
      21
    ],
    "loss": 291989.21,
    "model_version": 3,
    "num_chars_typed": 5,
    "num_suggestions_displayed": 5,
    "rank_selected": 2,
    "study_variation": "treatment",
    "update": [
      1.2,
      3.2,
      -3.1,
      4.4,
      0.5,
      0.234,
      -0.98,
      0.33,
      0.34,
      0.28,
      0.302,
      0.4,
      -0.8,
      0.25,
      0.9,
      -0.8,
      0.29,
      0.42,
      0.89,
      0.39,
      0.54,
      0.78
    ]
}
```

## Example sequence for a 'voted => not sure' interaction

These are the `payload` fields from all pings in the `shield-study` and `shield-study-addon` buckets.

TODO

```
// common fields

branch        up-to-expectations-1        // should describe Question text
study_name    57-perception-shield-study
addon_version 1.0.0
version       3

2017-10-09T14:16:18.042Z shield-study
{
  "study_state": "enter"
}

2017-10-09T14:16:18.055Z shield-study
{
  "study_state": "installed"
}

2017-10-09T14:16:18.066Z shield-study-addon
{
  "attributes": {
    "event": "prompted",
    "promptType": "notificationBox-strings-1"
  }
}

2017-10-09T16:29:44.109Z shield-study-addon
{
  "attributes": {
    "promptType": "notificationBox-strings-1",
    "event": "answered",
    "yesFirst": "1",
    "score": "0",
    "label": "not sure",
    "branch": "up-to-expectations-1",
    "message": "Is Firefox performing up to your expectations?"
  }
}

2017-10-09T16:29:44.188Z shield-study
{
  "study_state": "ended-neutral",
  "study_state_fullname": "voted"
}

2017-10-09T16:29:44.191Z shield-study
{
  "study_state": "exit"
}
```

## References

- [Bugzilla bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1462109) detailing the data review request
- [ping schema](https://github.com/mozilla-services/mozilla-pipeline-schemas/tree/dev/templates/telemetry/frecency-update)
