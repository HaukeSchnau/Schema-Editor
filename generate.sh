#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
pushd $SCRIPT_DIR > /dev/null

npm run generate "$@"

popd > /dev/null