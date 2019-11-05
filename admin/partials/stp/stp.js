var stpControllers = angular.module('stpControllers', []);

stpControllers.controller('stpOrdersCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal', '$location', '$route', '$log',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal, $location, $route, $log) {

            $scope.context = {}
            $scope.filterReady = false;
            $scope.statusFilter = {}

            $scope.createTable = function () {
                $scope.tableOptions = {
                    //"data": $rootScope.accounts.data,
                    // "order": [[1, 'asc']],
                    "ordering": false,
                    "processing": true,
                    "serverSide": true,
                    "language": {
                        "processing": "Loading..."
                    },
                    //"pageLength": 10,
                    "lengthMenu": [[10, 50, 100, -1], [10, 50, 100, "All"]],
                    "scrollY": calcDataTableHeight(),
                    "scrollX": true,
                    "paging": true,
                    "name": "stporders",
                    // "dom": "<'row'<'col-sm-6'i><'col-sm-6'l>>" +
                    "dom": "<'row'<'col-sm-6'l>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    "initComplete": function (settings, json) {
                    },
                    "stateSave": true,
                    stateSaveCallback: function (settings, data) {
                        $rootScope.stpOrders.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.stpOrders.state.data)
                            return $rootScope.stpOrders.state.data;
                        else
                            return null;
                    },
                    "ajax": function (data, callback, settings) {
                        /*
                         var orderCol;
                         var index = data.order[0].column;
                         switch (settings.aoColumns[index].name) {
                         case "systemid":
                         orderCol = 'systemid';
                         break;
                         case "accountn":
                         orderCol = 'accountn';
                         break;
                         case "ownername":
                         orderCol = 'ownername';
                         break;
                         case "tradername":
                         orderCol = 'tradername';
                         break;
                         case "parent":
                         orderCol = 'parenthierarchynodename';
                         break;
                         case "basecurrency":
                         orderCol = 'basecurrency';
                         break;
                         case "balance":
                         orderCol = 'balance';
                         break;
                         case "type":
                         orderCol = 'type';
                         break;
                         case "usedmargin":
                         orderCol = 'usedmargin';
                         break;
                         case "usablemargin":
                         orderCol = 'usablemargin';
                         break;
                         case "opendate":
                         orderCol = 'opendate';
                         break;
                         case "accountclosed":
                         orderCol = 'accountclosed';
                         break;
                         }
                         */

                        /*
                         var reqFilters = [];
                         for (var i = 0; i < 11; i++) {
                         var search = data.columns[i].search.value;
                         if (search != '') {
                         switch (settings.aoColumns[i].name) {
                         case "systemid":
                         reqFilters.push("systemid='" + search + "'");
                         break;
                         case "accountn":
                         if ($rootScope.accounts.state.externalFilter.applied)
                         reqFilters.push("accountn LIKE '" + search + "'");
                         else
                         reqFilters.push("upper(accountn) LIKE '%" + search.trim().toUpperCase() + "%'");
                         break;
                         case "ownername":
                         reqFilters.push("upper(ownername) LIKE '%" + search.trim().toUpperCase() + "%'");
                         break;
                         case "tradername":
                         reqFilters.push("upper(tradername) LIKE '%" + search.trim().toUpperCase() + "%'");
                         break;
                         case "parent":
                         reqFilters.push("upper(PARENTHIERARCHYNODENAME) LIKE '%" + search.trim().toUpperCase() + "%'");
                         break;
                         case "basecurrency":
                         reqFilters.push("upper(basecurrency) LIKE '%" + search.trim().toUpperCase() + "%'");
                         break;
                         case "balance":
                         if (isCorrectFilter(search))
                         reqFilters.push("balance " + search);
                         break;
                         case "usedmargin":
                         reqFilters.push("usedmargin>=" + search);
                         break;
                         case "accountclosed":
                         reqFilters.push("upper(accountclosed) LIKE '" + search.trim().toUpperCase() + "%'");
                         break;
                         case "type":
                         if (search.toUpperCase() == 'T')
                         reqFilters.push("type=0");
                         else reqFilters.push("type=2");
                         break;
                         }
                         }
                         }
                         */

                        var statuses = getStatusFilter().join(",");
                        var reqParams = {
                            // sortcolumn: orderCol + ' ' + data.order[0].dir
                            statuses: statuses
                        };

                        if (data.length != -1) {
                            reqParams.n1 = data.start + 1;
                            reqParams.n2 = data.start + data.length;

                        }

                        var countFilter = {statuses: statuses};
                        /*
                         if (reqFilters.length > 0) {
                         reqParams.filter = reqFilters.join(' AND ');
                         countFilter.filter = reqParams.filter;
                         }
                         */

                        $scope.error = false;
                        $q.all([
                            $http.get(stpapiurl + '/transactions', {params: reqParams}),
                            $http.get(stpapiurl + '/transactions?count', {params: countFilter})
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    $rootScope.stpOrders.data = response[0].data.payload[0];
                                    var filtered = response[1].data.payload[0].count;

                                    callback({
                                            "recordsTotal": $rootScope.stpOrders.total,
                                            "recordsFiltered": filtered,
                                            data: $rootScope.stpOrders.data
                                        }
                                    );
                                    setTableActionsPosHandler('table');
                                    if ($rootScope.stpOrders.state.selected.length > 0)
                                        selectRow('#table', $rootScope.stpOrders.state.selected[0]);
                                }
                                else {
                                    $scope.errorMessage = response[0].data.payload[0];
                                    $scope.error = true;
                                }
                            }, function (response) {
                                $scope.errorMessage = response.data;
                                $scope.error = true;
                            })
                    }

                    ,
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.systemid);
                        //$(row).on('click', singleSelectionRowClick);
                    }
                    ,
                    "columns": [
                        {
                            "data": "accountId",
                            save: true,
                            name: "accountId"
                        },
                        {
                            "data": "vtsOrderId",
                            save: true,
                            name: "vtsOrderId"
                        },
                        {
                            "data": "price",
                            save: true,
                            name: "price"
                        },
                        {
                            "data": "bank",
                            save: true,
                            name: "bank"
                        },
                        {
                            "data": "amount",
                            save: true,
                            name: "amount"
                        },
                        {
                            "data": "side",
                            save: true,
                            name: "side"
                        },
                        {
                            "data": "orderId",
                            save: true,
                            name: "orderId"
                        },
                        {
                            "data": "bankTradeId",
                            save: true,
                            name: "bankTradeId"
                        },
                        {
                            "data": "counterparty",
                            save: true,
                            name: "counterparty"
                        },
                        {
                            "data": "orderStatus",
                            save: true,
                            name: "orderStatus"
                        },
                        {
                            "data": "instrument",
                            save: true,
                            name: "instrument"
                        },
                        {
                            "data": "filledAmount",
                            save: true,
                            name: "filledAmount"
                        },
                        {
                            "data": "executionPrice",
                            save: true,
                            name: "executionPrice"
                        },
                        {
                            "data": "quoteId",
                            save: true,
                            name: "quoteId"
                        },
                        {
                            "data": "filledPartially",
                            save: true,
                            name: "filledPartially"
                        },
                        {
                            "data": "transactionReportOrigination",
                            save: true,
                            name: "transactionReportOrigination"
                        },
                        {
                            "data": "totallyFilledAmount",
                            save: true,
                            name: "totallyFilledAmount"
                        },
                        {
                            "data": "type",
                            save: true,
                            name: "type"
                        },
                        {
                            "data": "broadcast",
                            save: true,
                            name: "broadcast"
                        },
                        {
                            "data": "updateTimeFormatted",
                            save: true,
                            name: "updateTime"
                        },
                        {
                            "data": "creationTimeFormatted",
                            save: true,
                            name: "creationTime"
                        }
                    ]
                }
            };


            $scope.afterTableCreated = function () {
                var table = $('#table').DataTable();
                // assignFilters('#table');
                $('#table tbody').on('click', 'tr', singleSelectionRowClick);
                var colSel = new $.fn.colSel(table, {
                    visObject: tableProperties.Columns,
                    saveFunc: $rootScope.saveTableProperties
                });
                $(colSel).appendTo('#rigth-group');
                $('#page-wrapper').addClass('page-animation');
                restoreState(table, $rootScope.stpOrders.state, true);
            };

            /*
             function getItem(id) {
             return $rootScope.accounts.getById(id);
             }

             $scope.clearAllFilters = function () {
             var table = $('#table').DataTable();
             clearState(table, $rootScope.accounts.state);
             table.ajax.reload();
             }

             window.actionClick = function (link) {
             var action = $(link).data('action');
             var id = $(link).data('id');
             switch (action.toUpperCase()) {
             case 'EDIT':
             $scope.editDialog(id);
             break;
             case 'SETTINGS':
             $scope.goSettings(id);
             break;
             case 'EXPOSURE':
             $scope.exposureDialog(id);
             break;
             case 'DEPOSIT':
             $scope.depositDialog(id);
             break;
             case 'WITHDRAW':
             $scope.withdrawDialog(id);
             break;
             case 'ADJUST':
             $scope.adjustDialog(id);
             break;
             case 'CHANGE PARENT':
             $scope.changeParentDialog(id);
             break;
             case 'HISTORY':
             $scope.historyDialog(id);
             break;
             case 'REPORT':
             $scope.goReports(id);
             break;
             case 'EXECUTED ORDERS REPORT':
             $scope.goExReports(id);
             break;
             case "DAILY VOLUME REPORT":
             $scope.goDailyReports(id);
             break;
             case "TRADE":
             $scope.createTradeDialog(id);
             break;
             case "ORDER":
             $scope.createOrderDialog(id);
             break;

             }
             };
             */

            function succes(dialog, resetPaging) {
                $scope.context.inprogress = false;
                $('#' + dialog).modal('hide');
                saveState('#table', $rootScope.accounts.state);
                $('#table').DataTable().ajax.reload(null, resetPaging);
            }

            $scope.Refresh = function () {
                $('#table').DataTable().ajax.reload();
            }

            $rootScope.activePage = "orders";
            $http.get(stpapiurl + '/orderstatuses')
                .then(function (res) {
                    if (res.data.status == "OK") {
                        // $scope.orderStatuses = res.data.payload[0];
                        res.data.payload[0].forEach(function (s) {
                            $scope.statusFilter[s] = true;
                        })
                        $scope.filterReady = true;
                        $scope.createTable();
                        $scope.$broadcast('dataloaded');
                    }
                })

            function getStatusFilter() {
                var fields = [];
                Object.keys($scope.statusFilter).forEach(function (s) {
                    if ($scope.statusFilter[s]) fields.push(s);
                })
                return fields;
            }

            $scope.showAll = function () {
                Object.keys($scope.statusFilter).forEach(function (s) {
                    $scope.statusFilter[s] = true;
                })
                $scope.Refresh()
            }

            $scope.statusFilterChanged = function () {
                $scope.Refresh()
            }

            $scope.exportToCSV = function () {
                function error(res) {
                    if (res.data.status)
                        $scope.errorMessage = res.data.payload[0];
                    else
                        $scope.errorMessage = 'HTTP status ' + res.status;
                    $scope.error = true;
                }

                var statuses = getStatusFilter().join(",");
                var countFilter = {statuses: statuses};
                $scope.error = false;

                $scope.error = false;
                $http.get(stpapiurl + '/transactions?count', {params: countFilter})
                    .then(
                        function (res) {
                            var count = res.data.payload[0].count;
                            $http.get(stpapiurl + '/transactions', {params: {n1: 1, n2: count, statuses: statuses}})
                                .then(
                                    function (res) {
                                        var csv = json2csv({data: res.data.payload[0]});
                                        saveData("STPOrders.csv", csv);
                                    },
                                    function (res) {
                                        error(res)
                                    }
                                )
                        },
                        function (res) {
                            error(res)
                        }
                    )
            }

            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.stpOrders.state);
            });

        }
    ])

