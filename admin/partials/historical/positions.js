var historicalPositionControllers = angular.module('historicalPositionControllers', []);

historicalPositionControllers.controller('histPosCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal) {

            $scope.context = {};
            var filterMode = "";

            $scope.createTable = function () {
                $scope.tableOptions = {
                    "dom": "<'row'<'col-sm-6'i>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    "processing": true,
                    "serverSide": true,
                    "pageLength": 15,
                    "language": {
                        "processing": "Loading..."
                    },
                    "scrollY": calcDataTableHeight(),
                    "order": [[0, 'desc']],
                    "paging": true,
                    "stateSave": true,
                    "name": "historicalPositions",
                    stateSaveCallback: function (settings, data) {
                        $rootScope.historicalPosition.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.historicalPosition.state.data) {
                            return $rootScope.historicalPosition.state.data;
                        }
                        else
                            return null;
                    },
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.referencen);
                    },
                    "ajax": function (data, callback, settings) {
                        var orderCol;
                        var index = data.order[0].column;
                        orderCol = settings.aoColumns[index].name;
                        /*switch (settings.aoColumns[index].name) {
                            case "accountId":
                                orderCol = 'account_id';
                                break;
                            case "historicalPositionsDate":
                                orderCol = 'lq_time';
                                break;
                            case "usedMargin":
                                orderCol = 'used_margin';
                                break;
                            case "usableMargin":
                                orderCol = 'usable_margin';
                                break;
                            case "marginPercent":
                                orderCol = 'margin_percent';
                                break;
                            case "balance":
                                orderCol = 'balance';
                                break;
                            case "totalPl":
                                orderCol = 'total_pl';
                                break;
                            case "positionCount":
                                orderCol = 'position_count';
                                break;
                            case "comment":
                                orderCol = 'comment_text';
                                break;
                        }*/

                        var reqFilters = [];
                        for (var i = 0; i < data.columns.length; i++) {
                            var search = data.columns[i].search.value;
                            
                            if (search != '') {
                                switch (settings.aoColumns[i].name) {
                                    case "orderRequestId":
                                        reqFilters.push("orderrequestid LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "accountId":
                                        reqFilters.push("accountid LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "instrumentId":
                                        reqFilters.push("instrumentid = " + search.trim().toUpperCase() + "");
                                        break;
                                    case "amount":
                                        reqFilters.push("amount =" + search.trim().toUpperCase() + "");
                                        break;
                                    case "clientOrderId":
                                        reqFilters.push("clientOrderId LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                }
                            }
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
                            $http.get(apiurl + '/closedPositions' + requestQuery),
                            $http.get(apiurl + '/closedPositions/count' + countQuery)
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    $scope.error = false;

                                    $rootScope.historicalPositions.data = response[0].data.payload[0];
                                    var filtered = response[1].data.payload[0].count;

                                    callback({
                                            "recordsTotal": $rootScope.historicalPositions.total,
                                            "recordsFiltered": filtered,
                                            data: $rootScope.historicalPositions.data
                                        }
                                    );
                                    setTableActionsPosHandler('table');
                                    if ($rootScope.historicalPosition.state.selected.length > 0)
                                        selectRow('#table', $rootScope.historicalPosition.state.selected[0]);
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
                            "data": "orderRequestId",
                            "name":"orderRequestId",
                            save: false
                        },
                        {
                            "data": "accountId",
                            "name":"accountId",
                            save: false
                        },
                        {
                            "data": "instrumentId",
                            "name":"instrumentId",
                            save: false
                        },
                        {
                            "data": "amount",
                            "name":"amount",
                            save: false
                        },
                        {
                            "data": "clientOrderId",
                            "name":"clientOrderId",
                            save: false
                        },
                        {
                            "data": "openDate",
                            "name":"openDate",
                            save: false
                        },
                        {
                            "data": "openRate",
                            "name":"openRate",
                            save: false
                        },
                        {
                            "data": "openMarkup",
                            "name":"openMarkup",
                            save: false
                        },
                        {
                            "data": "openOrderAmount",
                            "name":"openOrderAmount",
                            save: false
                        },
                        {
                            "data": "openCommission",
                            "name":"openCommission",
                            save: false
                        },
                        {
                            "data": "closeDate",
                            "name":"closeDate",
                            save: false
                        },
                        {
                            "data": "closeAvgRate",
                            "name":"closeAvgRate",
                            save: false
                        },
                        {
                            "data": "closeSumMarkup",
                            "name":"closeSumMarkup",
                            save: false
                        },
                        {
                            "data": "closeSumAmount",
                            "name":"closeSumAmount",
                            save: false
                        },
                        {
                            "data": "closeSumCommission",
                            "name":"closeSumCommission",
                            save: false
                        },
                        {
                            "data": "profitLoss",
                            "name":"profitLoss",
                            save: false
                        },
                        {
                            "data": "interest",
                            "name":"interest",
                            save: false
                        },
                        {
                            "data": "dividend",
                            "name":"dividend",
                            save: false
                        },
                        {
                            "data": null,
                            "sortable": false,
                            save: false,
                            "class": "actions",
                            "render": function (data, type, full, meta) {
                                return ""
                            }
                        }
                    ]
                }
            }

            $scope.afterTableCreated = function () {
                var table = $('#table').DataTable();
                assignFilters('#table');
                var colSel = new $.fn.colSel(table, {
                    visObject: tableProperties.Columns,
                    saveFunc: $rootScope.saveTableProperties
                });
                $(colSel).prependTo('#rigth-group');
                restoreState(table, $rootScope.historicalPosition.state, false);
            }

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.historicalPosition.state);
                table.ajax.reload();
            }

            $scope.Refresh = function () {
                $('#table').DataTable().ajax.reload();
            }

            $rootScope.activePage = "historicalPositions";
            $rootScope.init().then(function () {
                $scope.createTable();
                $scope.$broadcast('dataloaded');
            })

            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.historicalPosition.state);
            });
        }
    ])