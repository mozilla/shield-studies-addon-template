#!/usr/bin/env bash

# fail on any error
set -o errexit

# always run from the repository root directory
script_path=`dirname $0`
cd "$script_path/.."

# paths
WEBEXTAPIS_PATH="node_modules/shield-studies-addon-utils/webExtensionApis"
ADDON_SRC_PATH="src"

# bundle the study web extension experiment
mkdir -p $ADDON_SRC_PATH/privileged/study
cp $WEBEXTAPIS_PATH/study/api.js $ADDON_SRC_PATH/privileged/study/api.js
cp $WEBEXTAPIS_PATH/study/schema.json $ADDON_SRC_PATH/privileged/study/schema.json

# bundle the prefs web extension experiment
mkdir -p $ADDON_SRC_PATH/privileged/prefs
cp $WEBEXTAPIS_PATH/prefs/api.js $ADDON_SRC_PATH/privileged/prefs/api.js
cp $WEBEXTAPIS_PATH/prefs/schema.json $ADDON_SRC_PATH/privileged/prefs/schema.json
