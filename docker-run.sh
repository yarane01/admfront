#!/bin/sh

docker run \
  -p 8000:80 \
  --name admin-frontend \
  -d ttv2/admin-frontend