# Base Template for Shield Studies Addons



## Features

- `eslint`

    - es6 for lib, data, test
    - browser, not node for `data/`

- `addons-linter` with `.addonslinterrc`

- ci with Travis OR CircleCi

- ability to do code coverage [TODO]

## General Setup and Install

```
npm install
```

## Adding a new npm library

```
npm install --save-dev somelibrary
#edit .jpmignore to allow it in
```


