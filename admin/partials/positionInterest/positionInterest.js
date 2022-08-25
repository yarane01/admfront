var positionInterestControllers = angular.module('positionInterestControllers', []);

positionInterestControllers.controller('posIntCtrl',
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
                    "name": "positionInterest",
                    stateSaveCallback: function (settings, data) {
                        $rootScope.positionInterest.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.positionInterest.state.data) {
                            return $rootScope.positionInterest.state.data;
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
                                orderCol = 'accountId';
                                break;
                            case "referencen":
                                orderCol = 'referencen';
                                break;
                            case "description":
                                orderCol = 'description';
                                break;
                            case "amount":
                                orderCol = 'amount';
                                break;
                            case "transDate":
                                orderCol = 'transDate';
                                break;
                            case "linkId":
                                orderCol = 'linkId';
                                break;
                            case "userId":
                                orderCol = 'userId';
                                break;
                            case "userFrom":
                                orderCol = 'userFrom';
                                break;
                            case "clientRefId":
                                orderCol = 'clientRefId';
                                break;
                            case "tradeDate":
                                orderCol = 'tradeDate';
                                break;
                        }

                        var reqFilters = [];
                        for (var i = 0; i < data.columns.length; i++) {
                            var search = data.columns[i].search.value;
                            
                            if (search != '') {
                                switch (settings.aoColumns[i].name) {
                                    case "accountId":
                                        reqFilters.push("upper(accountId) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "referencen":
                                        reqFilters.push("upper(referencen) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "description":
                                        reqFilters.push("upper(description) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "amount":
                                        reqFilters.push("amount " + search);
                                        break;
                                    case "transDate":
                                        reqFilters.push("transdate " + search); 
                                        break;
                                    case "linkId":
                                        reqFilters.push("upper(linkId) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "userId":
                                        reqFilters.push("upper(userId) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "userFrom":
                                        reqFilters.push("upper(userFrom) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "clientRefId":
                                        reqFilters.push("upper(clientRefId) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "tradeDate":
                                        reqFilters.push("tradeDate " + search); 
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
                            $http.get(apiurl + '/swaps' + requestQuery),
                            $http.get(apiurl + '/swapscount' + countQuery)
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    $scope.error = false;
                                    $rootScope.positionInterest.data = response[0].data.payload[0];
                                    var filtered = response[1].data.payload[0];

                                    callback({
                                            "recordsTotal": $rootScope.positionInterest.total,
                                            "recordsFiltered": filtered,
                                            data: $rootScope.positionInterest.data
                                        }
                                    );
                                    setTableActionsPosHandler('table');
                                    if ($rootScope.positionInterest.state.selected.length > 0)
                                        selectRow('#table', $rootScope.positionInterest.state.selected[0]);
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
                            "data": "referencen",
                            "name":"referencen",
                            save: false
                        },
                        {
                            "data": "description",
                            "name":"description",
                            save: false
                        },
                        {
                            "data": "amount",
                            "name":"amount",
                            save: false
                        },
                        {
                            "data": "transDate",
                            "name":"transDate",
                            save: false
                        },
                        {
                            "data": "linkId",
                            "name":"linkId",
                            save: false
                        },
                        {
                            "data": "userId",
                            "name":"userId",
                            save: false
                        },
                        {
                            "data": "userFrom",
                            "name":"userFrom",
                            save: false
                        },
                        {
                            "data": "clientRefId",
                            "name":"clientRefId",
                            save: false
                        },
                        {
                            "data": "tradeDate",
                            "name":"tradeDate",
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
                restoreState(table, $rootScope.positionInterest.state, false);
            }

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.positionInterest.state);
                table.ajax.reload();
            }

            $scope.Refresh = function () {
                $('#table').DataTable().ajax.reload();
            }

            $rootScope.activePage = "positionInterest";
            $rootScope.init().then(function () {
                $scope.createTable();
                $scope.$broadcast('dataloaded');
            })

            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.positionInterest.state);
            });
        }
    ])