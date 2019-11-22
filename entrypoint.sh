#!!bin!sh

# Edit sources with environment
sed -i -e "s!'tradeserverurl'!'$TRADESERVER_URL'!" admin/app/config.js
sed -i -e "s!'backendurl'!'$BACKEND_URL'!" admin/app/config.js
sed -i -e "s!'stpurl'!'$STP_URL'!" admin/app/config.js
sed -i -e "s!'beaconurl'!'$BEACON_URL'!" admin/app/config.js
sed -i -e "s!'reportingserviceurl'!'$REPORTINGSERVICE_URL'!" admin/app/config.js

hash=`cat .git/refs/heads/master`
hash=`echo $hash | cut -c1-10`
sed -i -e "s!'appRevision'!'$hash'!" admin/app/revision.js
sed -i -e "s!appRevision!$hash!" admin/healthcheck
