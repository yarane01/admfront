var tradeSubscriptionsControllers = angular.module('tradeSubscriptionsControllers', []);

tradeSubscriptionsControllers.controller('TradeSubscriptionsCtrl',
    ['$q', '$rootScope', '$scope', '$http', '$route', 'api', '$timeout', 'SubscriptionService',
        function ($q, $rootScope, $scope, $http, $route, api, $timeout, SubscriptionService) {
            $scope.tradeSubscriptions = null;
            $rootScope.activePage = "tradeSubscriptions";
            $scope.selected = [];

            $scope.context = {
                showHistory: false
            }

            $scope.createTable = function () {
                $scope.tableOptions = {
                    "data": $rootScope.tradeSubscriptions.data,
                    "order": [[0, 'asc']],
                    "dom": "<'row'<'col-sm-6'i>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i>>",
                    "scrollY": calcDataTableHeight(),
                    "scrollX": true,
                    "paging": true,
                    "pageLength": 15,
                    "dom": "<'row'<'col-sm-6'i>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    "processing": false,
                    "language": {
                        "processing": "Loading..."
                    },
                    "autoWidth": true,
                    "stateSave": true,
                    "name": "tradeSubscriptions",
                    buttons: [{
                        extend: 'csvHtml5',
                        text: "Export to CSV",
                        title: 'Trade Subscriptions',
                        exportOptions: {
                            columns: [0, 1]
                        }
                    }],
                    stateSaveCallback: function (settings, data) {
                        $rootScope.tradeSubscriptions.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.tradeSubscriptions.state.data) {
                            return $rootScope.tradeSubscriptions.state.data;
                        } else {
                            return null;
                        }
                    },
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("level", data.level);
                        var tpCell = $('td:nth-child(5)', row);
                        tpCell.attr("monthlyOpenOrders", data.monthlyOpenOrders);
                        tpCell.tooltip({placement: "right", container: "#tradesubscriptionstable"});
                        $('td:not(.actions)', row).on('click', cellClick);
                    },
                    initComplete: function () {

                    },
                    "columns": [
                        {
                            "data": "level",
                            "name":"level",
                            save: false
                        },
                        {
                            "data": "monthlyOpenOrders",
                            "name":"monthlyOpenOrders",
                            save: false
                        },
                        {
                            "data": null,
                            "sortable": false,
                            save: false,
                            "class": "actions",
                            "render": function (data, type, full, meta) {
                                var access = $rootScope.access.tradeSubscriptions;

                                if (access.Edit()) {
                                    return $.fn.actionList({
                                            id: data.level,
                                            items: [{
                                                title: "Edit",
                                                action: "edittradesubscription",
                                                access: access.Edit,
                                                class: 'edit-link text-bold'
                                            },
                                            {
                                                title: "Delete",
                                                action: "deletetradesubscription",
                                                access: access.Edit
                                            }]
                                    }).html();
                                } else {
                                    return ""
                                } 
                            }
                        }
                    ]
                }
            };

            $scope.afterTableCreated = function () {
                var table = $('#tradesubscriptionstable').DataTable();
                assignFilters('#tradesubscriptionstable');

                $('#tradesubscriptionstable tbody').on('click', '.actions', function () {
                    var row = $(this).parent();
                    singleSelectionRow(row);
                });

                $('#tradesubscriptionstable tbody').on('click', 'td:not(.actions)', function () {
                    var row = $(this).parent();

                    if ($(row).hasClass('table-info')) {
                        return;
                    }

                    singleSelectionRow(row);

                    var datarow = table.row(row);
                    var data = datarow.data();
                    var detailsCell = $(row.children('.details'));

                    if (!data) {
                        return;
                    }

                    if (datarow.child.isShown()) {
                        $('.table-slider', datarow.child()).slideUp(function () {
                            datarow.child.hide();
                            $(row).removeClass('shown');
                            $(detailsCell).toggleClass('opened closed');
                        });
                    } else {
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

                if (needApplyExternalFilter()) {
                    $rootScope.tradeSubscriptions.state.externalFilter.applied = true;
                    clearState(table, $rootScope.tradeSubscriptions.state);
                    setFilterValue(table, $rootScope.tradeSubscriptions.state, 1,
                        $rootScope.tradeSubscriptions.state.externalFilter.name, false);
                    saveState('#tradesubscriptionstable', $rootScope.tradeSubscriptions.state);
                    table.ajax.reload();
                } else {
                    restoreState(table, $rootScope.tradeSubscriptions.state, true);
                }
            };

            $scope.clearAllFilters = function () {
                var table = $('#tradesubscriptionstable').DataTable();
                clearState(table, $rootScope.tradeSubscriptions.state);
                table.ajax.reload();
            }

            var cellClick = function () {
                var row = $(this).parent();

                if (!row.hasClass('disabled')) {
                    row.toggleClass('row-selected');
                }

                $scope.selected = getSelectedRows($('#tradesubscriptionstable'));
                $scope.$apply();
            };

            window.actionClick = function (link) {
                var action = $(link).data('action');
                var id = $(link).data('id');

                switch (action.toUpperCase()) {
                    case "EDITTRADESUBSCRIPTION":
                        $scope.editDialog(id);
                        break;
                    case "DELETETRADESUBSCRIPTION":
                        $scope.deleteTradeSubscription(id, true);
                        break;
                }
            };

            window.editClick = function (link) {
                $scope.editDialog($(link).data('id'));
            };

            $scope.createDialog = function () {
                $scope.tradeSubscription = $rootScope.tradeSubscriptions.getEmpty();

                beforeDialog($scope);
                setFocusOnModalWindow('createTradeSubscription', 'tradeSubscription-create');

                $('#createTradeSubscription').modal();
            };

            $scope.editDialog = function (id) {
                $scope.tradeSubscription = $.extend({}, $rootScope.tradeSubscriptions.getById(id));

                beforeDialog($scope);
                setFocusOnModalWindow('editTradeSubscription', 'tradeSubscription-edit');

                $scope.$apply();
                $('#editTradeSubscription').modal();
            };

            $scope.createTradeSubscription = function () {
                $.ajax(apiurl + '/tradeSubscriptions', {
                    data: "{\"monthlyOpenOrders\":\"" + $scope.tradeSubscription.monthlyOpenOrders + "\",\"subscriptionId\":\"" + $scope.tradeSubscription.level + "\"}",
                    contentType: 'application/json',
                    type: 'POST'
                }).done(function () {
                    $rootScope.updateTradeSubscriptions().then(function () {
                        $("#createTradeSubscription").modal('hide').on('hidden.bs.modal',
                            function () {
                                $scope.Refresh();
                            }
                        );
                    });
                }).error(function () {
                    alert("Received error while creating trading subscription level.");
                });
            };

            $scope.updateTradeSubscription = function () {
                $.ajax(apiurl + '/tradeSubscriptions/' + $scope.tradeSubscription.level, {
                    data: "{\"monthlyOpenOrders\":\"" + $scope.tradeSubscription.monthlyOpenOrders + "\"}",
                    contentType: 'application/json',
                    type: 'PUT'
                }).done(function () {
                    $rootScope.updateTradeSubscriptions().then(function () {
                        $("#editTradeSubscription").modal('hide').on('hidden.bs.modal',
                            function () {
                                $scope.Refresh();
                            }
                        );
                    });
                }).error(function () {
                    alert("Received error while updating trading subscription level.");
                });
            };

            $scope.deleteTradeSubscription = function (id) {
                $.ajax(apiurl + '/tradeSubscriptions/' + id, {
                    data: [],
                    contentType: 'application/json',
                    type: 'DELETE'
                }).done(function () {
                    $rootScope.updateTradeSubscriptions().then(function () {
                        $scope.Refresh();
                    });
                }).error(function () {
                    alert("Received error while removing trading subscription level.");
                });
            };

            $scope.Refresh = function () {
                $rootScope.tradeSubscriptions.upToDate = false;
                $rootScope.updateTradeSubscriptions()
                    .then(function () {
                            $route.reload();
                    })
            };

            $rootScope.init()
                .then(function () {
                    $scope.createTable();
                    $scope.$broadcast('dataloaded');
                    $scope.context.dataloaded = true;
                    
                    $timeout(function () {
                        var table = $('#tradesubscriptionstable').DataTable();
                        table.columns.adjust().draw();
                    }, 0);

                    $rootScope.tradeSubscriptions.state.externalFilter.applied = false;
                    $rootScope.tradeSubscriptions.state.externalFilter.name = undefined;
                    
                    var table = $('#tradesubscriptionstable').DataTable();
                    clearState(table, $rootScope.tradeSubscriptions.state);
                    
                    table.draw();
                    table.columns.adjust().draw();
                })

            $scope.$on("$destroy", function () {
                saveState('#tradesubscriptionstable', $rootScope.tradeSubscriptions.state);
            });
        }
    ]
)