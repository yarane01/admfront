var historicalOrdersControllers = angular.module('historicalOrdersControllers', []);

historicalOrdersControllers.controller('histOrdCtrl',
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
                    "name": "historicalOrders",
                    stateSaveCallback: function (settings, data) {
                        $rootScope.historicalOrder.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.historicalOrder.state.data) {
                            return $rootScope.historicalOrder.state.data;
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

                        if(orderCol == 'orderRequestId' || orderCol == 'orderrequestid') {
                            orderCol = 'id';
                        }

                        var reqFilters = [];
                        for (var i = 0; i < data.columns.length; i++) {
                            var search = data.columns[i].search.value;
                            
                            if (search != '') {
                                switch (settings.aoColumns[i].name) {
                                    case "orderRequestId":
                                        reqFilters.push("id = " + search.trim().toUpperCase() + "");
                                        break;
                                    case "accountId":
                                        reqFilters.push("account_id LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "symbol":
                                        reqFilters.push("symbol LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "amount":
                                        reqFilters.push("amount = " + search.trim().toUpperCase() + "");
                                        break;
                                    case "clientOrderId":
                                    case "parentClientOrderId":
                                        reqFilters.push("(clientorderid LIKE '%" + search.trim().toUpperCase() + "%' OR parentclientorderid LIKE '%" + search.trim().toUpperCase() + "%')");
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
                            $http.get(apiurl + '/closedOrders' + requestQuery),
                            $http.get(apiurl + '/closedOrders/count' + countQuery)
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    $scope.error = false;
                                    $rootScope.historicalOrder.data = response[0].data.payload[0];
                                    var filtered = response[1].data.payload[0];

                                    callback({
                                            "recordsTotal": $rootScope.historicalOrder.total,
                                            "recordsFiltered": filtered,
                                            data: $rootScope.historicalOrder.data
                                        }
                                    );
                                    setTableActionsPosHandler('table');
                                    if ($rootScope.historicalOrder.state.selected.length > 0)
                                        selectRow('#table', $rootScope.historicalOrder.state.selected[0]);
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
                            "data": "symbol",
                            "name":"symbol",
                            save: false
                        },
                        {
                            "data": "amount",
                            "name":"amount",
                            save: false
                        },
                        {
                            "data": "type",
                            "name":"type",
                            save: false
                        },
                        {
                            "data": "duration",
                            "name":"duration",
                            save: false
                        },
                        {
                            "data": "execution",
                            "name":"execution",
                            save: false
                        },
                        {
                            "data": "rate",
                            "name":"rate",
                            save: false
                        },
                        {
                            "data": "quoteId",
                            "name":"quoteId",
                            save: false
                        },
                        {
                            "data": "stopRange",
                            "name":"stopRange",
                            save: false
                        },
                        {
                            "data": "trailing",
                            "name":"trailing",
                            save: false
                        },
                        {
                            "data": "clientOrderId",
                            "name":"clientOrderId",
                            save: false
                        },
                        {
                            "data": "source",
                            "name":"source",
                            save: false
                        },
                        {
                            "data": "requestTime",
                            "name":"requestTime",
                            save: false
                        },
                        {
                            "data": "requestId",
                            "name":"requestId",
                            save: false
                        },
                        {
                            "data": "recordTime",
                            "name":"recordTime",
                            save: false
                        },
                        {
                            "data": "processingMode",
                            "name":"processingMode",
                            save: false
                        },
                        {
                            "data": "sendOrderTime",
                            "name":"sendOrderTime",
                            save: false
                        },
                        {
                            "data": "parentClientOrderId",
                            "name":"parentClientOrderId",
                            save: false
                        },
                        {
                            "data": "expireTime",
                            "name":"expireTime",
                            save: false
                        },
                        {
                            "data": "orderSource",
                            "name":"orderSource",
                            save: false
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
                restoreState(table, $rootScope.historicalOrder.state, false);
            }

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.historicalOrder.state);
                table.ajax.reload();
            }

            $scope.Refresh = function () {
                $('#table').DataTable().ajax.reload();
            }

            $rootScope.activePage = "historicalOrders";
            $rootScope.init().then(function () {
                $scope.createTable();
                $scope.$broadcast('dataloaded');
            })

            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.historicalOrder.state);
            });
        }
    ])