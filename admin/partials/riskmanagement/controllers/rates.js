"use strict";

angular
    .module('portal')
    .controller('RiskManagementRatesCtrl', RiskManagementRatesCtrl);

function RiskManagementRatesCtrl($scope, $rootScope, $timeout, RiskManagementService, $http) {

    $scope.context = {
        dataloaded: false,
        firsttimeload: true
    };

    $scope.tableProperties = tableProperties.riskmanagement_rates;

    $scope.showSettingsDialog = function() {
        if (!$scope.table) return;

        $scope.columnSettings = getColumnSettingsForDialog($scope.table, $scope.tableProperties);

        $('#ratesSettingsDialog').modal();
    };

    $scope.processSettingsDialog = function(){
        applySettings($scope);

        $('#ratesSettingsDialog').modal('hide');
    };

    $scope.processAddQuoteDialog = function(){
        $('#ratesAddQuoteDialog').data('bs.modal').options.backdrop = 'static';

        $scope.processing = true;
        $scope.errorMessage = null;

        $scope.addQuote.author = $rootScope.portalUser.username;

        var req = {
            method: 'POST',
            url: stpapiurl + '/sendQuote',
            data: '[' + JSON.stringify($scope.addQuote) + ']'
        };

        $http(req).
            then(
                function (successResponse) {
                    if (successResponse.data.status == 'OK') {
                        $('#ratesAddQuoteDialog').modal('hide');
                    }
                    else {
                        $scope.processing = false;
                        $scope.errorMessage = 'Error: ' + successResponse.data.payload[0];
                        $('#ratesAddQuoteDialog').data('bs.modal').options.backdrop = true;
                    }
                },
                function (errorResponse) {
                    $scope.processing = false;
                    $scope.errorMessage = 'Error: ' + errorResponse.data.payload[0];
                    $('#ratesAddQuoteDialog').data('bs.modal').options.backdrop = true;
                }
            )
            .catch(function (response) {
                $scope.processing = false;
                $scope.errorMessage = 'Error adding quote';
                $('#ratesAddQuoteDialog').data('bs.modal').options.backdrop = true;
            });
    };

    $scope.tableSize = '20vh';

    $scope.clearFilter = function() {
        $('#ratesfilter').val('');

        $scope.table.search('').draw();
    };

    $scope.afterTableCreated = function () {
        $timeout(function () {
            $scope.table.columns.adjust().draw();

            var filterfield = $('#ratesfilter');

            filterfield.val($scope.tableProperties.filter);

            filterfield.keyup( function() {
                $scope.table.search(filterfield.val()).draw();
            } );

            var buttons = $scope.table.buttons().container().find('.btn');

            $('#rates-panel-title').find('.export-placeholder').after(buttons);
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

        Object.keys($rootScope.symbols).forEach(function(item) {
           var data = $rootScope.symbols[item][$rootScope.symbols[item].last];

           $scope.items.push(
                {
                    Instrument: item,
                    Quote: $rootScope.symbols[item][$rootScope.symbols[item].last],
                    Provider: $rootScope.symbols[item].last
                }
           );
        });
    }

    function prepareTable() {
        var order = $scope.tableProperties.sort;

        if (order[0].length > 1)
            order = order[0];

        $scope.tableOptions = {
            name: "riskmanagement_rates",
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
                    title: 'Rates',
                    exportOptions: { orthogonal: 'export' }
                }
            ],
            stateSaveCallback: function (settings, data) {
                saveTableState($scope.table, $scope.tableProperties);
            },
            stateLoadCallback: function (settings, data) {

            },
            createdRow: function ( row, data, index ) {
                if ((data.Quote.bidchange == "Up"))
                    $('td.bid-column', row).addClass('positivevalue');
                else if ((data.Quote.bidchange == "Down"))
                    $('td.bid-column', row).addClass('negativevalue');

                if (data.Quote.askchange == "Up")
                    $('td.ask-column', row).addClass('positivevalue');
                else if (data.Quote.askchange == "Down")
                    $('td.ask-column', row).addClass('negativevalue');
            },
            columns: [
                {
                    data: "Instrument",
                    class: "font-bold"
                },
                {
                    data: "Quote.updatedate",
                    name: "Time",
                    searchable: false,
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Time")
                    // render: function (data, type, row, meta) {
                    //     if (type == 'display')
                    //         return data.format('hh:mm:ss');
                    //
                    //     return data;
                    // }
                },
                {
                    data: "Quote.bid",
                    name: "Bid",
                    save: true,
                    class: "dt-right bid-column",
                    visible: getColumnVisible($scope.tableProperties, "Bid"),
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            //return RiskManagementService.formatRate(data, full.Instrument);
                            return data;

                        return +data;
                    }
                },
                {
                    data: "Quote.ask",
                    name: "Ask",
                    save: true,
                    class: "dt-right ask-column",
                    visible: getColumnVisible($scope.tableProperties, "Ask"),
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type == 'display')
                            //return RiskManagementService.formatRate(data, full.Instrument);
                            return data;

                        return +data;
                    }
                },
                {
                    data: "Provider",
                    name: "Provider",
                    class: "padded",
                    save: true,
                    visible: getColumnVisible($scope.tableProperties, "Provider")
                },
                {
                    data: null,
                    save: false,
                    searchable: false,
                    orderable: false,
                    render: function(data, type, full, meta){
                        return '<button type="button" class="btn btn-mini btn-default" ' +
                            'onclick="showAddQuoteDialog(\'' + data.Instrument +
                            '\')">Add Quote</button>';
                    }
                }
            ]
        };
    }

    function update() {
        processUpdate({dataerror: false}, $scope, createData, prepareTable);
    }

    var listener = $rootScope.$on("quotesupdated", function (event, args) {
        update();
    });

    $scope.$on('$destroy', function() {
        listener();
    });
}

function showAddQuoteDialog(instrumentName) {
    var scope = angular.element('[ng-controller=RiskManagementRatesCtrl]').scope();

    scope.processing = false;
    scope.errorMessage = null;

    var data = null;

    for (var i = 0; i < scope.items.length; i++) {
        if (scope.items[i].Instrument == instrumentName) {
            data = scope.items[i];
            break;
        }
    }

    if (!data) return;

    var instrument = scope.$root.instruments.getByName(instrumentName);

    var step;

    if (instrument != undefined)
        step = instrument.round;
    else
        step = 4;

    scope.addQuote = {
        symbol: data.Instrument,
        bid: +data.Quote.bid,
        ask: +data.Quote.ask,
        step: 1/Math.pow(10, step)
    };

    scope.$apply();

    $('#ratesAddQuoteDialog').modal();
}