var groupsControllers = angular.module('groupsControllers', []);

groupsControllers.controller('GroupsCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal', '$location', '$route', '$log',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal, $location, $route, $log) {
            $scope.group = null;
            groupType = function (type) {
                return type == 0 ? "Accounts" : "Users";
            };

            $scope.context = {
                createGroup: false,
            };


            $scope.createTable = function () {

                $scope.tableOptions = {
                    "data": $rootScope.groups.data,
                    "order": [[1, 'asc']],
                    "dom": "<'row'<'col-sm-6'i>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i>>",
                    "scrollY": calcDataTableHeight(),
                    // "scrollX": true,
                    //"paging": false,
                    //"scrollCollapse": true,
                    // "scroller": true,
                    "stateSave": true,
                    "processing": true,
                    "language": {
                        "processing": "Loading..."
                    },
                    "name": "groups",
                    buttons: [
                        {
                            extend: 'csvHtml5',
                            //text: '<i class="fa fa-file-text-o"></i>',
                            text: "Export to CSV",
                            //titleAttr: 'Export to CSV',
                            title: 'Groups',
                            exportOptions: {
                                //orthogonal: 'export',
                                columns: [ 0, 1, 2, 3, 4 ]
                            }
                        }
                    ],
                    stateSaveCallback: function (settings, data) {
                        $rootScope.groups.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.groups.state.data)
                            return $rootScope.groups.state.data;
                        else
                            return null;
                    },
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.systemid);
                        //$(row).attr("style", "cursor: pointer");
                        //$(row).on('click', singleSelectionRowClick);
                    },
                    "columns": [
                        {
                            "data": "systemid",
                            save: false
                        },
                        {
                            "data": "name",
                            "class": "font-bold",
                            save: false
                        },
                        {
                            //"data": "parentName",
                            "data": null,
                            save: false,
                            "render": function (data, type, full, meta) {
                                return '<a href="Javascript:;" onclick="parentClick(\''
                                    + data.parentName + '\')">' + data.parentName + '</a>';
                            }
                        },
                        {
                            "data": null,
                            save: true,
                            name: "type",
                            "render": function (data, type, full, meta) {
                                return groupType(data.type);
                            }
                        },
                        {
                            "data": "description",
                            save: true,
                            name: "description"
                        },
                        {
                            "data": null,
                            "sortable": false,
                            "class": "actions",
                            save: false,
                            "render": function (data, type, full, meta) {
                                var access = $rootScope.access.groups;
                                return $.fn.actionList(
                                    {
                                        id: data.systemid,
                                        items: [
                                            {
                                                title: "Edit",
                                                action: "Edit",
                                                access: access.Edit,
                                                class:'edit-link text-bold'
                                            },
                                            {
                                                title: "Settings",
                                                action: "Settings",
                                                access: access.Settings,
                                                class:'settings-link'
                                            },
                                            {
                                                title: "Delete",
                                                action: "Delete",
                                                access: access.Delete,
                                                class:'delete-link'
                                            }
                                        ]
                                    }).html();
                            }
                        }
                    ]
                }
            };

            function needApplyExternalFilter() {
                return ($rootScope.groups.state.externalFilter.name &&
                (!$rootScope.groups.state.externalFilter.applied));
            }

            $scope.afterTableCreated = function () {
                var table = $('#table').DataTable();
                assignFilters('#table');
                $('#table tbody').on('click', 'tr', singleSelectionRowClick);
                var colSel = new $.fn.colSel(table, {
                    visObject: tableProperties.Columns,
                    saveFunc: $rootScope.saveTableProperties
                });
                $(colSel).appendTo('#rigth-group');
                $('#page-wrapper').addClass('page-animation');
                setTableActionsPosHandler('table');
                if (needApplyExternalFilter()) {
                    $rootScope.groups.state.externalFilter.applied = true;
                    clearState(table, $rootScope.groups.state);
                    setFilterValue(table, $rootScope.groups.state, 1,
                        $rootScope.groups.state.externalFilter.name, true);
                    //$rootScope.accounts.state.nameFilter = undefined;
                    saveState('#table', $rootScope.groups.state);
                    table.draw();
                }
                else
                    restoreState(table, $rootScope.groups.state, true, true);

                var buttons = $scope.table.buttons().container().find('.btn');
                $('a.export-placeholder').replaceWith(buttons);
            };

            $scope.clearExternalFilter = function () {
                $rootScope.groups.state.externalFilter.applied = false;
                $rootScope.groups.state.externalFilter.name = undefined;
                $scope.clearAllFilters();
            }

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.groups.state);
                table.draw();
            }

            window.parentClick = function (name) {
                $rootScope.units.state.externalFilter.name = name;
                $rootScope.units.state.externalFilter.applied = false;
                $scope.$apply(function () {
                    $location.path("/units");
                })
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
                    case 'DELETE':
                        $scope.deleteDialog(id);
                        break;
                }
            };


            function getItem(id) {
                return $rootScope.groups.getById(id);
            }

            $scope.editDialog = function (id) {
                $scope.group = $.extend({}, getItem(id));
                modal.showEditGroupDialog($scope);
            };

            $scope.deleteDialog = function (id) {
                beforeDialog($scope);
                $scope.group = $.extend({}, getItem(id));
                $scope.delete = {
                    systemid: $scope.group.systemid,
                    title: 'group ' + $scope.group.name,
                };
                $scope.$apply();
                $('#delete').modal();
            };

            $scope.createDialog = function () {
                $scope.group = $rootScope.groups.getEmpty();
                modal.showCreateGroupDialog($scope);
            };

            $scope.goSettings = function (id) {
                var item = getItem(id);
                $rootScope.settingsInfoStack.clear();
                $rootScope.settingsInfoStack.push("group", item.systemid, item.name);
                $('#settings').modal();
                angular.element($('#settings')).scope().init();
                //$location.path('/settings');
            };

            $scope.deleteItem = function () {
                $scope.context.inprogress = true;
                api.deleteGroup($scope.group.systemid, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            var id = $scope.group.systemid;
                            $scope.context.inprogress = false;
                            $('#delete').modal('hide');
                            $rootScope.groups.remove(id);
                            var tr = $('#table').DataTable().row('#' + id);
                            tr.remove().draw();
                        }
                    }
                ));
            };

            $scope.updateGroup = function () {
                $scope.context.inprogress = true;
                var id = $scope.group.systemid;
                api.updateGroup($scope.group, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            api.getGroup(id, angular.extend(errorHandler($scope),
                                {
                                    ok: function (response) {
                                        $rootScope.groups.update(id, response.data.payload[0]);
                                        var tr = $('#table').DataTable().row('#' + id);
                                        if (tr.child.isShown()) {
                                            tr.child.hide();
                                        }
                                        $rootScope.groups.fillParents();
                                        var group = getItem(id);
                                        tr.data(group).draw();
                                        $scope.context.inprogress = false;
                                        $('#editGroup').modal('hide');
                                    }
                                }
                            ));
                        }
                    }
                ));
            };

            $scope.createGroup = function () {
                $scope.context.inprogress = true;
                api.createGroup($scope.group, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            var id = response.data.payload[0].systemid;
                            api.getGroup(id, angular.extend(errorHandler($scope),
                                {
                                    ok: function (response) {
                                        $scope.context.inprogress = false;
                                        $('#createGroup').modal('hide');
                                        addRow(response, $rootScope.groups.data,
                                            function () {
                                                $rootScope.groups.fillParents();
                                            }
                                        );
                                        setTableActionsPosHandler('table');
                                    }
                                }
                            ));
                        }
                    }
                ));
            };

            $scope.Refresh = function () {
                $('#table_processing').css('display', 'block');
                $rootScope.groups.upToDate = false;
                $rootScope.updateGroups()
                    .then(function () {
                        $('#table_processing').css('display', 'none');
                    })
            }

            $rootScope.activePage = "groups";
            $rootScope.init().then(function () {
                $rootScope.updateGroups()
                    .then(function () {
                        $rootScope.updateSettingList($rootScope.groups);
                        $scope.parents = $rootScope.getGroupParents();
                        $scope.createTable();
                        $scope.$broadcast('dataloaded');
                    })
            })
            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.groups.state);
            });

        }
    ]);

