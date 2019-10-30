var appName = "AdminApp";
// not used:
var minApiVersion = 2272;
// be obtained from os environment, don't change!
var tradeserverurl = 'tradeserverurl'; 
var backendurl = 'backendurl';
var stpurl = 'stpurl';
var beaconurl = 'beaconurl';
var reportingserviceurl = 'reportingserviceurl';

var apiurl = backendurl+"/rest";
var reportsurl = reportingserviceurl;
var stpapiurl = stpurl + "/rest";

var changepasswordurl = apiurl + "/portaladmin/changepassword.html";
var forgotpasswordurl = apiurl + "/portaladmin/forgotpassword.html";

// next lines should be removed in future
var cmdstartjfrs = "cd /opt/jfrs/domain;./startJFRS.sh";
var cmdstopjfrs = "cd /opt/jfrs/domain;./stopJFRS.sh";
var cmdstartbeacon = "cd /opt/beacon/domain;./start.sh";
var cmdstopbeacon = "cd /opt/beacon/domain;./stop.sh";
var cmdstartstp = "cd /opt/stp/domain;./run.sh";
var cmdstopstp = "cd /opt/stp/domain;./stop.sh";
var cmdrestarttradeserver = "cd /opt/tradeserver/domain/bin;./runner.sh ./restart.sh";
var cmdrestartall = "cd /opt/tradeserver/domain/bin;./runner.sh ./restartall.sh";
var cmdstartReports = "cd  /opt/tomcat;./start.sh";
var cmdstopReports = "cd  /opt/tomcat;./stop.sh";
