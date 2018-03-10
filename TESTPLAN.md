# Test Plan for the 57-Perception-Study Addon

## User Experience / Functionality

During INSTALL ONLY users see:

- a notification bar

    -  introducing the feature.
    -  allowing them to opt out

During FIRST INSTALL and EVERY OTHER STARTUP, users see:

- a 'toolbar button' (webExtension BrowserAction)

    - with one of 3 images (Cat, Dog, Lizard)

Clicking on the button

- changes the badge
- sends telemetry

Icon will be the same every run.

If the user clicks on the badge more than 3 times, it ends the study.

### Loading the Web Extension in Firefox

You can have Firefox automatically launched and the add-on installed by running:

`$ npm run firefox`

To load the extension manually instead, open (preferably) the [Developer Edition of Firefox](https://www.mozilla.org/firefox/developer/) and load the `.xpi` using the following steps:

* Navigate to *about:config* and set `extensions.legacy.enabled` to `true`. This permits the loading of the embedded Web Extension since new versions of Firefox are becoming restricted to pure Web Extensions only.
* Navigate to *about:debugging* in your URL bar
* Select "Load Temporary Add-on"
* Find and select the `linked-addon.xpi` file you just built.

### Seeing the add-on in action

To debug installation and loading of extensions loaded in this manner, use the Browser Console which can be open from Firefox's top toolbar in `Tools > Web Developer > Browser Console`. This will display Shield (loading/telemetry) and `console.log()` output from the extensions that we build.

You should see a green puzzle piece icon in the browser address bar. You should also see the following in the Browser Console (`Tools > Web Developer > Browser Console`), which comes from this add-on:

```
install 5  bootstrap.js:125
startup ADDON_INSTALL  bootstrap.js:33
info {"studyName":"mostImportantExperiment","addon":{"id":"template-shield-study@mozilla.com","version":"1.0.0"},"variation":{"name":"kittens"},"shieldId":"8bb19b5c-99d0-cc48-ba95-c73f662bd9b3"}  bootstrap.js:67
1508111525396	shield-study-utils	DEBUG	log made: shield-study-utils
1508111525398	shield-study-utils	DEBUG	setting up!
1508111525421	shield-study-utils	DEBUG	firstSeen
1508111525421	shield-study-utils	DEBUG	telemetry in:  shield-study {"study_state":"enter"}
1508111525421	shield-study-utils	DEBUG	getting info
1508111525423	shield-study-utils	DEBUG	telemetry: {"version":3,"study_name":"mostImportantExperiment","branch":"kittens","addon_version":"1.0.0","shield_version":"4.1.0","type":"shield-study","data":{"study_state":"enter"},"testing":true}
1508111525430	shield-study-utils	DEBUG	startup 5
1508111525431	shield-study-utils	DEBUG	getting info
1508111525431	shield-study-utils	DEBUG	marking TelemetryEnvironment: mostImportantExperiment
1508111525476	shield-study-utils	DEBUG	telemetry in:  shield-study {"study_state":"installed"}
1508111525477	shield-study-utils	DEBUG	getting info
1508111525477	shield-study-utils	DEBUG	telemetry: {"version":3,"study_name":"mostImportantExperiment","branch":"kittens","addon_version":"1.0.0","shield_version":"4.1.0","type":"shield-study","data":{"study_state":"installed"},"testing":true}
1508111525479	shield-study-utils	DEBUG	getting info
1508111525686	shield-study-utils	DEBUG	getting info
1508111525686	shield-study-utils	DEBUG	respondingTo: info
init kittens  background.js:29:5
```

Note: This add-on force assigns users to the `kitten` group/variation (in `addon/Config.jsm`), which is why the console will always report `init kittens`.

Click on the web extension's green 'puzzle piece' icon to trigger additional console output and sending of telemetry data.

To end early: Click on button multiple times until the 'too-popular' endpoint is reached. This will result in the uninstallation of the extension, and the user will be sent to the URL specified in `addon/Config.jsm` under `endings -> too-popular`.

That's it! The rest is up to you. Fork the repo and hack away.

## Automated Testing

`npm test` verifies the telemetry payload as expected at Firefox startup and add-on installation in a clean profile, then does **optimistic testing** of the *commonest path* though the study for a user

- prove the notification bar ui opens
- *clicking on the left-most button presented*.
- verifying that sent Telemetry is correct.

Code at [/test/functional_tests.js](/test/functional_tests.js).

## Manual / QA TEST Instructions

Assumptions / Thoughts

1.  Please ask if you want  more command-line tools to do this testing.

### BEFORE EACH TEST: INSTALL THE ADDON to a CLEAN (NEW) PROFILE

1. (create profile: <https://developer.mozilla.org/Firefox/Multiple_profiles>, or via some other method)
2. In your Firefox profile
3. `about:debugging` > `install temporary addon`

As an alternative (command line) CLI method:

1. `git clone` the directory.
2. `npm install` then `npm run firefox` from the GitHub (source) directory.


### Note: checking "Correct Pings"

All interactions with the UI create sequences of Telemetry Pings.

All UI `shield-study` `study_state` sequences look like this:

- `enter => install => (one of: "voted" | "notification-x" |  "window-or-fx-closed") => exit`.

(Note: this is complicated to explain, so please ask questions and I will try to write it up better!, see [TELEMETRY.md](/TELEMETRY.md) and EXAMPLE SEQUENCE below.)

### Do these tests.

1.  UI APPEARANCE.  OBSERVE a notification bar with these traits:

    *  Icon is 'heartbeat'
    *  Text is one of 8 selected "questions", such as:  "Do you like Firefox?".  These are listed in [/addon/Config.jsm](/addon/Config.jsm) as the variable `weightedVariations`.
    *  clickable buttons with labels 'yes | not sure | no'  OR 'no | not sure | yes' (50/50 chance of each)
    *  an `x` button at the right that closes the notice.

    Test fails IF:

    - there is no bar.
    - elements are not correct or are not displayed


2.  UI functionality: VOTE

    Expect:  Click on a 'vote' button (any of: `yes | not sure | no`) has all these effects

    - notice closes
    - addon uninstalls
    - no additional tabs open
    - telemetry pings are 'correct' with this SPECIFIC `study_state` as the ending

        - ending is `voted`
        - 'vote' is correct.

3.  UI functionality: 'X' button

    Click on the 'x' button.

    - notice closes
    - addon uninstalls
    - no additional tabs open
    - telemetry pings are 'correct' with this SPECIFIC ending

      - ending is `notification-x`

4.  UI functionality  'close window'

    1.  Open a 2nd Firefox window.
    2.  Close the initial window.

    Then observe:

    - notice closes
    - addon uninstalls
    - no additional tabs open
    - telemetry pings are 'correct' with this SPECIFIC ending

      - ending is `window-or-fx-closed`


---

## Helper code and tips

### ***To open a Chrome privileged console***

1.  `about:addons`
2.  `Tools > web developer console`

Or use other methods, like Scratchpad.


### **Telemetry Ping Printing Helper Code**

```javascript
async function printPings() {
  async function getTelemetryPings (options) {
    // type is String or Array
    const {type, n, timestamp, headersOnly} = options;
    Components.utils.import("resource://gre/modules/TelemetryArchive.jsm");
    // {type, id, timestampCreated}
    let pings = await TelemetryArchive.promiseArchivedPingList();
    if (type) {
      if (!(type instanceof Array)) {
        type = [type];  // Array-ify if it's a string
      }
    }
    if (type) pings = pings.filter(p => type.includes(p.type));
    if (timestamp) pings = pings.filter(p => p.timestampCreated > timestamp);

    pings.sort((a, b) => b.timestampCreated - a.timestampCreated);
    if (n) pings = pings.slice(0, n);
    const pingData = headersOnly ? pings : pings.map(ping => TelemetryArchive.promiseArchivedPingById(ping.id));
    return Promise.all(pingData);
  }
  async function getPings() {
    const ar = ["shield-study", "shield-study-addon"];
    return getTelemetryPings({type: ar});
  }

  const pings = (await getPings()).reverse();
  const p0 = pings[0].payload;
  // print common fields
  console.log(
    `
// common fields

branch        ${p0.branch}        // should describe Question text
study_name    ${p0.study_name}
addon_version ${p0.addon_version}
version       ${p0.version}

    `
  );

  pings.forEach(p => {
    console.log(p.creationDate, p.payload.type);
    console.log(JSON.stringify(p.payload.data, null, 2));
  });
}

printPings();
```


### Example sequence for a 'voted => not sure' interaction

See [TELEMETRY.md](/TELEMETRY.md), EXAMPLE SEQUENCE section at the bottom.
