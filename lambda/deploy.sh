#!/bin/bash

REGION="us-west-2"
FUNCTION="answerBySelectedNum"
PROFILE_NAME="default"

zip -r ${FUNCTION}.zip index.js node_modules
mv ${FUNCTION}.zip /tmp/
aws lambda update-function-code --region ${REGION} --function-name ${FUNCTION} --zip-file fileb:///tmp/${FUNCTION}.zip --publish --profile ${PROFILE_NAME}
