var ordersControllers = angular.module('ordersControllers', []);

ordersControllers.controller('OrdersCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal) {

            $rootScope.activePage = "orders";
            $scope.context = {};
            var dateFilter = "";

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
                    "name": "orders",
                    stateSaveCallback: function (settings, data) {
                        $rootScope.orders.state.dateFilter = dateFilter;
                        $rootScope.orders.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.orders.state.data) {
                            dateFilter = $rootScope.orders.state.dateFilter;
                            return $rootScope.orders.state.data;
                        }
                        else
                            return null;
                    },
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.orderid);
                    },
                    "ajax": function (data, callback, settings) {

                        var orderCol;
                        var index = data.order[0].column;
                        switch (settings.aoColumns[index].name) {
                            case "orderid":
                                orderCol = 'orderid';
                                break;
                            case "accountn":
                                orderCol = 'accountn';
                                break;
                            case "trader":
                                orderCol = 'loginname';
                                break;
                            case "symbol":
                                orderCol = 'symbol';
                                break;
                            case "amount":
                                orderCol = 'amount';
                                break;
                            case "type":
                                orderCol = 'type';
                                break;
                            case "mode":
                                orderCol = 'PROCESSINGMODE';
                                break;
                            case "openrate":
                                orderCol = 'openrate';
                                break;
                            case "opendate":
                                orderCol = 'opendate';
                                break;
                            case "clientorderid":
                                orderCol = 'clientorderid';
                                break;
                            case "bankorderid":
                                orderCol = 'bankorderid';
                                break;
                        }

                        var reqFilters = [];
                        for (var i = 0; i < 11; i++) {
                            var search = data.columns[i].search.value;
                            if (search != '') {
                                switch (settings.aoColumns[i].name) {
                                    case "orderid":
                                        reqFilters.push("orderid='" + search + "'");
                                        break;
                                    case "accountn":
                                        reqFilters.push("upper(accountn) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "trader":
                                        reqFilters.push("upper(loginname) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "symbol":
                                        reqFilters.push("upper(symbol) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "openrate":
                                        reqFilters.push("openrate" + search);
                                        break;
                                    case "amount":
                                        reqFilters.push("AMOUNT" + search);
                                        break;
                                    case "type":
                                        reqFilters.push("upper(type) LIKE '" + search.toUpperCase() + "%'");
                                        break;
                                    case "opendate":
                                        orderCol = 'opendate';
                                        break;
                                    case "clientorderid":
                                        reqFilters.push("clientorderid LIKE '%" + search.trim() + "%'");
                                        break;
                                    case "bankorderid":
                                        reqFilters.push("bankorderid LIKE '%" + search.trim() + "%'");
                                        break;
                                }
                            }
                        }
                        if (dateFilter != "") reqFilters.push(dateFilter);

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
                            $http.get(apiurl + '/orders/pending' + requestQuery),
                            $http.get(apiurl + '/orders/pending/count' + countQuery)
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    $scope.error = false;
                                    $rootScope.orders.data = response[0].data.payload[0];
                                    var filtered = response[1].data.payload[0].count;

                                    callback({
                                            "recordsTotal": $rootScope.orders.total,
                                            "recordsFiltered": filtered,
                                            data: $rootScope.orders.data
                                        }
                                    );
                                    setTableActionsPosHandler('table');
                                    if ($rootScope.orders.state.selected.length > 0)
                                        selectRow('#table', $rootScope.orders.state.selected[0]);
                                }
                                else {
                                    $scope.error = true;
                                    $scope.errorMessage = response[0].data.payload[0];
                                }
                            }, function (response) {
                                $scope.errorMessage = response.data;
                                $scope.error = true;
                            })
                    },
                    "columns": [
                        {
                            "data": "orderid",
                            save: false,
                            name: "orderid"
                        },
                        {
                            "data": "accountn",
                            save: true,
                            name: "accountn"
                        },
                        {
                            "data": "loginname",
                            save: true,
                            name: "trader"
                        },
                        {
                            "data": "symbol",
                            save: true,
                            name: "symbol"
                        },
                        {
                            "data": "amount",
                            save: true,
                            name: "amount"
                        },
                        {
                            "data": "typen",
                            save: true,
                            name: "type"
                        },
                        {
                            "data": "processingmoden",
                            save: true,
                            name: "mode"
                        },
                        {
                            "data": "openrate",
                            save: true,
                            name: "openrate"
                        },
                        {
                            "data": "opendate",
                            save: true,
                            "class": "opendate",
                            name: "opendate"
                        },
                        {
                            "data": "clientorderid",
                            save: true,
                            name: "clientorderid"
                        },
                        {
                            "data": "bankorderid",
                            save: true,
                            name: "bankorderid"
                        },
                        {
                            "data": null,
                            "sortable": false,
                            //"class": "actions",
                            save: false,
                            name: "",
                            "render": function (data, type, full, meta) {
                                var access = $rootScope.access.orders;
                                return $.fn.actionList(
                                    {
                                        id: data.orderid,
                                        items: [
                                            {
                                                title: "Edit",
                                                action: "Edit",
                                                access: access.Edit,
                                                class: 'edit-link text-bold'
                                            },
                                            {
                                                title: "Delete",
                                                action: "Delete",
                                                access: access.Delete,
                                                class: 'delete-link'
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

            $scope.afterTableCreated = function () {
                var table = $('#table').DataTable();
                assignFilters('#table');
                var colSel = new $.fn.colSel(table, {
                    visObject: tableProperties.Columns,
                    saveFunc: $rootScope.saveTableProperties
                });
                $(colSel).prependTo('#rigth-group');
                restoreState(table, $rootScope.orders.state, false);
            }

            window.actionClick = function (link) {
                var action = $(link).data('action');
                var id = $(link).data('id');
                switch (action.toUpperCase()) {
                    case 'EDIT':
                        $scope.editDialog(id);
                        break;
                    case 'DELETE':
                        $scope.deleteDialog(id);
                        break;
                    case 'DETAILS':
                        var tradeN = $rootScope.orders.getById(id).ordern;
                         var url = '/reports/TradeAuditServlet?action=displayReport&UnitID=100&TradeN=' + tradeN + '&OrderN=ORDER&SUBMIT=Request';
                         openInNewTab(tradeserverurl + url);
                        // var url = reportsurl + '/ReportingServlet?class=OrderAudit&orderid=' + tradeN;
                        // openInNewTab(url);
                        break;
                }
            };

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.orders.state);
                dateFilter = "";
                table.ajax.reload();
            }

            $scope.createDateFilter = function () {
                $scope.dateFilter = createDateFilterObject();
                $('#setDateFilters').modal();
            }

            $scope.setDateFilter = function () {
                dateFilter = $scope.dateFilter.stringFor('opendate');
                $('#setDateFilters').modal('hide');
                var table = $('#table').DataTable();
                table.ajax.reload();
            }

            $rootScope.updateOrdersCount().then(function () {
                $scope.createTable();
                $scope.$broadcast('dataloaded');
            })

            $scope.createDialog = function () {
                $scope.context.createOrder = true;
                $timeout(function () {
                    beforeDialog($scope);
                    $('#createOrder').modal().on('shown.bs.modal',
                        function () {
                            $('#rate').focus();
                        }
                    )
                }, 0);
            }

            $scope.editDialog = function (id) {
                beforeDialog($scope);
                $scope.order = angular.extend({}, $rootScope.orders.getById(id));
                $scope.$apply(function () {
                        $('#editOrder').modal().on('shown.bs.modal',
                            function () {
                                $('#openRate').focus();
                            }
                        );
                    }
                );
            }

            $scope.deleteDialog = function (id) {
                beforeDialog($scope);
                $scope.order = $.extend({}, $rootScope.orders.getById(id));
                $scope.delete = {
                    systemid: $scope.order.ordern,
                    title: 'order ' + $scope.order.ordern
                };
                $scope.$apply();
                $('#delete').modal();
            };

            $scope.deleteItem = function () {
                $scope.context.inprogress = true;
                api.deleteOrder($scope.order.ordern, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            $scope.context.inprogress = false;
                            $('#delete').modal('hide');
                            var table = $('#table').DataTable();
                            table.ajax.reload();
                        }
                    }
                ));
            };

            $scope.updateOrder = function () {
                $scope.context.inprogress = true;
                var order = {
                    "orderid": $scope.order.orderid,
                    "rate": $scope.order.openrate,
                    "amount": $scope.order.amount
                }
                api.updateOrder(order, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            $scope.context.inprogress = false;
                            $("#editOrder").modal('hide').on('hidden.bs.modal', function () {
                                $("#editOrder").off();
                                saveState('#table', $rootScope.orders.state);
                                $('#table').DataTable().ajax.reload();
                            })
                        }
                    }
                ));
            }

            $scope.Refresh = function () {
                $('#table').DataTable().ajax.reload();
            }

            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.orders.state);
            });

        }
    ])

ordersControllers.controller('OrderCreateCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal) {
            $scope.context.inprogress = false;
            $scope.context.error = false;
            $scope.context.filter = "";
            $scope.context.title = 'Create entry order';

            var proxy = new orderProxy($scope, $rootScope, api);
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
                proxy.createTrade(function () {
                    $("#createOrder").modal('hide').on('hidden.bs.modal', function () {
                        $("#createOrder").off();
                        $scope.context.createOrder = false;
                        saveState('#table', $rootScope.orders.state);
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
