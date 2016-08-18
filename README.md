# Base Template for Shield Studies Addons

## Features

- `eslint`

    - es6 for lib, data, test
    - browser, not node for `data/`

- `addons-linter` with `.addonslinterrc`

- ci with Travis OR CircleCi

- ability to do code coverage [TODO]

- uses Grunt to do some of the heavy lifting.  Sorry if you hate Grunt.

## General Setup and Install

```
npm install
```

## Adding a new npm library

```
npm install --save-dev somelibrary
#edit .jpmignore to allow it in
```

## Contribute

Issues on this Github :)

## Strong Assumptions and Opinions

1.  All code lives in `lib` and is ES6.
2.  All website stuff (web-workers, ui) lives in `data`
3.  Index at `lib/index.js`
4.  Grunt, b/c it makes instrument / coverage easier

