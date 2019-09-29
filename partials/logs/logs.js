angular.module('portal')
    .controller('LogsCtrl',
    ['$q', '$scope', '$rootScope', '$http', '$timeout',
        function ($q, $scope, $rootScope, $http, $timeout) {

            $rootScope.activePage = "logs";

            var currentfile, currentpanel;


            function createLogContext(title, logPath) {
                return {
                    logs: [],
                    loading: false,
                    loaded: false,
                    error: false,
                    errorMessage: "",
                    title: title,
                    logPath: logPath
                }
            }

            $scope.context = {
                loaded: false,
                grep: "",
                lines: 50,
                logfile: '',
                logsource: '',
                log: "",
                tradeserver: createLogContext("Trade Server", "/opt/logs/tradeserver"),
                beacon: createLogContext("Beacon", "/opt/logs/beacon"),
                // jfrs: createLogContext("JFRS", "/opt/logs/jfrs"),
                stpe: createLogContext("STP", "/opt/logs/stpe"),
                reports: createLogContext("Reports", "/opt/tomcat/logs")
            };

            $scope.panels = [$scope.context.tradeserver,
                $scope.context.beacon,
                // $scope.context.jfrs,
                $scope.context.stpe //,
//                $scope.context.reports
];

            function getlogfiles(context) {
                return $http.post(apiurl + '/execonserver', '{"command":"ls -l ' + context.logPath + '|grep log"}')
                    .success(function (data, status, headers, config) {
                        if (data.status == 'OK') {
                            context.logs.length = 0;
                            var log = data.payload[0].output;
                            var lines = log.split("\n");
                            for (var i = 0; i < lines.length; i++) {
                                var line = lines[i];
                                line = line.replace(/\s\s+/g, ' ');
                                var items = line.split(" ");
                                if (items.length >= 9) {
                                    var f = {};
                                    f.name = items[8];
                                    //1048576
                                    f.size = items[4];
                                    if (f.size > 0) {
                                        if (f.size > 1048576) {
                                            f.size = (f.size / 1048576).toFixed(0).toString();
                                            f.sizetype = 'Mb';
                                        }
                                        else if (f.size > 1024) {
                                            f.size = (f.size / 1024).toFixed(0).toString();
                                            f.sizetype = 'Kb';
                                        }
                                        else
                                            f.sizetype = 'B';
                                        context.logs.push(f);
                                    }
                                }
                            }
                            context.logs.sort(function (item1, item2) {
                                return item1.name.localeCompare(item2.name);
                            })
                        }
                        else {

                        }
                    });
            }

            function getLog() {
                $scope.context.loaded = false;
                var file = currentpanel.logPath + '/' + currentfile;
                var command;
                if ($scope.context.grep == "") {
                    command = '{"command":"tail -n ' + $scope.context.lines + ' ' + file + '"}';
                } else {
                    command = '{"command":"grep ' + $scope.context.grep + ' ' + file + '|tail -n ' + $scope.context.lines + '"}';
                }
                $http.post(apiurl + '/execonserver', command)
                    .success(function (data, status, headers, config) {
                        var log = data.payload[0].output;
                        $scope.context.log = log;
                        $scope.context.loaded = true;
                    })
                    .error(function (data, status) {
                        $scope.context.log = data;
                        $scope.context.loaded = true;
                    });
            };

            function getLogs(context) {
                context.error = false;
                context.loading = true;
                getlogfiles(context)
                    .then(function (data) {
                        context.loading = false;
                        if (data.data.status == 'Fail') {
                            context.errorMessage = data.data.payload[0];
                            context.error = true;
                        }
                    });
            }

            $scope.Refresh = function (index) {
                getLogs($scope.panels[index]);
            }

            $scope.showLog = function (index, logname) {
                currentfile = logname;
                currentpanel = $scope.panels[index];
                $scope.context.logfile = logname;
                getLog();
                $('#logWindow').modal();
            }

            $scope.refreshlog = function () {
                getLog();
            };

            $scope.panels.forEach(function (p) {
                    getLogs(p);
                }
            )
        }
    ]);

