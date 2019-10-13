var appName = "VTAdminApp";
var minApiVersion = 2272;

var tradeserverurl = "http://localhost:8280";
var apiurl = "http://localhost/portaladmin/rest";
var stpurl = "http://localhost/stp";
var stpapiurl = stpurl + "/rest";
var reportsurl = "http://localhost/reports";

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
