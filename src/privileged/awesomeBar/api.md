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

### `browser.experiments.awesomeBar.onKeyDown ()` Event

Fires when a key is pressed down in the awesome bar (including meta/modifier keys). May repeat if key is held down.

**Parameters**

* `keyEvent`
  * type: keyEvent
  * $ref:
  * optional: false

### `browser.experiments.awesomeBar.onKeyPress ()` Event

Fires after one or a combination of keys has been pressed and lead to an input into the awesome bar (without information about which meta/modifier key was used). May repeat if key is held down.

**Parameters**

* `keyEvent`
  * type: keyEvent
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
    "searchStringLength": {
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
    "searchStringLength",
    "selectedStyle"
  ],
  "testcase": {
    "bookmarkAndHistoryRankSelected": -1,
    "bookmarkAndHistoryUrlSuggestions": [],
    "searchStringLength": 3,
    "numSuggestionsDisplayed": 11,
    "rankSelected": 2,
    "selectedStyle": "action searchengine suggestion"
  }
}
```

### [1] keyEvent

```json
{
  "id": "keyEvent",
  "$schema": "http://json-schema.org/draft-04/schema",
  "type": "object",
  "properties": {
    "charCode": {
      "type": "number"
    },
    "keyCode": {
      "type": "number"
    },
    "key": {
      "type": "string"
    },
    "altKey": {
      "type": "boolean"
    },
    "shiftKey": {
      "type": "boolean"
    },
    "ctrlKey": {
      "type": "boolean"
    },
    "metaKey": {
      "type": "boolean"
    }
  },
  "required": [
    "charCode",
    "keyCode",
    "key",
    "altKey",
    "shiftKey",
    "ctrlKey",
    "metaKey"
  ],
  "testcase": {
    "altKey": false,
    "charCode": 0,
    "ctrlKey": false,
    "key": "Enter",
    "keyCode": 13,
    "metaKey": false,
    "shiftKey": false
  }
}
```
