angular
    .module('portal')
    .controller('RiskManagementPLCtrl', RiskManagementPLCtrl);

function RiskManagementPLCtrl($scope, $rootScope, $timeout, RiskManagementService) {

    $scope.context = {
        dataloaded: false,
        firsttimeload: true
    };

    $scope.tableProperties = tableProperties.riskmanagement_pl;

    $scope.showSettingsDialog = function() {
        if (!$scope.table) return;

        $scope.columnSettings = getColumnSettingsForDialog($scope.table, $scope.tableProperties);

        $('#plSettingsDialog').modal();
    };

    $scope.processSettingsDialog = function(){
        applySettings($scope);

        $('#plSettingsDialog').modal('hide');
    };

    $scope.tableSize = '20vh';

    $scope.clearFilter = function() {
        $('#plfilter').val('');

        $scope.table.search('').draw();
    };

    $scope.afterTableCreated = function () {
        $timeout(function () {
            $scope.table.columns.adjust().draw();

            var searchfield =  $('#plfilter');

            searchfield.val($scope.tableProperties.filter);

            searchfield.keyup( function() {
                $scope.table.search(searchfield.val()).draw();
            } );

            var buttons = $scope.table.buttons().container().find('.btn');

            $('#pl-panel-title').find('.export-placeholder').after(buttons);//replaceWith(buttons);
        }, 0);
    };

    $scope.Maximize = function () {
        $scope.tableSize = '85vh';
        prepareTable();
        $scope.$broadcast('dataloaded');
    };

    $scope.Minimize = function () {
        $scope.tableSize = '20vh';
        prepareTable();
        $scope.$broadcast('dataloaded');
    };

    function createData() {
        $scope.items = RiskManagementService.getPlItems();
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
                    title: 'PL',
                    exportOptions: { orthogonal: 'export' }
                }
            ],
            stateSaveCallback: function (settings, data) {
                saveTableState($scope.table, $scope.tableProperties);
            },
            stateLoadCallback: function (settings, data) {

            },
            createdRow: function ( row, data, index ) {

                if (data.Bbook >= 0)
                    $('td.bbook-column', row).addClass('positivevalue');
                else
                    $('td.bbook-column', row).addClass('negativevalue');

                if (data.Abook >= 0)
                    $('td.abook-column', row).addClass('positivevalue');
                else
                    $('td.abook-column', row).addClass('negativevalue')

                if (data.PL >= 0)
                    $('td.pl-column', row).addClass('positivevalue');
                else
                    $('td.pl-column', row).addClass('negativevalue');

                if (data.BbookMonth >= 0)
                    $('td.bbookmonth-column', row).addClass('positivevalue');
                else
                    $('td.bbookmonth-column', row).addClass('negativevalue');

                if (data.AbookMonth >= 0)
                    $('td.abookmonth-column', row).addClass('positivevalue');
                else
                    $('td.abookmonth-column', row).addClass('negativevalue');

                if (data.PLMonth >= 0)
                    $('td.plmonth-column', row).addClass('positivevalue');
                else
                    $('td.plmonth-column', row).addClass('negativevalue');
            },

            columns: [
                {
                    data: "Instrument",
                    class: "font-bold"
                },
                {
                    name: "Bbook",
                    data: "Bbook",
                    class: "dt-right bbook-column",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Bbook"),
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        if (type == 'sort')
                            return Math.abs(data);

                        return data;
                    }
                },
                {
                    name: "Abook",
                    data: "Abook",
                    class: "dt-right abook-column",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Abook"),
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        if (type == 'sort')
                            return Math.abs(data);

                        return data;
                    }
                },
                {
                    name: "PL",
                    data: "PL",
                    class: "dt-right pl-column",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "PL"),
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        if (type == 'sort')
                            return Math.abs(data);

                        return data;
                    }
                },
                {
                    name: "BbookMonth",
                    data: "BbookMonth",
                    class: "dt-right bbookmonth-column",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "BbookMonth"),
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        if (type == 'sort')
                            return Math.abs(data);

                        return data;
                    }
                },
                {
                    name: "AbookMonth",
                    data: "AbookMonth",
                    class: "dt-right abookmonth-column",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "AbookMonth"),
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            return formatInteger(data);

                        if (type == 'sort')
                            return Math.abs(data);

                        return data;
                    }
                },
                {
                    name: "PLMonth",
                    data: "PLMonth",
                    class: "dt-right plmonth-column",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "PLMonth"),
                    searchable: false,
                    render: function (data, type, full, meta) {
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

    var listener1 = $rootScope.$on("plloading", function (event, args) {
        $scope.context.dataloaded = false;
    });

    var listener2 = $rootScope.$on("plloaded", function (event, args) {
        update(args);
        $scope.context.firsttimeload = false;
    });

    $scope.$on('$destroy', function() {
        listener1();
        listener2();
    });
}
