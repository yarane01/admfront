"use strict";

angular
    .module('portal')
    .controller('RiskManagementBlotterCtrl', RiskManagementBlotterCtrl);

function RiskManagementBlotterCtrl($scope, $rootScope, $timeout, RiskManagementService) {

    var SETTINGS_ITEM_NAME = 'portal.riskmanagement.blotter.settings';

    $scope.context = {
        dataloaded: false,
        firsttimeload: true
    };

    $scope.tableProperties = tableProperties.riskmanagement_blotter;

    $scope.settings = JSON.parse(localStorage.getItem(SETTINGS_ITEM_NAME));

    if (!$scope.settings)
        $scope.settings = {
            highlightLevel: 0
        };

    $scope.showSettingsDialog = function() {
        if (!$scope.table) return;

        $scope.columnSettings = getColumnSettingsForDialog($scope.table, $scope.tableProperties);

        $('#blotterSettingsDialog').modal();
    };

    $scope.processSettingsDialog = function(){
        localStorage.setItem(SETTINGS_ITEM_NAME, JSON.stringify($scope.settings));

        applySettings($scope);

        $('#blotterSettingsDialog').modal('hide');
    };

    $scope.tableSize = '57vh';

    $scope.clearFilter = function() {
        $('#blottersearch').val('');

        $scope.table.search('').draw();
    };

    $scope.afterTableCreated = function () {
        $timeout(function () {
            $scope.table.columns.adjust().draw();

            var filterfield =  $('#blotterfilter');

            filterfield.val($scope.tableProperties.filter);

            filterfield.keyup( function() {
                $scope.table.search(filterfield.val()).draw();
            } );

            var buttons = $scope.table.buttons().container().find('.btn');

            $('#blotter-panel-title').find('.export-placeholder').after(buttons);//replaceWith(buttons);
        }, 0);
    };

    $scope.Maximize = function () {
        $scope.tableSize = '85vh';
        prepareTable();
        $scope.$broadcast('dataloaded');
    };

    $scope.Minimize = function () {
        $scope.tableSize = '57vh';
        prepareTable();
        $scope.$broadcast('dataloaded');
    };

    function createData() {
        $scope.items = [];

        RiskManagementService.getBlotterItems().forEach(function (item) {

            $scope.items.push({
                Time: moment(item.tstamp),
                Instrument: item.symbol,
                Amount: item.amount,
                AvgRate: item.rate,
                Trader: item.trader,
                Exposure: item.position
            });
        });
    }

    function prepareTable() {
        var order = $scope.tableProperties.sort;

        if (order[0].length > 1)
            order = order[0];

        $scope.tableOptions = {
            data: $scope.items,
            order: order,
            scrollY: $scope.tableSize,
            paging: false,
            info: false,
            destroy: true,
            dom: 't',
            search: {
                search: $scope.tableProperties.filter
            },
            stateSave: true,
            buttons: [
                {
                    extend: 'csvHtml5',
                    text: '<i class="fa fa-file-text-o"></i>',
                    titleAttr: 'Export to CSV',
                    title: 'Blotter',
                    exportOptions: { orthogonal: 'export' }
                }
            ],
            stateSaveCallback: function (settings, data) {
                saveTableState($scope.table, $scope.tableProperties);
            },
            stateLoadCallback: function (settings, data) {

            },

            createdRow: function ( row, data, index ) {

                if ((data.Amount >= 0))
                    $('td.amount-column', row).addClass('positivevalue');
                else
                    $('td.amount-column', row).addClass('negativevalue');

                if (data.Exposure >= 0)
                    $('td.exposure-column', row).addClass('positivevalue');
                else
                    $('td.exposure-column', row).addClass('negativevalue');

                if (($scope.settings.highlightLevel > 0) && (Math.abs(data.Amount * data.AvgRate) >= $scope.settings.highlightLevel))
                    $('td', row).addClass('highlight');
            },

            columns: [
                {
                    data: "Time",
                    name: "Time",
                    class: "font-bold",
                    searchable: false,
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Time"),
                    render: function (data, type, row, meta) {
                        if (type == 'display')
                            return data.format('hh:mm:ss');

                        return data;
                    }
                },
                {
                    data: "Instrument"
                },
                {
                    data: "Amount",
                    name: "Amount",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Amount"),
                    searchable: false,
                    class: "dt-right amount-column",
                    render: function (data, type, row, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        if (type == 'sort')
                            return Math.abs(data);

                        return data;
                    }
                },
                {
                    data: "AvgRate",
                    name: "AvgRate",
                    class: "dt-right",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "AvgRate"),
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            return RiskManagementService.formatRate(data, full.Instrument);

                        return data;
                    }
                },
                {
                    data: "Trader",
                    name: "Trader",
                    save: true,
                    class: "dt-right",
                    visible: getColumnVisible($scope.tableProperties, "Trader")
                },
                {
                    data: "Exposure",
                    name: "Exposure",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Exposure"),
                    searchable: false,
                    class: "dt-right exposure-column",
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        return data;
                    }
                }
            ]
        };
    }

    function update(requestResult) {
        processUpdate(requestResult, $scope, createData, prepareTable);
    }

    var listener1 = $rootScope.$on("blotterloading", function (event, args) {
        $scope.context.dataloaded = false;
    });

    var listener2 = $rootScope.$on("blotterloaded", function (event, args) {
        update(args);
        $scope.context.firsttimeload = false;
    });

    $scope.$on('$destroy', function() {
        listener1();
        listener2();
    });
}