"use strict";

angular
    .module('portal')
    .controller('RiskManagementExposureCtrl', RiskManagementExposureCtrl);

function RiskManagementExposureCtrl($scope, $rootScope, RiskManagementService, $timeout) {

    $scope.context = {
        dataloaded: false,
        firsttimeload: true
    };

    $scope.tableProperties = tableProperties.riskmanagement_exposure;

    $scope.showSettingsDialog = function() {
        if (!$scope.table) return;

        $scope.columnSettings = getColumnSettingsForDialog($scope.table, $scope.tableProperties);

        $('#exposureSettingsDialog').modal();
    };

    $scope.processSettingsDialog = function(){
        applySettings($scope);

        $('#exposureSettingsDialog').modal('hide');
    };

    $scope.tableSize = '57vh';

    $scope.clearFilter = function() {
        $('#exposurefilter').val('');

        $scope.table.search('').draw();
    };

    $scope.afterTableCreated = function () {
        $timeout(function () {
            $scope.table.columns.adjust().draw();

            var searchfield =  $('#exposurefilter');

            searchfield.val($scope.tableProperties.filter);

            searchfield.keyup( function() {
                $scope.table.search(searchfield.val()).draw();
            } );

            var buttons = $scope.table.buttons().container().find('.btn');

            $('#exposure-panel-title').find('.export-placeholder').after(buttons);//replaceWith(buttons);
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

        RiskManagementService.getABookItems().forEach(function (item) {

            if (item.source == 'Original') {
                $scope.items.push({
                    Instrument: item.symbol,
                    Rate: item.rate,
                    Abook: item.amount,
                    Bbook: 0,
                    AplusB: item.amount
                });
            }
        });

        RiskManagementService.getTotalItems().forEach(function (totalItem) {

            if (totalItem.source == 'Original') {

                var itemFound = false;

                $scope.items.forEach(function (item) {

                    if (totalItem.symbol == item.Instrument) {
                        itemFound = true;
                        item.AplusB = totalItem.amount;
                        item.Bbook = totalItem.amount - item.Abook;
                    }
                });

                if (!itemFound){
                    $scope.items.push({
                        Instrument: totalItem.symbol,
                        Rate: totalItem.rate,
                        Abook: 0,
                        Bbook: totalItem.amount,
                        AplusB: totalItem.amount
                    });
                }
            }
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
            dom: 't', //to hide search field
            search: {
                search: $scope.tableProperties.filter
            },
            stateSave: true,
            buttons: [
                {
                    extend: 'csvHtml5',
                    text: '<i class="fa fa-file-text-o"></i>',
                    titleAttr: 'Export to CSV',
                    title: 'Exposure',
                    exportOptions: { orthogonal: 'export' }
                }
            ],
            stateSaveCallback: function (settings, data) {
                saveTableState($scope.table, $scope.tableProperties);
            },
            stateLoadCallback: function (settings, data) {

            },
            createdRow: function ( row, data, index ) {

                if (data.Abook >= 0)
                    $('td.abook-column', row).addClass('positivevalue');
                else
                    $('td.abook-column', row).addClass('negativevalue');

                if (data.Bbook >= 0)
                    $('td.bbook-column', row).addClass('positivevalue');
                else
                    $('td.bbook-column', row).addClass('negativevalue');

                if (data.AplusB >= 0)
                    $('td.aplusb-column', row).addClass('positivevalue');
                else
                    $('td.aplusb-column', row).addClass('negativevalue');
            },

            columns: [
                {
                    data: "Instrument",
                    class: "font-bold"
                },
                {
                    data: "Rate",
                    name: "Rate",
                    class: "dt-right",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Rate"),
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            return RiskManagementService.formatRate(data, full.Instrument);

                        return data;
                    }
                },
                {
                    data: "Bbook",
                    name: "Bbook",
                    class: "dt-right bbook-column",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Bbook"),
                    searchable: false,
                    render: function (data, type, row, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        if (type == 'sort')
                            return Math.abs(data);

                        return data;
                    }
                },
                {
                    data: "Abook",
                    name: "Abook",
                    class: "dt-right abook-column",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Abook"),
                    searchable: false,
                    render: function (data, type, row, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        if (type == 'sort')
                            return Math.abs(data);

                        return data;
                    }
                },
                {
                    data: "AplusB",
                    name: "AplusB",
                    class: "dt-right aplusb-column",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "AplusB"),
                    searchable: false,
                    render: function (data, type, row, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        if (type == 'sort')
                            return Math.abs(data);

                        return data;
                    }
                }
            ]
        };
    }

    function update(requestResult) {
        processUpdate(requestResult, $scope, createData, prepareTable);
    }

    var listener1 = $rootScope.$on("exposureloading", function (event, args) {
        $scope.context.dataloaded = false;
    });

    var listener2 = $rootScope.$on("exposureloaded", function (event, args) {
        update(args);
        $scope.context.firsttimeload = false;
    });

    $scope.$on('$destroy', function() {
        listener1();
        listener2();
    });
}
