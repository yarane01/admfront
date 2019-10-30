//function formatFloat(value, precision) {
//    if (value != undefined) {
//        if (precision === undefined)
//            precision = 4;
//
//        var power = Math.pow(10, precision);
//        return Number(Math.round((value * power).toFixed(precision + 1)) / power).toLocaleString();
//    }
//    else
//        return '';
//}

var REFRESH_INTERVAL = 10000;
var REQUEST_TIMEOUT = 120000;

function formatInteger(value) {
    if (value == null)
        return '';

    return Number(value).toLocaleString();
}

function getDecimalSeparator() {
    var n = 1.1;
    n = n.toLocaleString().substring(1, 2);
    return n;
}

var decimalSeparator = getDecimalSeparator();

function formatFloat(value, afterpoint) {
    if (value == null)
        return '';

    if (value == 0)
        return '0';

    if (afterpoint == 0)
        return Math.round(value);

    if (afterpoint == null)
        afterpoint = 5;

    var nbDec = Math.pow(10, afterpoint);
    var a = Math.abs(value);
    var e = Math.floor(a);
    var d = Math.round((a-e)*nbDec); if (d == nbDec) { d=0; e++; }
    var signStr = (value<0) ? "-" : " ";
    var decStr = d.toString(); var tmp = 10; while(tmp<nbDec && d*tmp < nbDec) {decStr = "0"+decStr; tmp*=10;}
    var eStr = e.toString();

    return signStr + formatInteger(eStr) + decimalSeparator + decStr;
}

function getColumnVisible(storage, name) {
    if (!storage.columnVisibility)
        return true;

    return storage.columnVisibility[name];
}

function getColumnSettingsForDialog(table, storage) {
    var result = [];

    var tableHeaders = table.columns().header();

    for (var i = 0; i < tableHeaders.length; i++) {

        var column = table.init().columns[i];
        if (!column.save)
            continue;

        result.push(
            {
                name: column.name,
                visible: getColumnVisible(storage, column.name),
                caption: $(tableHeaders[i]).text()
            });
    }

    return result;
}

function saveTableState(table, properties) {
    if (!table) return;

    var order = table.state().order;

    if (order[0].length > 1)
        properties.sort = order[0];
    else
        properties.sort = order;

    properties.filter = table.state().search.search;

    //$rootScope.saveTableProperties();
}

function applySettings(scope) {
    scope.columnSettings.forEach(function(item) {
        scope.tableProperties.columnVisibility[item.name] = item.visible;
    });

    for (var i = 0; i < scope.table.columns().header().length; i++) {
        var column = scope.table.init().columns[i];
        if (column.name)
            scope.table.columns(i).visible(scope.tableProperties.columnVisibility[column.name], false);
    }

    scope.table.columns.adjust().draw(false);
}

function processUpdate(requestResult, scope, createDataFunc, prepareTableFunc) {
    scope.context.dataerror = requestResult.dataerror;
    scope.context.errormessage = requestResult.errormessage;

    if (!scope.context.dataerror)
    {
        var prevItemsCount;
        if (scope.items)
            prevItemsCount = scope.items.length;
        else
            prevItemsCount = 0;

        createDataFunc();

        if (scope.table == undefined) {
            prepareTableFunc();
            scope.$broadcast('dataloaded');
        }
        else {
            if (prevItemsCount > 0) {
                scope.table.clear().rows.add(scope.items).draw(false);
                scope.context.dataloaded = true;
            }
            else
                scope.$broadcast('dataloaded');
        }
    }
    else
        scope.context.dataloaded = true;
}

angular
    .module('portal')
    .controller('RiskManagementCtrl', RiskManagementCtrl);

function RiskManagementCtrl($scope, $rootScope, RiskManagementService, $timeout, $interval) {
    $rootScope.activePage = "riskmanagement";

    var selectedUnit = localStorage.getItem("riskmanagement.selectedUnit");

    if (selectedUnit)
        $scope.selectedUnit = +selectedUnit;
    else
        $scope.selectedUnit = -1;

    $scope.selectableUnits = [ {name: 'All', systemid: -1} ];

    $rootScope.units.data.forEach(function(unit) {
        $scope.selectableUnits.push(unit);
    });

    $scope.unitSelected = function() {
        RiskManagementService.setSelectedUnit($scope.selectedUnit);
    };

    $timeout(function () {
        RiskManagementService.Refresh();
    }, 0);

    var interval;

    interval = $interval(function() {
        RiskManagementService.Refresh();
    }, REFRESH_INTERVAL);

    function saveLayout(localStorageName) {
        var layout = {
            version: 4,
            items: []
        };

        var rows = $('#layout' + ' .row');

        rows.each(function(rowindex, row) {
            layout.items.push([]);

            var columns = $(row).find('.column');

            columns.each(function(columnindex, column) {
                layout.items[rowindex].push([]);

                var panels = $(column).find('.riskmanagement-panel');

                panels.each(function(panelindex, panel) {
                    layout.items[rowindex][columnindex].push($(panel).attr('data-inner-id'));
                });
            }) ;
        });

        localStorage.setItem(localStorageName, JSON.stringify(layout));
    }

    $scope.$on('$destroy', function() {
        $interval.cancel(interval);

        localStorage.setItem("riskmanagement.selectedUnit", $scope.selectedUnit);

        $rootScope.saveTableProperties();

        saveLayout('portal.riskmanagementlayout');
    });
}