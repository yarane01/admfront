var tradesControllers = angular.module('tradesControllers', []);

tradesControllers.controller('TradesCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal) {

            $scope.context = {};
            var dateFilter = "";
            var filterMode = "";

            $scope.createTable = function () {
                $scope.tableOptions = {
                    "dom": "<'row'<'col-sm-6'i>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    "processing": true,
                    "serverSide": true,
                    "language": {
                        "processing": "Loading..."
                    },
                    "scrollY": calcDataTableHeight(),
                    "scrollX": true,
                    "order": [[0, 'asc']],
                    "paging": true,
                    "stateSave": true,
                    "name": "trades",
                    stateSaveCallback: function (settings, data) {
                        $rootScope.trades.state.dateFilter = dateFilter;
                        $rootScope.trades.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.trades.state.data) {
                            dateFilter = $rootScope.trades.state.dateFilter;
                            return $rootScope.trades.state.data;
                        }
                        else
                            return null;
                    },
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.tradeid);
                    },
                    "ajax": function (data, callback, settings) {

                        var orderCol;
                        var index = data.order[0].column;
                        switch (settings.aoColumns[index].name) {
                            case "tradeid":
                                orderCol = 'tradeid';
                                break;
                            case "accountn":
                                orderCol = 'accountn';
                                break;
                            case "owner":
                                orderCol = 'owner';
                                break;
                            case "trader":
                                orderCol = 'trader';
                                break;
                            case "symbol":
                                orderCol = 'symbol';
                                break;
                            case "openrate":
                                orderCol = 'openrate';
                                break;
                            case "closerate":
                                orderCol = 'closerate';
                                break;
                            case "openamount":
                                orderCol = 'openamount';
                                break;
                            case "closeamount":
                                orderCol = 'closeamount';
                                break;
                            case "opendate":
                                orderCol = 'opendate';
                                break;
                            case "closedate":
                                orderCol = 'closedate';
                                break;
                            case "profitloss":
                                orderCol = 'profitloss';
                                break;
                            case "openorderid":
                                orderCol = "openorderid";
                                break;
                            case "openclientorderid":
                                orderCol = "openclientorderid";
                                break;
                            case "openbankorderid":
                                orderCol = "openbankorderid";
                                break;
                            case "closeorderid":
                                orderCol = "closeorderid";
                                break;
                            case "closeclientorderid":
                                orderCol = "closeclientorderid";
                                break;
                            case "closebankorderid":
                                orderCol = "closebankorderid";
                                break;
                            case "closebank":
                                orderCol = "closebank";
                                break;
                            case "openbank":
                                orderCol = "openbank";
                                break;
                            case "openbanktradeid":
                                orderCol = "openbanktradeid";
                                break;
                            case "closebanktradeid":
                                orderCol = "closebanktradeid";
                                break;
                        }

                        var reqFilters = [];
                        for (var i = 0; i < data.columns.length; i++) {
                            var search = data.columns[i].search.value;
                            if (search != '') {
                                switch (settings.aoColumns[i].name) {
                                    case "tradeid":
                                        reqFilters.push("tradeid='" + search + "'");
                                        break;
                                    case "accountn":
                                        reqFilters.push("upper(accountn) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "owner":
                                        reqFilters.push("upper(owner) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "trader":
                                        reqFilters.push("upper(trader) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "symbol":
                                        reqFilters.push("upper(symbol) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "openrate":
                                        if (isCorrectFilter(search))
                                            reqFilters.push("openrate " + search);
                                        break;
                                    case "closerate":
                                        if (isCorrectFilter(search))
                                            reqFilters.push("closerate " + search);
                                        break;
                                    case "openamount":
                                        if (isCorrectFilter(search))
                                            reqFilters.push("openamount " + search);
                                        break;
                                    case "closeamount":
                                        if (isCorrectFilter(search))
                                            reqFilters.push("closeamount " + search);
                                        break;
                                    /*
                                     case "opendate":
                                     orderCol = 'opendate';
                                     break;
                                     case "closedate":
                                     orderCol = 'closedate';
                                     break;
                                     */
                                    case "profitloss":
                                        if (isCorrectFilter(search))
                                            reqFilters.push("profitloss " + search);
                                        break;
                                    case "openorderid":
                                            reqFilters.push("openorderid='" + search + "'");
                                        break;
                                    case "openclientorderid":
                                        reqFilters.push("openclientorderid LIKE '%" + search.trim() + "%'");
                                        break;
                                    case "openbankorderid":
                                        reqFilters.push("openbankorderid LIKE '%" + search.trim() + "%'");
                                        break;
                                    case "closeorderid":
                                        reqFilters.push("closeorderid='" + search + "'");
                                        break;
                                    case "closeclientorderid":
                                        reqFilters.push("closeclientorderid LIKE '%" + search.trim() + "%'");
                                        break;
                                    case "closebankorderid":
                                        reqFilters.push("closebankorderid LIKE '%" + search.trim() + "%'");
                                        break;
                                    case "openbank":
                                        reqFilters.push("openbank LIKE '%" + search + "%'");
                                        break;
                                    case "closebank":
                                        reqFilters.push("closebank LIKE '%" + search + "%'");
                                        break;
                                    case "openbanktradeid":
                                        reqFilters.push("openbanktradeid LIKE '%" + search + "%'");
                                        break;
                                    case "closebanktradeid":
                                        reqFilters.push("closebanktradeid LIKE '%" + search + "%'");
                                        break;
                                }
                            }
                        }
                        if (dateFilter != "") reqFilters.push(dateFilter);

                        /*
                         var reqParams = {
                         n1: data.start + 1,
                         n2: data.start + data.length,
                         sortcolumn: orderCol + ' ' + data.order[0].dir
                         };
                         var countFilter = {filter: ''};
                         if (reqFilters.length > 0) {
                         reqParams.filter = reqFilters.join(' AND ');
                         countFilter.filter = reqParams.filter;
                         }
                         */
                        var start = data.start + 1;
                        var end = data.start + data.length;
                        var request = 'n1=' + start + '&n2=' + end + '&sortcolumn=' +
                            orderCol + ' ' + data.order[0].dir;

                        var filter = '';
                        if (reqFilters.length > 0) {
                            filter = reqFilters.join(' AND ');
                        }
                        var requestQuery = filter == '' ? request : request + '&filter=' + filter;
                        requestQuery = '?' + encodeURI(requestQuery);
                        var countQuery = filter == '' ? '' : '?filter=' + encodeURI(filter);

                        $scope.error = false;
                        $q.all([
                            $http.get(apiurl + '/trades2' + requestQuery),
                            $http.get(apiurl + '/trades2count' + countQuery)
                            //$http.get(apiurl + '/trades2', {params: reqParams}),
                            //$http.get(apiurl + '/trades2count', {params: countFilter})
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    $scope.error = false;
                                    $rootScope.trades.data = response[0].data.payload[0];
                                    var filtered = response[1].data.payload[0].count;

                                    callback({
                                            "recordsTotal": $rootScope.trades.total,
                                            "recordsFiltered": filtered,
                                            data: $rootScope.trades.data
                                        }
                                    );
                                    setTableActionsPosHandler('table');
                                    if ($rootScope.trades.state.selected.length > 0)
                                        selectRow('#table', $rootScope.trades.state.selected[0]);
                                }
                                else {
                                    $scope.errorMessage = response[0].data.payload[0];
                                    $scope.error = true;
                                }
                            }, function (response) {
                                $scope.errorMessage = response.data;
                                $scope.error = true;
                            })
                    },
                    "columns": [
                        {
                            "data": "tradeid",
                            save: false,
                            name: "tradeid"
                        },
                        {
                            "data": "accountn",
                            save: true,
                            name: "accountn"
                        },
                        {
                            "data": "owner",
                            save: true,
                            name: "owner"
                        },
                        {
                            "data": "trader",
                            save: true,
                            name: "trader"
                        },
                        {
                            "data": "symbol",
                            save: true,
                            name: "symbol"
                        },
                        {
                            "data": "profitloss",
                            save: true,
                            name: "profitloss"
                        },
                        {
                            "data": "openrate",
                            save: true,
                            name: "openrate"
                        },
                        {
                            "data": "closerate",
                            save: true,
                            name: "closerate"
                        },
                        {
                            "data": "openamount",
                            save: true,
                            name: "openamount"
                        },
                        {
                            "data": "closeamount",
                            save: true,
                            name: "closeamount"
                        },
                        {
                            "data": "opendate",
                            save: true,
                            "class": "opendate",
                            name: "opendate"
                        },
                        {
                            "data": "closedate",
                            save: true,
                            "class": "closedate",
                            name: "closedate"
                        },
                        {
                            "data": "openorderid",
                            save: true,
                            name: "openorderid"
                        },
                        {
                            "data": "openclientorderid",
                            save: true,
                            name: "openclientorderid"
                        },
                        {
                            "data": "openbankorderid",
                            save: true,
                            name: "openbankorderid"
                        },
                        {
                            "data": "closeorderid",
                            save: true,
                            name: "closeorderid"
                        },
                        {
                            "data": "closeclientorderid",
                            save: true,
                            name: "closeclientorderid"
                        },
                        {
                            "data": "closebankorderid",
                            save: true,
                            name: "closebankorderid"
                        },
                        {
                            "data": "openbank",
                            save: true,
                            name: "openbank"
                        },
                        {
                            "data": "closebank",
                            save: true,
                            name: "closebank"
                        },
                        {
                            "data": "openbanktradeid",
                            save: true,
                            name: "openbanktradeid"
                        },
                        {
                            "data": "closebanktradeid",
                            save: true,
                            name: "closebanktradeid"
                        },
                        {
                            "data": null,
                            "sortable": false,
                            //"class": "actions",
                            save: false,
                            name: "",
                            "render": function (data, type, full, meta) {
                                var access = $rootScope.access.trades;
                                return $.fn.actionList(
                                    {
                                        id: data.tradeid,
                                        items: [

                                            {
                                                title: "Edit",
                                                action: "Edit",
                                                access: access.Edit,
                                                class: 'edit-link text-bold'
                                            },

                                            {
                                                title: "Details",
                                                action: "Details",
                                                access: access.Details
                                            }
                                        ]
                                    }).html();
                            }

                        }
                    ]

                }
            }
            window.actionClick = function (link) {
                var action = $(link).data('action');
                var id = $(link).data('id');
                switch (action.toUpperCase()) {
                    case 'EDIT':
                        $scope.editDialog(id);
                        break;
                    case 'DETAILS':
                        var url = reportsurl + '/tradeaudit?tradeid=' + id;
                        openInNewTab(url);
                        break;
                }
            };

            $scope.afterTableCreated = function () {
                var table = $('#table').DataTable();
                assignFilters('#table');
                var colSel = new $.fn.colSel(table, {
                    visObject: tableProperties.Columns,
                    saveFunc: $rootScope.saveTableProperties
                });
                $(colSel).prependTo('#rigth-group');
                restoreState(table, $rootScope.trades.state, false);
            }

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.trades.state);
                dateFilter = "";
                table.ajax.reload();
            }

            $scope.editDialog = function (id) {
                beforeDialog($scope);
                $scope.trade = angular.extend({}, $rootScope.trades.getById(id));
                $scope.tradeNotClosed = $scope.trade.closerate == null;
                $scope.$apply(function () {
                        $('#editTrade').modal().on('shown.bs.modal',
                            function () {
                                $('#openRate').focus();
                            }
                        );
                    }
                );
            }

            $scope.createDialog = function () {
                $scope.context.createOrder = true;
                $timeout(function () {
                    beforeDialog($scope);
                    $('#createTrade').modal().on('shown.bs.modal',
                        function () {
                            $('#lots').focus();
                        }
                    )
                }, 0);
            }

            $scope.updateTrade = function () {
                $scope.context.inprogress = true;
                var trade = {
                    "tradeid": $scope.trade.tradeid,
                    "openrate": $scope.trade.openrate,
                    "openamount": $scope.trade.openamount,
                }
                if ($scope.trade.closerate)
                    trade.closerate = $scope.trade.closerate;
                if ($scope.trade.closeamount)
                    trade.closeamount = $scope.trade.closeamount;
                if ($scope.trade.opendate)
                    trade.opendate = $scope.trade.opendate;
                if ($scope.trade.closedate)
                    trade.closedate = $scope.trade.closedate;
                api.updateTrade(trade, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            $scope.context.inprogress = false;
                            $("#editTrade").modal('hide').on('hidden.bs.modal', function () {
                                $("#editTrade").off();
                                saveState('#table', $rootScope.trades.state);
                                $('#table').DataTable().ajax.reload();
                            })
                        }
                    }
                ));
            }


            $scope.Refresh = function () {
                $('#table').DataTable().ajax.reload();
            }

            $scope.setDateFilter = function () {
                if (filterMode == "open") {
                    dateFilter = $scope.dateFilter.stringFor('opendate');
                    switch ($scope.dates.show) {
                        case "All":
                            break;
                        case "Open":
                            dateFilter += ' and closedate is null'
                            break;
                        case "Closed":
                            dateFilter += ' and closedate is not null'
                            break;
                    }
                }
                else {
                    dateFilter = $scope.dateFilter.stringFor('closedate');
                }
                $('#setDateFilters').modal('hide');
                var table = $('#table').DataTable();
                table.ajax.reload();
            }

            $scope.createOpenDateFilter = function () {
                filterMode = "open";
                $scope.dates = {
                    show: "All"
                }
                $scope.dateFilter = createDateFilterObject();
                $('#setDateFilters').modal();
            }
            $scope.createCloseDateFilter = function () {
                filterMode = "close";
                $scope.dates = {}
                $scope.dateFilter = createDateFilterObject();
                $('#setDateFilters').modal();
            }

            $rootScope.activePage = "trades";
            $rootScope.updateTradeCount().then(function () {
                $scope.createTable();
                $scope.$broadcast('dataloaded');
            })

            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.trades.state);
            });

        }
    ])

tradesControllers.controller('TradeCreateCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal) {
            $scope.context.inprogress = false;
            $scope.context.error = false;
            $scope.context.filter = "";
            $scope.context.title = 'Create market order';

            var proxy = new tradeProxy($scope, $rootScope, api);

            var pager;

            $scope.accountFirst = function () {
                $scope.accounts = pager.first();
            }

            $scope.accountLast = function () {
                $scope.accounts = pager.last();
            }

            $scope.accountNext = function () {
                $scope.accounts = pager.next();
            }

            $scope.accountPrev = function () {
                $scope.accounts = pager.prev();
            }

            $scope.$watch("context.filter", function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        pager.filter(newValue);
                        $scope.accounts = pager.first();
                    }
                }
            )

            $scope.accountSelected = function (account) {
                $scope.order.account = account;
            }

            $scope.createTrade = function () {
                proxy.createTrade(
                    function () {
                        $("#createTrade").modal('hide').on('hidden.bs.modal', function () {
                            $("#createTrade").off();
                            $scope.context.createOrder = false;
                            saveState('#table', $rootScope.trades.state);
                            $('#table').DataTable().ajax.reload();
                        })
                    })
            }

            $scope.accountsList = $rootScope.accountslist.data;
            pager = new Pager({
                items: $scope.accountsList,
                filterFields: ['accountn', 'systemid']
            });
            pager.filter('');
            $scope.accounts = pager.first();
        }
    ])

