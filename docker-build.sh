#!/bin/sh

docker build -t ttv2/admin-frontend --build-arg TRADESERVER_URL=$TRADESERVER_URL\
    --build-arg BACKEND_URL=$BACKEND_URL\
    --build-arg STP_URL=$STP_URL\
    --build-arg BEACON_URL=$BEACON_URL\
    --build-arg REPORTINGSERVICE_URL=$REPORTINGSERVICE_URL .