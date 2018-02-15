# Telemetry sent by this add-on

## Usual Firefox Telemetry is unaffected.

- No change: `main` and other pings are UNAFFECTED by this add-on.
- Respects telemetry preferences.  If user has disabled telemetry, no telemetry will be sent.

##  Study-specific endings

This study has no surveys and as such has NO SPECIFIC ENDINGS.

The STUDY SPECIFIC ENDINGS this study supports are:

- "voted",
- "notification-x"
- "window-or-fx-closed"

## `shield-study` pings (common to all shield-studies)

[shield-studies-addon-utils](https://github.com/mozilla/shield-studies-addon-utils) sends the usual packets.

## `shield-study-addon` pings, specific to THIS study.

Events instrumented in this study:

- UI
    - prompted (notification bar is shown)

- Interactions
    - voted

All interactions with the UI create sequences of Telemetry Pings.

All UI `shield-study` `study_state` sequences look like this:

- `enter => install => (one of: "voted" | "notification-x" |  "window-or-fx-closed") => exit`.

## Example sequence for a 'voted => not sure' interaction

These are the `payload` fields from all pings in the `shield-study` and `shield-study-addon` buckets.

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
