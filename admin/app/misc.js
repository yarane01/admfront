var miscControllers = angular.module('miscControllers', []);

miscControllers.controller('AppLogonCtrl',
    ['systemInfo', '$scope', '$rootScope', '$http', '$q', '$location',
        function (systemInfo, $scope, $rootScope, $http, $q, $location) {

            var waiting = function () {
                count--;
                $scope.buttonText = "Waiting ... " + count;
                if (count == 0) {
                    clearInterval(interval);
                    $scope.buttonText = "Sign in";
                    $scope.loginDisabled = false;
                    localStorage.removeItem("portal.restart");
                }
                $scope.$apply();
            }

            $scope.error = false;
            $scope.buttonText = "Sign in";
            var interval = 0;
            var count;
            var restartInfo = localStorage.getItem("portal.restart");
            if (restartInfo) {
                restartInfo = JSON.parse(restartInfo);
                count = restartInfo.wait;
                $scope.loginDisabled = true;
                $scope.buttonText = "Waiting ... " + count;
                interval = setInterval(waiting, 1000)
            }

            function getCallerRoles() {
                return $q(function (resolve, reject) {
                    $http.get(apiurl + '/callerroles').success(function (data, status, headers, config) {
                        if (data.status == 'OK') {
                            resolve(data.payload[0]);
                        } else {
                            reject(data.payload[0]);
                        }
                    }).error(function (data, status, headers, config) {
                        reject(data);
                    });
                });
            }

            $scope.submit = function () {
                $scope.error = false;
                $scope.loginDisabled = true;
                $rootScope.portalUser.url = tradeserverurl;
                $rootScope.portalUser.isaccessadmin = false;
                $rootScope.portalUser.ismanager = false;
                $rootScope.portalUser.issystemmanager = false;
                $rootScope.portalUser.isaccountmanager = false;
                $rootScope.portalUser.issettingmanager = false;
                $rootScope.portalUser.isratemanager = false;
                $rootScope.portalUser.isdealer = false;

                // $http.get(apiurl + '/logon?username=' +
                //     $rootScope.portalUser.username + '&password=' +
                //     $rootScope.portalUser.password)
                $http.post(apiurl + '/logon', 'username=' +
                    $rootScope.portalUser.username + '&password=' +
                    $rootScope.portalUser.password, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })

                    .success(function (data, status, headers, config) {
                        if (data.status == 'OK') {
                            getCallerRoles().then(function (roles) {
                                for (var i = 0; i < roles.length; i++) {
                                    if ("accessadmin" == roles[i]) $rootScope.portalUser.isaccessadmin = true;
                                    if ("manager" == roles[i]) $rootScope.portalUser.ismanager = true;
                                    if ("dealer" == roles[i]) $rootScope.portalUser.isdealer = true;
                                    if ("system_manager" == roles[i]) $rootScope.portalUser.issystemmanager = true;
                                    if ("account_manager" == roles[i]) $rootScope.portalUser.isaccountmanager = true;
                                    if ("setting_manager" == roles[i]) $rootScope.portalUser.issettingmanager = true;
                                    if ("rate_manager" == roles[i]) $rootScope.portalUser.isratemanager = true;
                                }
                                if (isAdmin($rootScope.portalUser)) {
                                    if ($rootScope.portalUser.remember) {
                                        var stored = angular.copy($rootScope.portalUser);
                                        stored.password = sjcl.encrypt(appName, stored.password);
                                        localStorage.setItem("portal.user", JSON.stringify(stored));
                                    }
                                    $rootScope.portalUser.loggedIn = true;
                                    systemInfo.start();
                                    //console.log(JSON.stringify($rootScope.portalUser, null, 4));
                                    $rootScope.init();
                                    //if ($rootScope.externalReports)
                                    $rootScope.logonToReports();
                                    $location.path("/");
                                }
                                else {
                                    $scope.errorMessage = 'You have no rights to use the app';
                                    $scope.error = true;
                                    $scope.loginDisabled = false;
                                }
                            });
                        } else {
                            $scope.errorMessage = 'Login failed';
                            $scope.error = true;
                            $scope.loginDisabled = false;
                        }
                    })
                    .error(function (data, status, headers, config) {
                        $scope.errorMessage = 'HTTP status ' + status;
                        $scope.error = true;
                        $scope.loginDisabled = false;
                    })

            }

            $scope.GoResetPassword = function () {
                window.open(encodeURI(forgotpasswordurl), '_blank');
            }
        }
    ]);

miscControllers.controller('AppLogoutCtrl',
    ['systemInfo', 'quotes', '$scope', '$rootScope', '$http', '$q', '$location',
        function (systemInfo, quotes, $scope, $rootScope, $http, $q, $location) {
            $http.get(apiurl + '/logout').success(function (data, status, headers, config) {
                $rootScope.loaded = undefined;
                $rootScope.portalUser.loggedIn = false;
                systemInfo.stop();
                quotes.stop();
                if (pingInterval != 0) {
                    clearInterval(pingInterval);
                    pingInterval = 0;
                }
                $location.path("/logon");
            }).error(function (data, status, headers, config) {

            });
        }
    ]);

angular.module('portal')
    .controller('StoredSymbolsCtrl',
        ['$scope', '$rootScope', function ($scope, $rootScope) {
            $scope.context.filter = '';

            $scope.selectAll = function () {
                $scope.context.filtered.forEach(
                    function (i) {
                        i.selected = true;
                    }
                )
                updateCount();
                $('#select-all').blur();
            }

            $scope.deselectAll = function () {
                $scope.context.filtered.forEach(
                    function (i) {
                        i.selected = false;
                    }
                )
                updateCount();
                $('#deselect-all').blur();
            }
            $scope.invertSelection = function () {
                $scope.context.filtered.forEach(
                    function (i) {
                        i.selected = !i.selected;
                    }
                )
                updateCount();
                $('#invert').blur();
            }

            $scope.selectByType = function (type) {
                $scope.context.instruments.forEach(
                    function (i) {
                        if (i.instrumenttype == type)
                            i.selected = !i.selected;
                    }
                )
                updateCount();
                $('#button-' + type).blur();
            }

            $scope.itemSelected = function (index) {
                updateCount();
            }

            function updateCount() {
                var count = 0;
                $scope.context.instruments.forEach(
                    function (i) {
                        if (i.selected) count++;
                    }
                )
                $scope.context.selected = count;
            }

            $scope.clearFilter = function () {
                $scope.context.filter = "";
            };

            $scope.saveSettings = function () {
                var list = {
                    list: [],
                    interval: $scope.context.interval
                }

                $scope.context.instruments.forEach(
                    function (i) {
                        if (i.selected) list.list.push(i.symbol);
                    }
                )

                localStorage[$scope.context.storageName] = JSON.stringify(list);
                localStorage.setItem("portal.feedDecor", JSON.stringify($rootScope.feedDecor));
                $scope.init();
                $('#ratesSettings').modal('hide');
            }

            $scope.context.instruments = angular.copy($rootScope.instruments.data);
            $scope.context.mapType = instrumenttypemap;

            var symbols = getStoredSymbols($scope.context.storageName);
            $scope.context.interval = symbols.interval;
            $scope.context.instruments.forEach(
                function (i) {
                    i.selected = symbols.list.indexOf(i.symbol) >= 0;

                }
            )
            updateCount();

        }
        ]);

var Pager = function (options) {
    options = $.extend({
        itemsPerPage: 20,
        filterFields: []
    }, options);
    var currentPage = 0;
    var items = options.items;
    var itemsPerPage = options.itemsPerPage;
    var numOfPages = Math.ceil(items.length / itemsPerPage);

    function get() {
        var start = currentPage * itemsPerPage;
        var end = start + itemsPerPage - 1
        return items.slice(start, end);
    }

    return {
        filter: function (filterValue) {
            if (filterValue == '') {
                items = options.items;
            }
            else {
                items = options.items.filter(function (item) {
                    var result = false;
                    options.filterFields.forEach(function (field) {
                        var value = item[field];
                        if (typeof (value) != "string")
                            value = value.toString();
                        result = result || value.toUpperCase().includes(filterValue.toUpperCase());
                    })
                    return result;
                    //                        return item[options.filterField].includes(value);
                })
            }
            currentPage = 0;
            numOfPages = Math.ceil(items.length / itemsPerPage);
        },
        first: function () {
            currentPage = 0;
            return get();
        },
        next: function () {
            if (currentPage < numOfPages - 1) currentPage++;
            return get();
        },
        prev: function () {
            if (currentPage > 0) currentPage--;
            return get();
        },
        last: function () {
            currentPage = numOfPages - 1;
            return get();
        }
    }
}


function getStoredSymbols(storage) {
    var stored = {
        list: ['EURUSD'],
        interval: 15
    }
    if (localStorage[storage])
        stored = JSON.parse(localStorage[storage]);
    return stored;
}

function objectToArray(obj) {
    return Object.keys(obj).map(function (key) {
        var value = obj[key];
        //console.log(value);
        return angular.isObject(value) ?
            Object.defineProperty(value, '$key', { enumerable: false, value: key }) :
            { $key: key, $value: value };
    })
}

function isAdmin(user) {
    return user.isaccessadmin ||
        user.ismanager ||
        user.issystemmanager ||
        user.isaccountmanager ||
        user.issettingmanager ||
        user.isratemanager ||
        user.isdealer
}

function savePanels(id, storageName) {
    var dashboard = { ver: "1", panels: [] }
    var columns = $(id + " .column");
    columns.map(function () {
        dashboard.panels.push([]);
    })
    columns.each(function (index, column) {
        $(column).find(".dashboard-panel").each(function (i, panel) {
            dashboard.panels[index].push($(panel).attr("data-inner-id"))
        })
    })
    localStorage.setItem(storageName, JSON.stringify(dashboard));
}

function createStandardContext(scope) {
    scope.context = {
        dataerror: false,
        dataloaded: false
    }
}

function standardClear(scope) {
    scope.context.dataerror = false;
    scope.context.dataloaded = false;
    scope.context.data = [];
}

function standardSuccess(scope, initFunc) {
    return function (response) {
        if (response.data.status == "OK") {
            if (initFunc) initFunc(response);
            else scope.context.data = response.data.payload[0];
            scope.context.dataloaded = true;
        }
        else {
            scope.context.dataloaded = true;
            scope.context.dataerror = true;
            scope.context.errorMessage = response.data.payload[0];
        }
    }
}

function standardError(scope, errorFunc) {
    return function (response) {
        scope.context.dataloaded = true;
        scope.context.dataerror = true;
        scope.context.errorMessage = "Failed. HTTP status: " +
            response.status + '<br>' + response.statusText;
        if (errorFunc) errorFunc(response); //to override errorMessage
    }
}

function floorFigure(figure, decimals) {
    if (!decimals) decimals = 2;
    var d = Math.pow(10, decimals);
    return (parseInt(figure * d) / d).toFixed(decimals);
};

angular.module('portal')
    .controller('HealtcheckCtrl',
        ['$scope', '$rootScope', function ($scope, $rootScope) {
        }
        ]);
