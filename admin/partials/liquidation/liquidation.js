var liquidationControllers = angular.module('liquidationControllers', []);

liquidationControllers.controller('liquidationCtrl',
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
                    "order": [[1, 'desc']],
                    "paging": true,
                    "stateSave": true,
                    "name": "liquidation",
                    stateSaveCallback: function (settings, data) {
                        $rootScope.liquidation.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.liquidation.state.data) {
                            return $rootScope.liquidation.state.data;
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
                        switch (settings.aoColumns[index].name) {
                            case "accountId":
                                orderCol = 'account_id';
                                break;
                            case "liquidationDate":
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
                        }

                        var reqFilters = [];
                        for (var i = 0; i < data.columns.length; i++) {
                            var search = data.columns[i].search.value;
                            
                            if (search != '') {
                                switch (settings.aoColumns[i].name) {
                                    case "accountId":
                                        reqFilters.push("account_id LIKE '%" + search.trim().toUpperCase() + "%'");
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
                            $http.get(apiurl + '/liquidation' + requestQuery),
                            $http.get(apiurl + '/liquidation/count' + countQuery)
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    $scope.error = false;
                                    $rootScope.liquidation.data = response[0].data.payload[0];
                                    var filtered = response[1].data.payload[0];

                                    callback({
                                            "recordsTotal": $rootScope.liquidation.total,
                                            "recordsFiltered": filtered,
                                            data: $rootScope.liquidation.data
                                        }
                                    );
                                    setTableActionsPosHandler('table');
                                    if ($rootScope.liquidation.state.selected.length > 0)
                                        selectRow('#table', $rootScope.liquidation.state.selected[0]);
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
                            "data": "accountId",
                            "name":"accountId",
                            save: false
                        },
                        {
                            "data": "liquidationDate",
                            "name":"liquidationDate",
                            save: false
                        },
                        {
                            "data": "usedMargin",
                            "name":"usedMargin",
                            save: false
                        },
                        {
                            "data": "usableMargin",
                            "name":"usableMargin",
                            save: false
                        },
                        {
                            "data": "marginPercent",
                            "name":"marginPercent",
                            save: false
                        },
                        {
                            "data": "balance",
                            "name":"balance",
                            save: false
                        },
                        {
                            "data": "totalPl",
                            "name":"totalPl",
                            save: false
                        },
                        {
                            "data": "positionCount",
                            "name":"positionCount",
                            save: false
                        },
                        {
                            "data": "comment",
                            "name":"comment",
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
                restoreState(table, $rootScope.liquidation.state, false);
            }

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.liquidation.state);
                table.ajax.reload();
            }

            $scope.Refresh = function () {
                $('#table').DataTable().ajax.reload();
            }

            $rootScope.activePage = "liquidation";
            $rootScope.init().then(function () {
                $scope.createTable();
                $scope.$broadcast('dataloaded');
            })

            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.liquidation.state);
            });
        }
    ])