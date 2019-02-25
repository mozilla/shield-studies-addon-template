# Namespace: `browser.experiments.awesomeBar`

Listen to awesome bar interactions

## Functions

### `browser.experiments.awesomeBar.start( )`

Start listening to awesome bar interactions

**Parameters**

### `browser.experiments.awesomeBar.stop( )`

Stop listening to awesome bar interactions

**Parameters**

## Events

### `browser.experiments.awesomeBar.onAutocompleteSuggestionSelected ()` Event

Fires when a suggestion has been suggested in the awesome bar autocomplete popup.

**Parameters**

* `awesomeBarState`
  * type: awesomeBarState
  * $ref:
  * optional: false

### `browser.experiments.awesomeBar.onFocus ()` Event

Enter the awesome bar

**Parameters**

* `awesomeBarState`
  * type: awesomeBarState
  * $ref:
  * optional: false

### `browser.experiments.awesomeBar.onBlur ()` Event

Exit the awesome bar

**Parameters**

* `awesomeBarState`
  * type: awesomeBarState
  * $ref:
  * optional: false

### `browser.experiments.awesomeBar.onInput ()` Event

Character typed/deleted

**Parameters**

* `awesomeBarState`
  * type: awesomeBarState
  * $ref:
  * optional: false

### `browser.experiments.awesomeBar.onAutocompleteSuggestionsHidden ()` Event

Fires when autocomplete popup has been cancelled by some means, like pressing escape

**Parameters**

* `awesomeBarState`
  * type: awesomeBarState
  * $ref:
  * optional: false

### `browser.experiments.awesomeBar.onAutocompleteSuggestionsUpdated ()` Event

Autocomplete suggestions changed

**Parameters**

* `awesomeBarState`
  * type: awesomeBarState
  * $ref:
  * optional: false

## Properties TBD

## Data Types

### [0] awesomeBarState

```json
{
  "id": "awesomeBarState",
  "$schema": "http://json-schema.org/draft-04/schema",
  "type": "object",
  "properties": {
    "rankSelected": {
      "type": "number"
    },
    "numCharsTyped": {
      "type": "number"
    },
    "numSuggestionsDisplayed": {
      "type": "number"
    },
    "suggestions": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "numSuggestionsDisplayed",
    "rankSelected",
    "bookmarkAndHistoryUrlSuggestions",
    "bookmarkAndHistoryRankSelected",
    "numCharsTyped",
    "selectedStyle"
  ],
  "testcase": {
    "bookmarkAndHistoryRankSelected": -1,
    "bookmarkAndHistoryUrlSuggestions": [],
    "numCharsTyped": 3,
    "numSuggestionsDisplayed": 11,
    "rankSelected": 2,
    "selectedStyle": "action searchengine suggestion"
  }
}
```
