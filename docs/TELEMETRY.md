# Telemetry sent by this add-on

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Contents**

* [Data we are collecting](#data-we-are-collecting)
* [Usual Firefox Telemetry is mostly unaffected](#usual-firefox-telemetry-is-mostly-unaffected)
* [Study-specific endings](#study-specific-endings)
* [`shield-study` pings (common to all shield-studies)](#shield-study-pings-common-to-all-shield-studies)
* [`shield-study-addon` pings, specific to THIS study.](#shield-study-addon-pings-specific-to-this-study)
* [`frecency-update` ping (schema)](#frecency-update-ping-schema)
  * [Example ping](#example-ping)
* [Example ping sequence](#example-ping-sequence)
* [References](#references)

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

Three main interactions with the awesome bar trigger a model update via study telemetry:

1. A suggestion was selected from the autocomplete popup
2. The autocomplete popup got some suggestions displayed but none were selected
3. The autocomplete popup did not get some suggestions displayed and none was selected

The following data is sent with this ping:

| name                                             | type              | description                                                                                                                                |
| ------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `model_version`                                  | integer           | the version of the model that all the other data is based on                                                                               |
| `frecency_scores`                                | array of integers | what scores did the model assign to the suggestions?                                                                                       |
| `loss`                                           | float             | a number quantifying how well the model worked                                                                                             |
| `update`                                         | array of floats   | the model improvement that the user is proposing                                                                                           |
| `num_suggestions_displayed`                      | integer           | how many suggestions were displayed?                                                                                                       |
| `rank_selected`                                  | integer           | what was the position of the selected suggestion? (-1 if none selected)                                                                    |
| `bookmark_and_history_num_suggestions_displayed` | integer           | how many history / bookmark suggestions were displayed?                                                                                    |
| `bookmark_and_history_rank_selected`             | integer           | what was the position of the selected history / bookmark suggestion? (-1 if none selected)                                                 |
| `num_key_down_events_at_selecteds_first_entry`   | integer           | how many keys did the user press down before the ultimately selected suggestion entered the list?                                          |
| `num_key_down_events`                            | integer           | how many keys did the user press down?                                                                                                     |
| `time_start_interaction`                         | integer           | the time when the awesome bar interaction started (always 0 since the the other timestamps are reported relative to this one)              |
| `time_end_interaction`                           | integer           | the time when the ultimately selected suggestion entered the list (relative to `time_start_interaction`, -1 if no suggestion was selected) |
| `time_at_selecteds_first_entry`                  | integer           | the time when the awesome bar interaction ended (relative to `time_start_interaction`)                                                     |
| `search_string_length`                           | integer           | the length of the awesome bar search string at the end of the interaction                                                                  |
| `selected_style`                                 | string            | the style attribute of the chosen suggestion (indicates the source of the suggestion)                                                      |
| `study_variation`                                | string            | in what variation is the user enrolled in (e.g. control)                                                                                   |
| `study_addon_version`                            | string            | the version of the study add-on                                                                                                            |

### Example ping

```json
{
  "frecency_scores": [38223, 3933.4, 304933.3, 21],
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

## Example ping sequence

These are the `payload` fields from all pings in the `shield-study` and `shield-study-addon` buckets.

```
// common fields

branch        dogfooding
study_name    federated-learning-v2@shield.mozilla.org
addon_version 2.1.0
version       3

2019-02-27T13:45:30.229Z shield-study
{
  "study_state": "installed"
}

2019-02-27T13:45:39.703Z shield-study-addon
{
  "attributes": {
    "bookmark_and_history_num_suggestions_displayed": "0",
    "bookmark_and_history_rank_selected": "-1",
    "frecency_scores": "[]",
    "loss": "0",
    "model_version": "140",
    "num_key_down_events": "11",
    "num_key_down_events_at_selecteds_first_entry": "11",
    "num_suggestions_displayed": "2",
    "rank_selected": "0",
    "search_string_length": "11",
    "selected_style": "action visiturl heuristic",
    "study_addon_version": "2.1.0",
    "study_variation": "dogfooding",
    "time_at_selecteds_first_entry": "3082",
    "time_end_interaction": "3184",
    "time_start_interaction": "0",
    "update": "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"
  }
}

2019-02-27T13:45:47.264Z shield-study-addon
{
  "attributes": {
    "bookmark_and_history_num_suggestions_displayed": "1",
    "bookmark_and_history_rank_selected": "0",
    "frecency_scores": "[41]",
    "loss": "0",
    "model_version": "140",
    "num_key_down_events": "4",
    "num_key_down_events_at_selecteds_first_entry": "1",
    "num_suggestions_displayed": "2",
    "rank_selected": "1",
    "search_string_length": "4",
    "selected_style": "favicon",
    "study_addon_version": "2.1.0",
    "study_variation": "dogfooding",
    "time_at_selecteds_first_entry": "4079",
    "time_end_interaction": "5993",
    "time_start_interaction": "0",
    "update": "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"
  }
}

2019-02-27T13:45:49.495Z shield-study-addon
{
  "attributes": {
    "bookmark_and_history_num_suggestions_displayed": "0",
    "bookmark_and_history_rank_selected": "-1",
    "frecency_scores": "[]",
    "loss": "0",
    "model_version": "140",
    "num_key_down_events": "6",
    "num_key_down_events_at_selecteds_first_entry": "6",
    "num_suggestions_displayed": "1",
    "rank_selected": "0",
    "search_string_length": "6",
    "selected_style": "action searchengine heuristic",
    "study_addon_version": "2.1.0",
    "study_variation": "dogfooding",
    "time_at_selecteds_first_entry": "755",
    "time_end_interaction": "1515",
    "time_start_interaction": "0",
    "update": "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"
  }
}
```

## References

* [Bugzilla bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1462109) detailing the data review request
* [ping schema](https://github.com/mozilla-services/mozilla-pipeline-schemas/tree/dev/templates/telemetry/frecency-update)
