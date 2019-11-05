angular
    .module('portal')
    .controller('RiskManagementBbookUSDCtrl', RiskManagementBbookUSDCtrl);

function RiskManagementBbookUSDCtrl($scope, $rootScope, RiskManagementService, $timeout) {

    $scope.context = {
        dataloaded: false,
        firsttimeload: true
    };

    $scope.tableSize = '20vh';
    $scope.tableProperties = tableProperties.riskmanagement_bbookusd;

    $scope.clearFilter = function() {
        $('#bbookusdfilter').val('');

        $scope.table.search('').draw();
    };

    $scope.afterTableCreated = function () {
        $timeout(function () {
            $scope.table.columns.adjust().draw();

            var searchfield =  $('#bbookusdfilter');

            searchfield.val($scope.tableProperties.filter);

            searchfield.keyup( function() {
                $scope.table.search(searchfield.val()).draw();
            } );

            var buttons = $scope.table.buttons().container().find('.btn');

            $('#bbookusd-panel-title').find('.export-placeholder').after(buttons);//replaceWith(buttons);
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
        $scope.items = [];

        RiskManagementService.getTotalItems().forEach(function (totalItem) {

            if (totalItem.source == 'Sum') {
                $scope.items.push({
                    Instrument: totalItem.symbol,
                    Rate: totalItem.rate,
                    Bbook: totalItem.amount
                });
            }
        });

        RiskManagementService.getABookItems().forEach(function (aBookItem) {

            if (aBookItem.source == 'Sum') {

                var itemFound = false;

                $scope.items.forEach(function (item) {

                    if (aBookItem.symbol == item.Instrument) {
                        itemFound = true;
                        item.Bbook -= aBookItem.amount;
                    }
                });

                if (!itemFound){
                    $scope.items.push({
                        Instrument: aBookItem.symbol,
                        Rate: aBookItem.rate,
                        Bbook: -aBookItem.amount
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
                    title: 'B-book (USD Based)',
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
            },
            columns: [
                {
                    data: "Instrument",
                    class: "font-bold"
                },
                {
                    data: "Rate",
                    class: "dt-right",
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            return RiskManagementService.formatRate(data, full.Instrument);

                        return data;
                    }
                },
                {
                    data: "Bbook",
                    class: "dt-right bbook-column",
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
