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
                            case "slId":
                                orderCol = 'sl_id';
                                break;
                            case "slPrice":
                                orderCol = 'sl_price';
                                break;
                            case "tpId":
                                orderCol = "tp_id";
                                break;
                            case "tpPrice":
                                orderCol = "tp_price";
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
                                }
                            }
                        }

                        if (dateFilter != "") {
                            reqFilters.push(dateFilter);
                        }

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
                            $http.get(adminbackendurl + '/trades2' + requestQuery),
                            $http.get(adminbackendurl + '/trades2count' + countQuery)
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
                            "data": "slId",
                            save: true,
                            name: "slId"
                        },
                        {
                            "data": "slPrice",
                            save: true,
                            name: "slPrice"
                        },
                        {
                            "data": "tpId",
                            save: true,
                            name: "tpId"
                        },
                        {
                            "data": "tpPrice",
                            save: true,
                            name: "tpPrice"
                        },
                        {
                            "data": "swapCharged",
                            save: true,
                            name: "swapCharged"
                        },
                        {
                            "data": "swapTotal",
                            save: true,
                            name: "swapTotal"
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
                                            },{
                                                title: "Close",
                                                action: "Close",
                                                access: access.Close,
                                                class: 'close-link text-bold'
                                            },{
                                                title: "Add Take Profit",
                                                action: "addtp",
                                                access: access.Close,
                                                class: 'tp-link text-bold'
                                            },{
                                                title: "Add Stop Loss",
                                                action: "addsl",
                                                access: access.Close,
                                                class: 'sl-link text-bold'
                                            },{
                                                title: "Adjust Swap Total",
                                                action: "adjustSwap",
                                                access: access.Close,
                                                class: 'sl-link text-bold'
                                            },{
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
                    case 'CLOSE':
                        $scope.closeTrade(id);
                        break;
                    case 'DETAILS':
                        // basic authentication in url:
                        var url;
                        if (reportsurl.startsWith('https://')) {
                            url = 'https://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(8);
                        } else {
                            url = 'http://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(7);
                        }
                        url = url + '/tradeaudit?tradeid=' + id;
                        openInNewTab(url);
                        break;
                    case 'ADDTP':
                        $scope.addTP(id);
                        break;
                    case 'ADDSL':
                        $scope.addSL(id);
                        break;
                    case 'ADJUSTSWAP':
                        $scope.adjustSwap(id);
                        break;
                }
            };

            $scope.addTP = function(id) {
                beforeDialog($scope);
                $scope.trade = angular.extend({}, $rootScope.trades.getById(id));
                $scope.trade.conditionaltype = "TP";
                $scope.conditionaltype = "Take Profit";
                $scope.tradeNotClosed = $scope.trade.closerate == null;
                $scope.$apply(function () {
                        $('#conditionalOrder').modal().on('shown.bs.modal',
                            function () {
                                
                            }
                        );
                    }
                );
            }

            $scope.addSL = function(id) {
                beforeDialog($scope);
                $scope.trade = angular.extend({}, $rootScope.trades.getById(id));
                $scope.trade.conditionaltype = "SL";
                $scope.conditionaltype = "Stop Loss";
                $scope.tradeNotClosed = $scope.trade.closerate == null;
                $scope.$apply(function () {
                        $('#conditionalOrder').modal().on('shown.bs.modal',
                            function () {
                                
                            }
                        );
                    }
                );
            }

            $scope.adjustSwap = function(id) {
                beforeDialog($scope);
                $scope.trade = angular.extend({}, $rootScope.trades.getById(id));
                $scope.$apply(function () {
                        $('#swapAdjustment').modal().on('shown.bs.modal',
                            function () {
                                
                            }
                        );
                    }
                );
            }

            $scope.processConditional = function() {
                if($scope.trade.conditionaltype == "TP" || $scope.trade.conditionaltype == "SL") {
                    var req = {
                        method: 'POST',
                        url: apiurl + '/position/conditionalorder',
                        data: {
                            conditionaltype: $scope.trade.conditionaltype,
                            price: $scope.trade.conditionalRate,
                            orderRequestId: $scope.trade.openorderid
                        }
                    };
                
                    $http(req)
                    .then(
                        function (successResponse) {
                            if (successResponse.data.status == 'OK') {
                                $('#conditionalOrder').modal('hide');
                                confirm("Successfully created conditional order " + successResponse.data.payload[0]);
                            } else {
                                confirm('Error uploading data: ' + successResponse.data.payload[0]);
                            }
                        },
                        function (errorResponse) {
                            var errorMessage = null;
                
                            if (errorResponse.data.payload && (errorResponse.data.payload.length > 0)) {
                                errorMessage = 'Error uploading data: ' + errorResponse.data.payload[0];
                            } else {
                                errorMessage = 'Error uploading data';
                            }
                
                            confirm(errorMessage);
                        }
                    )
                    .catch(function (response) {
                        confirm('Error uploading data');
                    });
                } else {
                    $('#conditionalOrder').modal('hide');
                    confirm("Invalid conditional type provided");
                }
            }

            $scope.processSwapAdjustment = function() {
                var req = {
                    method: 'POST',
                    url: apiurl + '/position/adjustSwap',
                    data: {
                        amount: $scope.trade.swapCharge,
                        orderRequestId: $scope.trade.openorderid
                    }
                };

                $http(req)
                .then(
                    function (successResponse) {
                        if (successResponse.data.status == 'OK') {
                            $('#swapAdjustment').modal('hide');
                            confirm("Successfully adjusted swap total on position " + $scope.trade.openorderid);
                        } else {
                            confirm('Error uploading data: ' + successResponse.data.payload[0]);
                        }
                    },
                    function (errorResponse) {
                        var errorMessage = null;
            
                        if (errorResponse.data.payload && (errorResponse.data.payload.length > 0)) {
                            errorMessage = 'Error uploading data: ' + errorResponse.data.payload[0];
                        } else {
                            errorMessage = 'Error uploading data';
                        }
            
                        confirm(errorMessage);
                    }
                )
                .catch(function (response) {
                    confirm('Error uploading data');
                });
            }

            $scope.closeTrade = function(id) {
                var trade = $rootScope.trades.getById(id);

                $scope.processing = false;
                $scope.errorMessage = null;

                $scope.orderrequestid = trade.openorderid;

                $('#closeTradeDialog').modal();
                document.getElementById("orderrequestid").value = trade.openorderid;
            }

            $scope.doClosePosition = function() {
                processClosePosition($scope, $rootScope, $http);
            }

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
                    "tradeid": $scope.trade.openorderid,
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
            $scope.accounts = $scope.accountsList;
        }
    ]
)