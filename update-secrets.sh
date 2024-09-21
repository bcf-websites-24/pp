#!/bin/bash

if [ ! -f .env.cloud ]; then
  echo "No .env.cloud file found"
  exit 1
fi

gh secret set ENV_LOCAL --body "$(cat .env.cloud | base64)"