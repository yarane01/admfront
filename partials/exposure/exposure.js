angular.module('portal')
    .controller('ExposureCtrl',
    ['$scope', '$rootScope', '$http', '$timeout',
        function ($scope, $rootScope, $http, $timeout) {
            $rootScope.activePage = "exposure";
        }
    ]);

angular.module('portal')
    .controller('BBookCtrl',
    ['$scope', '$rootScope', '$http', '$timeout',
        function ($scope, $rootScope, $http, $timeout) {

            $scope.context = {dataloaded: false}

            $scope.Refresh = function () {
                $scope.context.dataerror = false;
                $scope.context.dataloaded = false;
                $scope.context.accountsloaded = false;
                $scope.context.tradesloaded = false;
                $scope.context.tradesdataerror = false;
                $scope.context.symbolselected = false;
                $scope.context.accountselected = false;
                $scope.context.inprogress = false;
                init();
            }

            init = function () {
                $scope.symbols = [];
                var auth = $rootScope.getAuthHeader();
                $http.get(stpapiurl + '/bbookExposure', {headers: auth}).
                    success(function (data) {
                        if (data.status == 'OK') {
                            data.payload.forEach(function (item) {
                                $scope.symbols.push({
                                    symbol: item.symbol,
                                    amount: formatAmount(item.amount)
                                });

                            })
                            $scope.symbols.sort(function (s1, s2) {
                                    return s1.symbol.localeCompare(s2.symbol)
                                }
                            )
                            if ($scope.symbols.length > 0)
                                $scope.SymbolDetails($scope.symbols[0].symbol);
                            $scope.context.dataloaded = true;
                        }
                        else {
                            $scope.context.dataerror = true;
                            $scope.context.dataloaded = true;
                        }
                    }
                ).
                    error(function (data, status, headers, config) {
                        $scope.context.errorMessage = data;
                        $scope.context.dataerror = true;
                        $scope.context.dataloaded = true;
                    });
            };

            init();

            function formatAmount(n) {
                //return n.toFixed().toLocaleString();
                return Number(n.toFixed()).toLocaleString()
            }

            $scope.orderAmount = function (item) {
                return Math.abs(parseInt(item.amount))
            };


            $scope.SymbolDetails = function (symbol) {
                $scope.context.symbolselected = true;
                $scope.context.symbol = symbol;
                $scope.accounts = [];
                $scope.context.inprogress = true;
                $scope.context.accountsloaded = false;
                var auth = $rootScope.getAuthHeader();
                $http.post(stpapiurl + '/bbookExposure',
                    {symbol: symbol}, {headers: auth})
                    .success(function (data) {
                        if (data.status == 'OK') {
                            data.payload.forEach(function (item) {
                                $scope.accounts.push({
                                    name: item.accountN,
                                    amount: formatAmount(item.amount)
                                });

                            })
                            $scope.AccountDetails(symbol, $scope.accounts[0].name);
                            $scope.context.accountsloaded = true;
                            $scope.context.inprogress = false;
                        }
                        else {
                            $scope.context.accountsdataerror = true;
                            $scope.context.accountsloaded = true;
                            $scope.context.inprogress = false;
                        }
                    }
                ).
                    error(function (data, status, headers, config) {
                        $scope.context.accountserrorMessage = data;
                        $scope.context.accountsdataerror = true;
                        $scope.context.accountsloaded = true;
                        $scope.context.inprogress = false;
                    });

            };

            $scope.AccountDetails = function (symbol, account) {
                $scope.context.accountselected = true;
                $scope.context.account = account;
                $scope.trades = [];
                $scope.context.inprogress = true;
                $scope.context.tradesloaded = false;
                var auth = $rootScope.getAuthHeader();
                $http.post(stpapiurl + '/bbookExposure',
                    {symbol: symbol, accountN: account}, {headers: auth})
                    .success(function (data) {
                        if (data.status == 'OK') {
                            data.payload.forEach(function (item) {
                                $scope.trades.push({
                                    id: item.accountN,
                                    amount: formatAmount(item.amount)
                                });

                            })
                            $scope.context.tradesloaded = true;
                            $scope.context.inprogress = false;
                        }
                        else {
                            $scope.context.tradesdataerror = true;
                            $scope.context.tradesloaded = true;
                            $scope.context.inprogress = false;
                        }
                    }
                ).
                    error(function (data, status, headers, config) {
                        $scope.context.accountserrorMessage = data;
                        $scope.context.tradesdataerror = true;
                        $scope.context.tradesloaded = true;
                        $scope.context.inprogress = false;
                    });

            };


        }
    ]);

angular.module('portal')
    .controller('DashBBookCtrl',
    ['$scope', '$rootScope', '$http', '$timeout',
        function ($scope, $rootScope, $http, $timeout) {

            $scope.context = {dataloaded: false}
            var interval = 0;
            var busy = false;

            $scope.Refresh = function () {
                $scope.context.dataerror = false;
                $scope.context.dataloaded = false;
                init();
            }

            init = function () {
                if (busy)return;
                busy = true;
                var auth = $rootScope.getAuthHeader();
                $http.get(stpapiurl + '/bbookExposure', {headers: auth}).
                    success(function (data) {
                        var symbols = [];
                        if (data.status == 'OK') {
                            data.payload.forEach(function (item) {
                                symbols.push({
                                    symbol: item.symbol,
                                    amount: formatAmount(item.amount)
                                });

                            })
                            symbols.sort(function (s1, s2) {
                                    return s1.symbol.localeCompare(s2.symbol)
                                }
                            )
                            $scope.context.dataloaded = true;
                            $scope.symbols = symbols;
                            busy = false;
                        }
                        else {
                            scope.context.errorMessage = data.payload[0];
                            $scope.context.dataerror = true;
                            $scope.context.dataloaded = true;
                        }
                    }
                ).error(function (data, status, headers, config) {
                        busy = false;
                        $scope.context.errorMessage = data;
                        $scope.context.dataerror = true;
                        $scope.context.dataloaded = true;
                    });
            };

            $scope.$on("$destroy", function () {
                if (interval > 0)
                    clearInterval(interval);
            });

            init();
            if ($rootScope.config.autoupdate)
                interval = setInterval(init, UPDATE_INTERVAL);

            function formatAmount(n) {
                return Number(n.toFixed()).toLocaleString()
            }
        }
    ]);

angular.module('portal')
    .controller('ABookCtrl',
    ['$scope', '$rootScope', '$http', '$timeout',
        function ($scope, $rootScope, $http, $timeout) {

            /*
             $scope.context = {dataloaded: false}

             $scope.Refresh = function () {
             $scope.context.dataerror = false;
             $scope.context.dataloaded = false;
             $scope.context.accountsloaded = false;
             $scope.context.tradesloaded = false;
             $scope.context.tradesdataerror = false;
             $scope.context.symbolselected = false;
             $scope.context.accountselected = false;
             $scope.context.inprogress = false;
             init();
             }

             init = function () {
             $scope.symbols = [];
             var auth = $rootScope.getAuthHeader();
             $http.get(stpapiurl + '/bbookExposure', {headers: auth}).
             success(function (data) {
             if (data.status == 'OK') {
             data.payload.forEach(function (item) {
             $scope.symbols.push({
             symbol: item.symbol,
             amount: formatAmount(item.amount)
             });

             })
             $scope.symbols.sort(function (s1, s2) {
             return s1.symbol.localeCompare(s2.symbol)
             }
             )
             if ($scope.symbols.length > 0)
             $scope.SymbolDetails($scope.symbols[0].symbol);
             $scope.context.dataloaded = true;
             }
             else {
             $scope.context.dataerror = true;
             $scope.context.dataloaded = true;
             }
             }
             ).
             error(function (data, status, headers, config) {
             $scope.context.errorMessage = data;
             $scope.context.dataerror = true;
             $scope.context.dataloaded = true;
             });
             };

             init();

             function formatAmount(n) {
             //return n.toFixed().toLocaleString();
             return Number(n.toFixed()).toLocaleString()
             }

             $scope.orderAmount = function (item) {
             return Math.abs(parseInt(item.amount))
             };


             $scope.SymbolDetails = function (symbol) {
             $scope.context.symbolselected = true;
             $scope.context.symbol = symbol;
             $scope.accounts = [];
             $scope.context.inprogress = true;
             $scope.context.accountsloaded = false;
             var auth = $rootScope.getAuthHeader();
             $http.post(stpapiurl + '/bbookExposure',
             {symbol: symbol}, {headers: auth})
             .success(function (data) {
             if (data.status == 'OK') {
             data.payload.forEach(function (item) {
             $scope.accounts.push({
             name: item.accountN,
             amount: formatAmount(item.amount)
             });

             })
             $scope.AccountDetails(symbol, $scope.accounts[0].name);
             $scope.context.accountsloaded = true;
             $scope.context.inprogress = false;
             }
             else {
             $scope.context.accountsdataerror = true;
             $scope.context.accountsloaded = true;
             $scope.context.inprogress = false;
             }
             }
             ).
             error(function (data, status, headers, config) {
             $scope.context.accountserrorMessage = data;
             $scope.context.accountsdataerror = true;
             $scope.context.accountsloaded = true;
             $scope.context.inprogress = false;
             });

             };

             $scope.AccountDetails = function (symbol, account) {
             $scope.context.accountselected = true;
             $scope.context.account = account;
             $scope.trades = [];
             $scope.context.inprogress = true;
             $scope.context.tradesloaded = false;
             var auth = $rootScope.getAuthHeader();
             $http.post(stpapiurl + '/bbookExposure',
             {symbol: symbol, accountN: account}, {headers: auth})
             .success(function (data) {
             if (data.status == 'OK') {
             data.payload.forEach(function (item) {
             $scope.trades.push({
             id: item.accountN,
             amount: formatAmount(item.amount)
             });

             })
             $scope.context.tradesloaded = true;
             $scope.context.inprogress = false;
             }
             else {
             $scope.context.tradesdataerror = true;
             $scope.context.tradesloaded = true;
             $scope.context.inprogress = false;
             }
             }
             ).
             error(function (data, status, headers, config) {
             $scope.context.accountserrorMessage = data;
             $scope.context.tradesdataerror = true;
             $scope.context.tradesloaded = true;
             $scope.context.inprogress = false;
             });

             };
             */


        }
    ]);
