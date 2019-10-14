var appName = "AdminApp";
var minApiVersion = 2272;
// assuming all services on a single host
//var host = "3.9.173.2";
var host = "localhost";

var tradeserverurl = "http://"+host+"/tradeserver";
var apiurl = "http://"+host+"/portaladmin/rest";
var stpurl = "http://"+host+"/stp";
var reportsurl = "http://"+host+"/reports";
var beaconurl = "http://"+host+"/beacon";


var stpapiurl = stpurl + "/rest";

var changepasswordurl = tradeserverurl + "/portaladmin/changepassword.html";
var forgotpasswordurl = tradeserverurl + "/portaladmin/forgotpassword.html";
//var stpapiurl = stpurl + "/stp/rest";
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
