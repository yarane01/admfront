angular.module('portal')
    .controller('settingnodesCtrl',
        ['$scope', '$rootScope', '$http', '$q', function ($scope, $rootScope, $http, $q) {
            $scope.context = {};

            $scope.createTable = function () {
                $scope.tableOptions = {
                    //"dom": "irtip",
                    "dom": "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    "processing": true,
                    "serverSide": true,
                    "language": {
                        "processing": "Loading..."
                    },
                    "order": [[1, 'asc']],
                    //"pageLength": 10,
                    "scrollY": calcDataTableHeight() - 100,
                    "paging": true,
                    //"stateSave": true,
                    "name": "settingnodes",
                    /*
                     stateSaveCallback: function (settings, data) {
                     $rootScope.users.state.data = data;
                     },
                     stateLoadCallback: function (settings) {
                     if ($rootScope.users.state.data)
                     return $rootScope.users.state.data;
                     else
                     return null;
                     },
                     */
                    "initComplete": function (settings, json) {
                    },
                    "ajax": function (data, callback, settings) {
                        var orderCol;
                        var index = data.order[0].column;
                        switch (settings.aoColumns[index].name) {
                            case "systemid":
                                orderCol = 'SYSTEMID';
                                break;
                            case "nodename":
                                orderCol = 'nodename';
                                break;
                            case "value":
                                orderCol = 'value';
                                break;
                            case "defaultvalue":
                                orderCol = 'defaultvalue';
                                break;
                            case "type":
                                orderCol = 'SYSTEMIDTYPE';
                                break;
                            case "symbol":
                                orderCol = 'SUBCONDITION';
                                break;
                        }

                        var reqFilters = [];
                        for (var i = 0; i < 4; i++) {
                            var search = data.columns[i].search.value;
                            if (search != '') {
                                switch (settings.aoColumns[i].name) {
                                    case "systemid":
                                        reqFilters.push("systemid='" + search + "'");
                                        break;
                                    case "nodename":
                                        reqFilters.push("nodename LIKE '%" + search.trim() + "%'");
                                        break;
                                    case "value":
                                        if (isCorrectFilter(search))
                                            reqFilters.push("value " + search);
                                        break;
                                    case "defaultvalue":
                                        if (isCorrectFilter(search))
                                            reqFilters.push("defaultvalue " + search);
                                        break;
                                }
                            }
                        }
                        if (parseInt($scope.nodeTypeFilter) >= 0) {
                            reqFilters.push("SYSTEMIDTYPE=" + $scope.nodeTypeFilter);
                        }
                        if ($scope.symbolFilter != "") {
                            reqFilters.push("SUBCONDITION='" + $scope.symbolFilter + "'");
                        }

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
                        $scope.error = false;
                        $q.all([
                            $http.get(apiurl + '/settingnodes/' + $rootScope.settingLocator.id, {params: reqParams}),
                            $http.get(apiurl + '/settingnodescount/' + $rootScope.settingLocator.id, {params: countFilter}),
                            $http.get(apiurl + '/settingnodescount/' + $rootScope.settingLocator.id)
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    callback({
                                            "recordsTotal": response[2].data.payload[0].count,
                                            "recordsFiltered": response[1].data.payload[0].count,
                                            data: response[0].data.payload[0]
                                        }
                                    );
                                    //assignTableActions('table');
                                    //if ($rootScope.users.state.selected.length > 0)
                                    //    selectRow('#table', $rootScope.users.state.selected[0]);
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
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.systemid);
                    },
                    "columns": [
                        {
                            "data": "systemid",
                            "name": "systemid"
                        },
                        {
                            "data": "nodename",
                            "class": "font-bold",
                            "name": "nodename"
                        },
                        {
                            "data": "value",
                            "name": "value"
                        },
                        {
                            "data": "defaultvalue",
                            "name": "defaultvalue"
                        },
                        {
                            "data": null,
                            "name": "type",
                            "render": function (data, type, full, meta) {
                                return systemIdTypeMap[data.systemidtype]
                            }
                        },
                        {
                            "data": "subcondition",
                            "name": "symbol"
                        }
                    ]
                }
            };

            $scope.afterTableCreated = function () {
                assignFilters('#locatortable');
            }

            $scope.clearAllFilters = function () {
                $scope.nodeTypeFilter = -1;
                $scope.symbolFilter = "";
                var table = $('#locatortable').DataTable();
                clearState(table);
                table.ajax.reload();
            }

            $scope.systemIdTypeMap = systemIdTypeMap;
            $scope.symbols = $rootScope.instruments.getNameId();

            $scope.selectFilterChanged = function () {
                var table = $('#locatortable').DataTable();
                table.ajax.reload();
            }

            $scope.init = function () {
                $scope.nodeTypeFilter = -1;
                $scope.symbolFilter = "";
                $('#locatortable').DataTable().destroy();
                $scope.createTable();
                $scope.$broadcast('dataloaded');
            }
        }
        ]);

