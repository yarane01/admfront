var dashboardControllers = angular.module('dashboardControllers', []);

dashboardControllers.controller('StatCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal) {

            $rootScope.activePage = "home";
            $scope.context = {
                createUnit: false,
                createGroup: false,
                createUser: false,
                createAccount: false,
                dataerror: false,
                dataloaded: false,
                toNode: null,
                fromNode: null
            };

            $scope.createUnitDialog = function () {
                $scope.unit = $rootScope.units.getEmpty();
                modal.showCreateUnitDialog($scope);
            };

            $scope.createGroupDialog = function () {
                $scope.group = $rootScope.groups.getEmpty();
                modal.showCreateGroupDialog($scope);
            };

            $scope.createUserDialog = function () {
                $scope.user = $rootScope.users.getEmpty();
                modal.showCreateUserDialog($scope);
            };

            $scope.createAccountDialog = function () {
                $scope.account = $rootScope.accounts.getEmpty();
                modal.showCreateAccountDialog($scope, false, true);
            };

            $scope.createUnit = function () {
                $scope.context.inprogress = true;
                api.createUnit($scope.unit, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            $scope.context.inprogress = false;
                            $("#createUnit").modal('hide');
                            $rootScope.units.upToDate = false;
                            $rootScope.updateUnits();
                        }
                    }
                ));
            };

            $scope.createGroup = function () {
                $scope.context.inprogress = true;
                api.createGroup($scope.group, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            $scope.context.inprogress = false;
                            $("#createGroup").modal('hide');
                            $rootScope.groups.upToDate = false;
                            $rootScope.updateGroups();
                        }
                    }
                ));
            };

            $scope.createUser = function () {
                $scope.context.inprogress = true;
                api.createUser($scope.user, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            $scope.context.inprogress = false;
                            $('#createUser').modal('hide');
                            $rootScope.updateUserCount();
                        }
                    }
                ));

            };

            $scope.createAccount = function () {
                $scope.context.inprogress = true;
                api.createAccount($scope.account, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            $scope.context.inprogress = false;
                            $('#createAccount').modal('hide');
                            $rootScope.updateAccountsCount();
                        }
                    }
                ));
            };

            $rootScope.updateAccountsCount();
            $rootScope.updateUserCount();
            $rootScope.init().then(
                function (error) {
                    if (error) {
                        $scope.context.dataerror = true;
                        $scope.context.errorMessage = error.statusText;
                    }
                    else {
                        $scope.context.dataloaded = true;
                    }
                })
        }
    ])

dashboardControllers.controller('APIVersionCtrl',
    ['$rootScope', '$scope',
        function ($rootScope, $scope) {
            $scope.error = false;
            $rootScope.init().then(
                function (error) {
                    if (!error) {
                        if ($rootScope.apiVersion < minApiVersion) {
                            $scope.errorMessage = "Current API version is " +
                                $rootScope.apiVersion +
                                " Minimal version must be " + minApiVersion +
                                ". Some features may be broken.";
                            $scope.error = true;
                        }
                    }
                })

        }
    ])

dashboardControllers.controller('DashboardCtrl',
    ['$rootScope', '$scope',
        function ($rootScope, $scope) {
            $scope.$on("$destroy", function () {
                savePanels("#dashboard", 'portal.dashboard')
            });
        }
    ])


dashboardControllers.controller('OnlineUsersCtrl',
    ['$location', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal',
        function ($location, $rootScope, $scope, $http, api, $timeout, modal) {

            if (!$rootScope.access.dashboard.OnlineUsers()) return;
            $scope.context = {
                dataerror: false,
                dataloaded: false,
                filter: ""
            };

            var interval = 0;
            var busy = false;
            var getUsers = function () {
                if (busy)return;
                busy = true;
                api.getOnlineUsers(angular.extend(errorHandler($scope),
                    //api.getUsers(angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            busy = false;
                            $scope.users = response.data.payload[0];
                            $scope.context.dataloaded = true;
                        },
                        error: function (response) {
                            busy = false;
                            $scope.users = undefined;
                            $scope.context.dataloaded = true;
                            $scope.context.errorMessage = response.data.payload[0];
                            if ($scope.context.errorMessage == '')
                                $scope.context.errorMessage = "Request failed";
                            $scope.context.error = true;
                        }
                    }
                ));
            }

            $scope.$on("$destroy", function () {
                if (interval > 0)
                    clearInterval(interval);
            });
            getUsers();
            if ($rootScope.config.autoupdate)
                interval = setInterval(getUsers, 10000);

            $scope.Refresh = function () {
                $scope.context.dataloaded = false;
                getUsers();
            };

            $scope.clearFilter = function () {
                $scope.context.filter = "";
            };


            $scope.goUser = function (name) {
                $rootScope.users.state.externalFilter.name = name;
                $rootScope.users.state.externalFilter.applied = false;
                $location.path("/users");
            }

        }
    ])

dashboardControllers.controller('ModulesInfoCtrl',
    ['$location', '$scope', '$rootScope', '$http', '$route', '$window',
        function ($location, $scope, $rootScope, $http, $route, $window) {
            if (!$rootScope.access.dashboard.Modules()) return;
            $scope.context = {
                dataloaded: false
            }
            var interval = 0;
            var busy = false;

            var getInfo = function () {
                if (busy)return;
                busy = true;

                var command = '{"command":"ps -ef|grep java"}';

                $http.get(apiurl + '/mt4sync/status')
                    .then(
                        function (response) {
                            if (response.data.status == 'OK') {
                                $scope.mt4status = response.data.payload[0].toUpperCase();
                            }
                        }
                    )

                $http.get(reportsurl + '/ping')
                    .then(
                        function (response) {
                            $scope.reportStatus = 'RUNNING';
                        },
                        function (response) {
                            $scope.reportStatus = 'STOPPED';
                        }
                    )

                $http.post(apiurl + '/execonserver', command).success(function (data, status, headers, config) {
                    busy = false;

                    if (data.status == 'OK') {
                        var s = data.payload[0]["output"];
                        if (s.indexOf("vtstart") > 0) {
                            $scope.tradeserverstatus = "RUNNING";
                        } else {
                            $scope.tradeserverstatus = "STOPPED";
                        }
                        if (s.indexOf("beacon") > 0) {
                            $scope.beaconstatus = "RUNNING";
                        } else {
                            $scope.beaconstatus = "STOPPED";
                        }
                        if (s.indexOf("jfrs") > 0) {
                            $scope.jfrsstatus = "RUNNING";
                        } else {
                            $scope.jfrsstatus = "STOPPED";
                        }
                        if (s.indexOf("STPE") > 0) {
                            $scope.stpstatus = "RUNNING";
                        } else {
                            $scope.stpstatus = "STOPPED";
                        }
                        $http.get(apiurl + '/feedbridge')
                            .success(function (data1, status1, headers1, config1) {
                                if (data1.status == 'OK') {
                                    $scope.feedbridgestatus = data1.payload[0];
                                    $scope.feedbridgestatus =
                                        $scope.feedbridgestatus.substring($scope.feedbridgestatus.indexOf(":") + 1, $scope.feedbridgestatus.length).trim();
                                }
                            })
                            .finally(function () {
                                $scope.context.dataloaded = true;
                            });

                    } else {
                        $scope.context.errorMessage = data.payload[0];
                        $scope.context.dataerror = true;
                        $scope.context.dataloaded = true;
                    }
                }).error(function (data, status, headers, config) {
                    $scope.context.errorMessage = data.payload[0];
                    $scope.context.dataerror = true;
                    $scope.context.dataloaded = true;

                    busy = false;
                });
            };

            $scope.startFeedBridge = function () {
                $http.put(apiurl + '/feedbridge', '{"action":"start"}');
            };

            $scope.stopFeedBridge = function () {
                $http.put(apiurl + '/feedbridge', '{"action":"stop"}');
            };

            $scope.startJFRS = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdstartjfrs + '"}');
            };

            $scope.stopJFRS = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdstopjfrs + '"}');
            };

            $scope.startBeacon = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdstartbeacon + '"}');
            };

            $scope.stopBeacon = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdstopbeacon + '"}');
            };

            $scope.startSTP = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdstartstp + '"}');
            };

            $scope.stopSTP = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdstopstp + '"}');
            };

            $scope.startReports = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdstartReports + '"}');
            };

            $scope.stopReports = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdstopReports + '"}');
            };

            $scope.startMT4 = function () {
                $http.get(apiurl + '/mt4sync/start')
            };

            $scope.stopMT4 = function () {
                $http.get(apiurl + '/mt4sync/stop')
            };

            $scope.restartTradeserver = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdrestarttradeserver + '"}')
                //$http.get(apiurl + '/logout')
                    .then(function () {
                            var restartInfo = {
                                module: "Trade Server",
                                wait: 30
                            }
                            localStorage.setItem("portal.restart", JSON.stringify(restartInfo));
                            $window.location.reload();
                        }
                    )
            }

            $scope.restartall = function () {
                $http.post(apiurl + '/execonserver', '{"command":"' + cmdrestartall + '"}')
                //$http.get(apiurl + '/logout')
                    .then(function () {
                            var restartInfo = {
                                module: "All",
                                wait: 60
                            }
                            localStorage.setItem("portal.restart", JSON.stringify(restartInfo));
                            $window.location.reload();
                        }
                    )
            }

            $scope.$on("$destroy", function () {
                if (interval > 0)
                    clearInterval(interval);
            });


            getInfo();
            if ($rootScope.config.autoupdate)
                interval = setInterval(getInfo, UPDATE_INTERVAL);

            $scope.Refresh = function () {
                //clearInterval(interval);
                $scope.context.dataloaded = false;
                getInfo();
            }

        }
    ])

dashboardControllers.controller('FeedProvidersCtrl', FeedProvidersCtrl);

function FeedProvidersCtrl($rootScope, $scope, $http, $timeout, feedproviders) {

    if (!$rootScope.access.dashboard.Feed()) return;
    $scope.context = {
        dataloaded: false,
        inprogress: false
    };

    $scope.ConnectFeed = function (bank) {
        $scope.putToServer([{bank: bank, connectFeed: true}]);
    };

    $scope.DisconnectFeed = function (bank) {
        $scope.putToServer([{bank: bank, connectFeed: false}]);
    };

    $scope.ConnectTrading = function (bank) {
        $scope.putToServer([{bank: bank, connectTrading: true}]);
    };

    $scope.DisconnectTrading = function (bank) {
        $scope.putToServer([{bank: bank, connectTrading: false}]);
    };

    $scope.Refresh = function () {
        $scope.context.dataloaded = false;
        $scope.context.dataerror = false;
        $scope.context.inprogress = false;
        $scope.context.error = false;
        feedproviders.refresh()
            .then(function () {
                    if (!feedproviders.error())
                        fill(feedproviders.getProviders());
                    else {
                        $scope.context.errorMessage = feedproviders.error();
                        $scope.context.dataerror = true;
                        $scope.context.dataloaded = true;
                    }
                }, function () {
                    $scope.context.errorMessage = feedproviders.error();
                    $scope.context.dataerror = true;
                    $scope.context.dataloaded = true;
                }
            )
    };

    $scope.putToServer = function (data) {
        $scope.context.inprogress = true;
        //var auth = $rootScope.getAuthHeader();
        $http.post(stpapiurl + '/GetProviders', data)//, {headers: auth})
            .success(function (data) {
                if (data.status == 'OK') {
                    $timeout(function () {
                        $scope.Refresh();
                    }, 2000);
                }
                else {
                    $scope.context.errorMessage = data.payload[0];
                    $scope.context.error = true;
                    $scope.context.dataloaded = true;
                    $scope.context.inprogress = false;
                }
            })
            .error(function (data) {
                $scope.context.errorMessage = data;
                $scope.context.error = true;
                $scope.context.dataloaded = true;
                $scope.context.inprogress = false;
            });

    }

    function fill(data) {
        $scope.feedproviders = [];
        for (var i = 0; i < data.length; i++) {
            $scope.feedproviders.push(data[i]);
        }
        $scope.context.error = false;
        $scope.context.dataerror = false;
        $scope.context.dataloaded = true;
    }

    $scope.Refresh();
}

dashboardControllers.controller('OSInfoCtrl',
    ['$scope', '$rootScope', 'systemInfo', function ($scope, $rootScope, systemInfo) {
        if (!$rootScope.access.dashboard.System()) return

        $scope.config = angular.extend($rootScope.config);

        $scope.context = {dataloaded: false}

        var cpuChart = undefined;
        var memChart = undefined;
        var gaugesChart = undefined;

        if (systemInfo.loaded()) update();

        $scope.Refresh = function () {
            systemInfo.update();
        };

        $scope.Minimize = function () {
            cpuChart.draw();
            memChart.draw();
        };

        $scope.Maximize = function () {
            cpuChart.draw();
            memChart.draw();
        };

        function update() {
            if (!systemInfo.loaded()) return;
            if (systemInfo.error()) {
                $scope.context.errorMessage = systemInfo.errorMessage();
                $scope.context.dataerror = true;
                $scope.context.dataloaded = true;
                clearInterval(interval);
            }
            else {
                $scope.disks = systemInfo.disks();
                $scope.totalmemory = systemInfo.totalMemory().toFixed(0);
                $scope.freememory = systemInfo.freeMemory().toFixed(0);
                $scope.swapused = systemInfo.swap().toFixed(0);
                $scope.cpu = systemInfo.CPU().toFixed(1);
                $scope.javamaxmemory = systemInfo.javaMaxMemory().toFixed(0);
                $scope.javatotalmemory = systemInfo.javaTotalMemory().toFixed(0);
                $scope.javafreememory = systemInfo.javaFreeMemory().toFixed(0);
                if (googleInitilized) {
                    if (!cpuChart) {
                        cpuChart = new Chart('Area', 'cpu-chart', {
                            title: 'CPU Usage %',
                            //bar: {groupWidth: "5"},
                            height: '100',
                            initWithZero: true,
                            hAxis: {textPosition: 'none'},
                            maxLength: chartLength
                        });
                        var last = systemInfo.getLast(chartLength);
                        for (var i = 0; i < last.length; i++) {
                            var info = last[i];
                            cpuChart.addRow(info.time.format('HH:mm:ss'), info.cpu);
                        }
                        cpuChart.draw();
                    }
                    else {
                        cpuChart.addRow(moment().format('HH:mm:ss'), systemInfo.CPU());
                        cpuChart.draw();
                    }
                    if (!memChart) {
                        memChart = new Chart('Area', 'mem-chart', {
                            title: 'Trade Server free memory, Mb',
                            height: '100',
                            initWithZero: true,
                            hAxis: {textPosition: 'none'},
                            maxLength: chartLength
                        });
                        var last = systemInfo.getLast(chartLength);
                        for (var i = 0; i < last.length; i++) {
                            var info = last[i];
                            memChart.addRow(info.time.format('HH:mm:ss'), info.javafreememory);
                        }
                        memChart.draw();
                    }
                    else {
                        memChart.addRow(moment().format('HH:mm:ss'), systemInfo.javaFreeMemory());
                        memChart.draw();
                    }
                    var mem = (systemInfo.totalMemory() - systemInfo.freeMemory()) / systemInfo.totalMemory() * 100;
                    if (!gaugesChart) {
                        gaugesChart = new Gauges();
                        gaugesChart.update(mem, systemInfo.CPU());
                    }
                    else {
                        gaugesChart.update(mem, systemInfo.CPU());
                    }
                }
                if (!$scope.context.dataloaded)
                    $scope.context.dataloaded = true;
            }
        }

        var listener = $rootScope.$on("osinfochanged", function () {
            update();
        });

        $scope.$on("$destroy", function () {
            listener();
        });

    }
    ]);

dashboardControllers.controller('PricesCtrl',
    ['quotes', '$scope', '$rootScope', '$http', '$timeout',
        function (quotes, $scope, $rootScope, $http, $timeout) {
            if (!$rootScope.access.dashboard.Rates()) return;
            $scope.context = {
                dataloaded: false,
                storageName: 'rates'
            }

            $scope.init = function () {
                $scope.context.dataloaded = false;
                var symbols = getStoredSymbols('rates');
                console.log('Inside PricesCtrl');
                console.log('symbols '+symbols.list);
                quotes.update();
                quotes.init().then(function () {
                    $scope.symbols = {};
                    symbols.list.forEach(function (s) {
                            $scope.symbols[s] = $rootScope.symbols.getFirstProvider(s);
                        }
                    )
                    $scope.Refresh();
                    $scope.context.dataloaded = true;
                });
            }

            $scope.Refresh = function () {
                console.log('Inside dashboard PricesCtrl Refresh '+$scope.symbols);
                quotes.update();
            }

//------------------ settings

            $scope.settingsDialog = function () {
                $scope.context.showSettings = true;
                $timeout(function () {
                    $('#ratesSettings').modal().on('hidden.bs.modal',
                        function () {
                            $scope.context.showSettings = false;
                            $scope.$apply();
                        }
                    )
                }, 0);
            }

//------------------ settings

            $scope.init();
        }
    ]);


/*
 dashboardControllers.controller('OrdersInQueueCtrl',
 ['$scope', '$http', '$routeParams',
 function ($scope, $http, $routeParams) {
 var interval = 0;
 $scope.context = {dataloaded: false}
 var getOrdersInQueue = function getOrdersInQueue() {
 $http.get(apiurl + '/ordersinqueue/100').
 success(function (data, status, headers, config) {
 if (data.status == 'OK') {
 $scope.ordersinqueue = data.payload[0];
 //if (!$scope.context.dataloaded)
 } else {
 $scope.context.errorMessage = data.payload[0];
 $scope.context.dataerror = true;
 }
 $scope.context.dataloaded = true;
 }).
 error(function (data, status, headers, config) {
 $scope.context.errorMessage = data.payload[0];
 $scope.context.dataerror = true;
 $scope.context.dataloaded = true;
 clearInterval(interval);
 });
 };

 $scope.$on("$destroy", function () {
 clearInterval(interval);
 });
 $scope.refresh = function () {
 interval = setInterval(getOrdersInQueue, UPDATE_INTERVAL);
 };
 $scope.stop = function () {
 if (interval != 0) {
 clearInterval(interval);
 interval = 0;
 }
 };
 //$scope.refresh();
 getOrdersInQueue();

 }
 ]);
 */

dashboardControllers.controller('TreeCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal) {
            $rootScope.activePage = "home";
            $scope.context = {
                hideServiceAccounts: true,
                showUnits: true,
                showUsers: true,
                showAccounts: true,
                showGroups: true,
                changeParentTo: 0,
                filter: "",
                selected: undefined,
                createUnit: false,
                createGroup: false,
                createUser: false,
                createAccount: false,
                dataloaded: false,
                dataerror: false
            };

            $scope.userRolesMap = userRolesMap;

            $scope.treeOptions = {
                nodeChildren: "children",
                dirSelectable: true,
                isSelectable: function
                    (node) {
                    return (node.status == 1) && (node.systemid != 100);
                }
            };
            var rawdata, unitParents, groupParents, accountParents, userParents;

            $scope.confirmOK = function () {
                $scope.context.inprogress = true;
                api.changeParent($scope.context.fromNode.systemid,
                    $scope.context.toNode.systemid,
                    angular.extend(errorHandler($scope),
                        {
                            ok: function (response) {
                                $scope.context.inprogress = false;
                                $("#confirm").modal('hide').on('hidden.bs.modal',
                                    function () {
                                        $("#confirm").off();
                                        update();
                                    }
                                )
                            }
                        }
                    ));
            }

            $scope.createUnitDialog = function () {
                modal.showCreateUnitDialog($scope);
            };

            $scope.createGroupDialog = function () {
                modal.showCreateGroupDialog($scope);
            };

            $scope.createUserDialog = function () {
                modal.showCreateUserDialog($scope);
            };

            $scope.createAccountDialog = function () {
                modal.showCreateAccountDialog($scope, false, true);
            };

            $scope.createUnit = function () {
                $scope.context.inprogress = true;
                api.createUnit($scope.unit,
                    modal.makeUnitCreateCallback($scope, function () {
                            update();
                        }
                    )
                );
            }

            $scope.createGroup = function () {
                $scope.context.inprogress = true;
                api.createGroup($scope.group,
                    modal.makeGroupCreateCallback($scope, function () {
                            update();
                        }
                    )
                )
            }

            $scope.createAccount = function () {
                $scope.context.inprogress = true;
                api.createAccount($scope.account,
                    modal.makeAccountCreateCallback($scope, function () {
                        }
                    )
                )
            };

            $scope.createUser = function () {
                $scope.context.inprogress = true;
                $scope.user.cleanup();
                api.createUser($scope.user,
                    modal.makeUserCreateCallback($scope, function () {
                        }
                    )
                )
            };

            function filter(child) {
                child.children = child.children.filter(
                    function (item) {
                        return (item.systemidtype == 2) ||
                            (item.systemidtype == 3)
                    }
                );
                if (child.children.length > 0) child.children.forEach(function (c) {
                    filter(c)
                });
            }

            function expand(child) {
                if (child.children.length > 0) {
                    $scope.expandedNodes.push(child);
                    child.children.forEach(function (c) {
                        expand(c)
                    });
                }
            }

            $scope.Refresh = function () {
                update()
            }

            function update() {
                $scope.context.dataloaded = false;
                $http.get(apiurl + '/hierarchy2')
                    .then(function (result) {
                        rawdata = result.data.payload[0];
                        filter(rawdata[0]);
                        $rootScope.rootNodeName = rawdata[0].name;
                        $scope.treeData = angular.copy(rawdata);
                        $scope.expandedNodes = [];
                        expand($scope.treeData[0]);

                        unitParents = $rootScope.units.data;

                        groupParents = $rootScope.getGroupParents();

                        accountParents = $rootScope.getAccountParents();

                        userParents = $rootScope.units.data
                            .concat($rootScope.groups.data.filter(
                                function (item) {
                                    return item.type == 1;
                                }
                                )
                            );
                        $scope.context.parents = userParents;
                        $scope.context.dataloaded = true;
                    });

            }

            $rootScope.init().then(function () {
                update();
            })

        }

    ])


dashboardControllers.controller('CloseDayCtrl',
    ['$rootScope', '$scope', '$http',
        function ($rootScope, $scope, $http) {
            if (!$rootScope.access.dashboard.Closeday()) return
            $scope.context = {};
            $scope.Refresh = function () {
                $scope.context.dataloaded = false;
                $http.get(apiurl + '/closeday')
                    .then(function (result) {
                        $scope.data = result.data.payload[0];
                        $scope.context.dataloaded = true;
                    })
            }

            $scope.Refresh();
        }

    ])


dashboardControllers.controller('accountMarginsCtrl',
    ['$rootScope', '$scope', '$http',
        function ($rootScope, $scope, $http) {

            const storage = "Portal.biInfo.marginLevel";
            createStandardContext($scope);
            var interval = 0;

            var level = localStorage.getItem(storage);
            $scope.level = level ? parseInt(level) : 50;
            $scope.Refresh = function () {
                standardClear($scope);

                $http.get(apiurl + '/accountsmargin?p=' + $scope.level).then(
                    standardSuccess($scope),
                    standardError($scope)
                );

            }
            $scope.Refresh();

            $scope.getSliderOptions = function () {
                return {
                    min: 10,
                    max: 100,
                    step: 10,
                    value: $scope.level
                }
            }

            $scope.setSliderLevel = function (value) {
                $scope.level = value;
                localStorage.setItem(storage, value);
                $scope.Refresh();
            }

            $scope.Maximize = function () {
                $("#bi-account-margins").toggleClass("pre-scrollable");
            };

            $scope.Minimize = function () {
                $("#bi-account-margins").toggleClass("pre-scrollable");
            };

            interval = setInterval($scope.Refresh, 5 * 60 * 1000);

            $scope.$on("$destroy", function () {
                if (interval > 0)
                    clearInterval(interval);
            });

        }

    ])
