var unitsControllers = angular.module('unitsControllers', []);

unitsControllers.controller('UnitsCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal) {
            $scope.unit = null;
            $scope.uTypes = [
                "Market Maker",
                "Clearing House",
                "None Clearing Broker",
                "Introducing Broker"
            ];

            $scope.context = {
                createUnit: false,
                locator: false
            };

            $scope.createTable = function () {

                $scope.tableOptions = {
                    "data": $rootScope.units.data,
                    "order": [[2, 'asc']],
                    //"dom": "ti",
                    "dom": "<'row'<'col-sm-6'i>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i>>",
                    "scrollY": calcDataTableHeight(),
                    "scrollX": true,
                    //"paging": true,
                    //"scrollCollapse": true,
                    // "scroller": true,
                    "stateSave": true,
                    "processing": true,
                    "language": {
                        "processing": "Loading..."
                    },
                    "name": "units",
                    buttons: [
                        {
                            extend: 'csvHtml5',
                            //text: '<i class="fa fa-file-text-o"></i>',
                            text: "Export to CSV",
                            //titleAttr: 'Export to CSV',
                            title: 'Units',
                            exportOptions: {
                                //orthogonal: 'export',
                                columns: [ 1, 2, 3, 4, 5, 6, 7 ]
                            }
                        }
                    ],
                    stateSaveCallback: function (settings, data) {
                        $rootScope.units.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.units.state.data)
                            return $rootScope.units.state.data;
                        else
                            return null;
                    },
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.systemid);
                        //$(row).on('click', singleSelectionRowClick);
                    },
                    "columns": [
                        {
                            "data": null,
                            "width": "20px",
                            "defaultContent": '',
                            "sortable": false,
                            "class": "details closed",
                            save: false
                        },
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
                            "data": null,
                            save: false,
                            "render": function (data, type, full, meta) {
                                return $scope.uTypes[data.type];
                            }
                        },
                        {
                            "data": "parentName",
                            save: false
                        },
                        {
                            "data": "defaultcurrency",
                            save: true,
                            name: "currency"
                        },
                        {
                            /*
                             "data": "hasstp",
                             save: true,
                             name: "stp"
                             */
                            "data": null,
                            save: true,
                            name: "stp",
                            "render": function (data, type, full, meta) {
                                return data.type == 0 ? data.hasstp : '-';
                            }

                        },
                        {
                            "data": "timezone",
                            "class": "timezone",
                            save: true,
                            name: "timezone"
                        },
                        {
                            "data": "marketstatus",
                            save: true,
                            name: "marketstatus"
                        },
                        {
                            "data": "closed",
                            save: true,
                            name: "closed"
                        },
                        {
                            "data": null,
                            "sortable": false,
                            "class": "actions",
                            save: false,
                            "render": function (data, type, full, meta) {
                                var access = $rootScope.access.units;
                                return $.fn.actionList(
                                    {
                                        id: data.systemid,
                                        items: [
                                            {
                                                title: "Edit",
                                                action: "Edit",
                                                access: access.Edit,
                                                class: 'edit-link text-bold'
                                            },
                                            {
                                                title: "Settings",
                                                action: "Settings",
                                                access: access.Settings,
                                                class: 'settings-link'
                                            },
                                            {
                                                type: "divider"
                                            },
                                            {
                                                title: "Exposure",
                                                action: "Exposure",
                                                access: access.Exposure
                                            },
                                            {
                                                type: "submenu",
                                                title: "Reports",
                                                class: "open-left",
                                                items: [
                                                    {
                                                        title: "Business Report",
                                                        action: "Business Report",
                                                        access: access.Reports
                                                    },
                                                    {
                                                        title: "Daily Volume Report",
                                                        action: "Daily Volume Report",
                                                        access: access.Reports
                                                    },
                                                    {
                                                        title: "Rate Shift Report",
                                                        action: "Rate Shift Report",
                                                        access: access.Reports
                                                    }
                                                ]
                                            },
                                            /*{
                                                title: "Delete",
                                                action: "Delete",
                                                access: access.Delete,
                                                class: 'delete-link'
                                            },*/
                                            {
                                                title: "Create demo users",
                                                action: "Create demo users",
                                                access: !$rootScope.config.production
                                            }
                                        ]

                                    }).html();

                            }
                        }
                    ]
                }
            };

            formatSubTable = function (data) {
                var url = data.url == null ? '-' :
                '<a target="_blank" href="' + data.url + '">' + data.url + '</a>';
                var result = '<div class="table-slider">' +
                    '<dl class="dl-horizontal table-info">' +
                    '<dt>Description</dt>' +
                    '<dd>' + data.description + '</dd>' +
                    '<dt>URL</dt>' +
                    '<dd>' + url + '</dd>' +
                    '</dl></div>';
                return result;
            };

            function needApplyExternalFilter() {
                return ($rootScope.units.state.externalFilter.name &&
                (!$rootScope.units.state.externalFilter.applied));
            }


            $scope.afterTableCreated = function () {
                var table = $('#table').DataTable();
                assignFilters('#table');
                $('#table tbody').on('click', '.actions', function () {
                    var row = $(this).parent();
                    singleSelectionRow(row);
                });

                $('#table tbody').on('click', 'td:not(.actions)', function () {
                    var row = $(this).parent();
                    if ($(row).hasClass('table-info')) return;
                    singleSelectionRow(row);
                    var datarow = table.row(row);
                    var data = datarow.data();
                    var detailsCell = $(row.children('.details'));
                    if (!data) return;
                    if (datarow.child.isShown()) {
                        $('.table-slider', datarow.child()).slideUp(function () {
                            datarow.child.hide();
                            $(row).removeClass('shown');
                            $(detailsCell).toggleClass('opened closed');
                        });
                    }
                    else {
                        datarow.child(formatSubTable(data), 'table-info no-padding').show();
                        $(row).addClass('shown');
                        $('.table-slider', datarow.child()).slideDown();
                        $(detailsCell).toggleClass('opened closed');
                    }

                });
                var colSel = new $.fn.colSel(table, {
                    visObject: tableProperties.Columns,
                    saveFunc: $rootScope.saveTableProperties
                });
                $(colSel).appendTo('#rigth-group');
                $('#page-wrapper').addClass('page-animation');
                setTableActionsPosHandler('table');
                if (needApplyExternalFilter()) {
                    $rootScope.units.state.externalFilter.applied = true;
                    clearState(table, $rootScope.units.state);
                    setFilterValue(table, $rootScope.units.state, 1,
                        $rootScope.units.state.externalFilter.name, true);
                    //$rootScope.accounts.state.nameFilter = undefined;
                    saveState('#table', $rootScope.units.state);
                    table.draw();
                }
                else
                    restoreState(table, $rootScope.units.state, true, true);

                var buttons = $scope.table.buttons().container().find('.btn');
                $('a.export-placeholder').replaceWith(buttons);
            };

            $scope.clearExternalFilter = function () {
                $rootScope.units.state.externalFilter.applied = false;
                $rootScope.units.state.externalFilter.name = undefined;
                $scope.clearAllFilters();
            }

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.units.state);
                table.draw();
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
                    case 'BUSINESS REPORT':
                        $scope.BusinessReport(id);
                        break;
                    case 'TRADING VOLUME REPORT':
                        $scope.VolumeReport(id);
                        break;
                    case "DAILY VOLUME REPORT":
                        $scope.DailyVolumeReport(id);
                        break;
                    case "RATE SHIFT REPORT":
                        $scope.RateShiftReport(id);
                        break;
                    /*
                     case 'AUDIT':
                     $scope.goAudit(id);
                     break;
                     */
                    case 'DELETE':
                        $scope.deleteDialog(id);
                        break;
                    case 'CREATE DEMO USERS':
                        $scope.createDemoUsersDialog(id);
                        break;
                }
            };

            $scope.BusinessReport = function (id) {
                var unit = getItem(id);
                // basic authentication in url:
                var url;
                if (reportsurl.startsWith('https://')) {
                    url = 'https://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(8);
                } else {
                    url = 'http://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(7);
                }
                url = surl + '/businessreport?unitname='+unit.name;
                openInNewTab(url);
            };

            $scope.VolumeReport = function (id) {
                // not used ???
                // basic authentication in url:
                var url;
                if (reportsurl.startsWith('https://')) {
                    url = 'https://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(8);
                } else {
                    url = 'http://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(7);
                }
                url = url + '/TradingVolumesForm.jsp?unitsystemid=' + id;
                openInNewTab(url);
            };

            $scope.DailyVolumeReport = function (id) {
                var unit = getItem(id);
                // basic authentication in url:
                var url;
                if (reportsurl.startsWith('https://')) {
                    url = 'https://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(8);
                } else {
                    url = 'http://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(7);
                }
                url = url + '/dailytradingvolumeunit?unitname=' + unit.name;
                openInNewTab(url);
            };

            $scope.RateShiftReport = function (id) {
                var unit = getItem(id);
                // basic authentication in url:
                var url;
                if (reportsurl.startsWith('https://')) {
                    url = 'https://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(8);
                } else {
                    url = 'http://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(7);
                }
                url = url + '/rateshift?unitname=' + unit.name;
                openInNewTab(url);
            };

            function getItem(id) {
                return $rootScope.units.getById(id);
            }

            $scope.createDemoUsersDialog = function (id) {
                $scope.parentsystemid = id;
                setFocusOnModalWindow('createDemoUsers', 'loginname');
                $("#createDemoUsers").modal()
            }

            $scope.deleteDialog = function (id) {
                beforeDialog($scope);
                $scope.unit = $.extend({}, getItem(id));
                $scope.delete = {
                    systemid: $scope.unit.systemid,
                    title: 'unit ' + $scope.unit.name,
                };
                $scope.$apply();
                $('#delete').modal();
            };

            $scope.deleteItem = function () {
                $scope.context.inprogress = true;
                api.deleteUnit($scope.unit.systemid, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            var id = $scope.unit.systemid;
                            $scope.context.inprogress = false;
                            $('#delete').modal('hide');
                            $rootScope.units.remove(id);
                            var tr = $('#table').DataTable().row('#' + id);
                            tr.remove().draw();
                        }
                    }
                ));
            };

            $scope.goSettings = function (id) {
                var item = getItem(id);
                $rootScope.settingsInfoStack.clear();
                $rootScope.settingsInfoStack.push("unit",
                    item.systemid, item.name);
                $('#settings').modal();
                angular.element($('#settings')).scope().init();
            };

            $scope.goAudit = function (id) {
                var url = '/tradeaudit?tradeid='+id
                openInNewTab(reportsurl + url);
            };

            $scope.exposureDialog = function (id) {
                var item = getItem(id);
                var title = 'unit ' + item.name;
                $('#exposure').modal();
                api.getExposure(item.systemid, title, 'units', $scope);
            };

            $scope.editDialog = function (id) {
                $scope.unit = $.extend({}, getItem(id));
                modal.showEditUnitDialog($scope);
            };

            $scope.createDialog = function () {
                $scope.submitUnit = $scope.createUnit;
                $scope.unit = $rootScope.units.getEmpty();
                modal.showCreateUnitDialog($scope);
            };

            $scope.updateUnit = function () {
                $scope.context.inprogress = true;
                var id = $scope.unit.systemid;
                api.updateUnit($scope.unit, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            api.getUnit(id, angular.extend(errorHandler($scope),
                                {
                                    ok: function (response) {
                                        $rootScope.units.update(id, response.data.payload[0]);
                                        var tr = $('#table').DataTable().row('#' + id);
                                        if (tr.child.isShown()) {
                                            tr.child.hide();
                                        }
                                        $rootScope.units.fillParents();
                                        var unit = getItem(id);
                                        tr.data(unit).draw();
                                        //$scope.context.inprogress = false;
                                        $('#editUnit').modal('hide');
                                    }
                                }
                            ));
                        }
                    }
                ));
            };

            $scope.createUnit = function () {
                $scope.context.inprogress = true;
                api.createUnit($scope.unit, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            var id = response.data.payload[0].systemid;
                            api.getUnit(id, angular.extend(errorHandler($scope),
                                {
                                    ok: function (response) {
                                        $scope.context.inprogress = false;
                                        $('#createUnit').modal('hide');
                                        addRow(response, $rootScope.units.data,
                                            function () {
                                                $rootScope.units.fillParents();
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
                $rootScope.units.upToDate = false;
                $rootScope.updateUnits()
                    .then(function () {
                        $('#table_processing').css('display', 'none');
                    })
            }

            $rootScope.activePage = "units";
            $rootScope.init().then(function () {
                $rootScope.updateUnits()
                    .then(function () {
                        $rootScope.updateSettingList($rootScope.units);
                        $scope.createTable();
                        $scope.$broadcast('dataloaded');
                        $timeout(function () {
                            var table = $('#table').DataTable();
                            table.columns.adjust().draw();
                        }, 0);
                    })
            })
            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.units.state);
            });

        }
    ])
;


