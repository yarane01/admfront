var appName = "VTAdminApp";
var minApiVersion = 2272;
var tradeserverurl = location.hostname == "localhost" ?
    // "http://3.9.173.2:8280" :
    "https://ttdev.thinkmarkets.com:7443" :
    //"https://ec2-54-69-141-245.us-west-2.compute.amazonaws.com" : //superuser superuser
    // "https://trd.vtdata.nyc":
    //"http://localhost:8000/proxy" :
    //"http://54.88.79.94:81":
    //    "https://trda.vtdata.nyc" : //superuser/xz11c3di
    //  "https://trdprm.vtdata.nyc":
    //"https://dev6.vtdata.nyc":
    location.origin;

var apiurl = tradeserverurl + "/portaladmin/rest";
var stpurl = tradeserverurl + '/stp';
var reportsurl;
var changepasswordurl = tradeserverurl + "/portaladmin/changepassword.html";
var forgotpasswordurl = tradeserverurl + "/portaladmin/forgotpassword.html";
//var stpapiurl = stpurl + "/stp/rest";
var stpapiurl = stpurl + "/rest";
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
