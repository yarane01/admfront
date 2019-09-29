angular.module('portal')
    .controller('FeedCtrl',
        ['$scope', '$rootScope', '$route', '$timeout',
            function ($scope, $rootScope, $route, $timeout) {

                $rootScope.activePage = "feed";

                $scope.columns = tableProperties.Columns.livefeed;

                $scope.context = {
                    showSettings: false,
                    storageName: 'portal.feedpanels'
                };

                $scope.init = function () {
                    $scope.panels = [];

                    var symbols = getStoredSymbols($scope.context.storageName);
                    symbols.list.forEach(function (i) {
                            $scope.panels.push({symbol: i});
                        }
                    );
                    $scope.interval = symbols.interval * 1000;
                };

                $scope.columnsChanged = function () {
                }

                $scope.init();
                $scope.panelsDialog = function () {
                    $scope.context.showSettings = true;
                    $timeout(function () {
                        $('#ratesSettings').modal().on('hidden.bs.modal',
                            function () {
                                $scope.context.showSettings = false;
                                $scope.$apply();
                            }
                        )
                    }, 0);
                };

                $scope.subscriptionDialog = function () {
                    $scope.context.showSubscription = true;
                    $timeout(function () {
                        $('#subscriptionSettings').modal().on('hidden.bs.modal',
                            function () {
                                $scope.context.showSubscription = false;
                                $scope.$apply();
                            }
                        )
                    }, 0);
                };

                $scope.$on('$destroy', function () {

                    $rootScope.saveTableProperties();
                });
            }
        ]);

angular.module('portal')
    .controller('FeedPanelCtrl',
        ['quotes', '$scope', '$rootScope', '$http', '$timeout',
            function (quotes, $scope, $rootScope, $http, $timeout) {

                var panel = this;

                $scope.columns = tableProperties.Columns.livefeed;

                $scope.context = {
                    dataloaded: false
                };

                panel.setSymbol = function (symbol) {
                    $scope.symbolname = symbol;
                    $scope.context.dataloaded = true;
                    $scope.symbol = $rootScope.symbols[symbol];

                }

                function isQuoteOldClass(quote) {
                    var updatetime = quotes.getLastUpdateTime();
                    var levels = $rootScope.feedDecor;
                    if (updatetime.diff(quote.moment, levels.units) > levels.level2)
                        return 'rate-none-level2';
                    if (updatetime.diff(quote.moment, levels.units) > levels.level1)
                        return 'rate-none-level1';
                    return '';
                }

                $scope.getBidClass = function (quote) {
                    var old = isQuoteOldClass(quote);
                    if (old != '') return old;
                    if (quote.bidchange == 'Up') return 'rate-up';
                    if (quote.bidchange == 'Down') return 'rate-down';
                }

                $scope.getAskClass = function (quote) {
                    var old = isQuoteOldClass(quote);
                    if (old != '') return old;
                    if (quote.askchange == 'Up') return 'rate-up';
                    if (quote.askchange == 'Down') return 'rate-down';
                }
            }
        ])

angular.module('portal')
    .controller('FeedAliasesCtrl',
        ['$scope', '$rootScope', '$http', 'feedproviders',
            function ($scope, $rootScope, $http, feedproviders) {

                $scope.context = {};

                $scope.clearFilter = function () {
                    $scope.context.filter = "";
                };

                $scope.init = function () {
                    $scope.context.dataloaded = false;
                    $scope.context.error = false;
                    $scope.context.instruments = [];
                    $scope.context.filter = '';
                    $scope.context.inprogress = false;
                    $http.get(stpapiurl + '/configureProviderInstruments')
                        .success(function (data, status, headers, config) {
                                if (data.status == 'OK') {
                                    /*
                                     data.payload.forEach(function (item) {
                                     item.selected = false;
                                     var i = $rootScope.instruments.getById(item.instrumentId);
                                     if (i) {
                                     item.instrumenttype = i.instrumenttype;
                                     }
                                     updateCount();
                                     })
                                     */
                                    $scope.context.instruments = $rootScope.instruments.data;
                                    $scope.context.providers = [];
                                    feedproviders.refresh()
                                        .then(function () {
                                            $scope.context.providers = feedproviders.getProviders();
                                            /*
                                             $scope.context.instruments = data.payload;
                                             $scope.context.instruments.forEach(function (instrument) {
                                             for (var k in instrument.subscribeAllowed) {
                                             var provider = $scope.getProvider(k);
                                             if (!provider) delete instrument.subscribeAllowed[k];
                                             }
                                             })
                                             */
                                            $scope.context.dataloaded = true;
                                        })
                                }
                                else {
                                    $scope.context.errorMessage = data.payload[0];
                                    $scope.context.dataerror = true;
                                    $scope.context.dataloaded = true;

                                }
                            }
                        ).error(function (data, status, headers, config) {
                        $scope.context.errorMessage = data;
                        $scope.context.dataerror = true;
                        $scope.context.dataloaded = true;
                    });
                };

                $scope.init();


                $scope.Refresh = function () {
                    $scope.init();
                };

                $scope.EditDialog = function (symbol, provider) {
                    $scope.init();
                };

                $scope.DeleteDialog = function (symbol, provider) {
                    $scope.init();
                }

            }
        ]);
