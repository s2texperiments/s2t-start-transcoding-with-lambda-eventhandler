#!/bin/bash

mkdir deploy
zip -r deploy/s2t-start-transcoding-with-lambda-eventhandler.zip index.js snsApi.js node_modules/
