angular
    .module('portal')
    .service('RiskManagementService', RiskManagementService);

function RiskManagementService($rootScope, $http, $q) {
    var runningRequests = {
        exposure: false,
        blotter: false,
        pl: false
    };

    var aBookItems = [];
    var totalItems = [];
    var plItems = [];
    var blotterItems = [];

    var plSummary = {};

    var currentNYDate = moment();

    var value = localStorage.getItem("riskmanagement.selectedUnit");

    if (value)
        selectedUnit = +value;
    else
        selectedUnit = -1;

    this.getABookItems = function() {
        return aBookItems;
    };

    this.getTotalItems = function() {
        return totalItems;
    };

    this.getPlItems = function() {
        return plItems;
    };

    this.getPlSummary = function() {
        return plSummary;
    };

    this.getBlotterItems = function() {
        return blotterItems;
    };

    this.getCurrentNYDate = function() {
        return currentNYDate;
    };

    this.Refresh = function () {
        load();
    };

    this.setSelectedUnit = function(unit) {
        selectedUnit = unit;
        load();
    };

    this.formatRate = function(value, instrumentName) {
        var afterpoint = 4;

        var instrument = $rootScope.instruments.getByName(instrumentName);

        if (instrument != undefined)
            afterpoint = instrument.round;

        return formatFloat(value, afterpoint);
    };

    function loadExposure() {
        if (runningRequests.exposure)
            return;

        runningRequests.exposure = true;

        $rootScope.$broadcast('exposureloading');

        aBookItems = [];
        totalItems = [];

        var requestResult = {
            errormessage: "",
            dataerror: false
        };

        var promises = [];

        if (selectedUnit == -1) {
            promises.push($http.get(stpapiurl + '/abookExposure', {timeout: REQUEST_TIMEOUT}));
            promises.push($http.get(stpapiurl + '/totalExposure', {timeout: REQUEST_TIMEOUT}));
        }
        else {
            promises.push($http.get(stpapiurl + '/abookExposure?' + JSON.stringify({unitId: selectedUnit}), {timeout: REQUEST_TIMEOUT}));
            promises.push($http.get(stpapiurl + '/totalExposure?' + JSON.stringify({unitId: selectedUnit}), {timeout: REQUEST_TIMEOUT}));
        }

        $q.all(promises)
            .then(function (result) {

                var aBookResp = result[0].data;
                var totalResp = result[1].data;

                if ((aBookResp.status == 'OK') && (totalResp.status == 'OK')) {
                    aBookResp.payload.forEach(function (item) {
                        item.amount = Math.round(item.amount);
                        aBookItems.push(item);
                    });

                    totalResp.payload.forEach(function (item) {
                        item.amount = Math.round(item.amount);
                        totalItems.push(item);
                    });
                }
                else {
                    requestResult.errormessage = 'Error loading data';
                    requestResult.dataerror = true;
                }

                $rootScope.$broadcast('exposureloaded', requestResult);
                runningRequests.exposure = false;
            },
            function (error) {
                requestResult.errormessage = 'Error loading data';
                requestResult.dataerror = true;

                $rootScope.$broadcast('exposureloaded', requestResult);
                runningRequests.exposure = false;
            }
        );
    }

    function loadBlotter() {
        if (runningRequests.blotter)
            return;

        runningRequests.blotter = true;

        $rootScope.$broadcast('blotterloading');

        blotterItems = [];

        var requestResult = {
            errormessage: "",
            dataerror: false
        };

        var url = apiurl + '/blotter';

        if (selectedUnit != -1) {
            url = url + '?' + JSON.stringify({unitId: selectedUnit});
        }

        $http.get(url, {timeout: REQUEST_TIMEOUT})
            .then(function (result) {

                var blotterResp = result.data;

                if (blotterResp.status == 'OK') {
                    blotterResp.payload[0].forEach(function (item) {
                        blotterItems.push(item);
                    });
                }
                else {
                    requestResult.errormessage = 'Error loading data';
                    requestResult.dataerror = true;
                }

                $rootScope.$broadcast('blotterloaded', requestResult);
                runningRequests.blotter = false;
            },
            function (error) {
                requestResult.errormessage = 'Error loading data';
                requestResult.dataerror = true;

                $rootScope.$broadcast('blotterloaded', requestResult);
                runningRequests.blotter = false;
            }
        );
    }

    function loadPL() {
        if (runningRequests.pl)
            return;

        runningRequests.pl = true;

        $rootScope.$broadcast('plloading');

        plItems = [];

        var requestResult = {
            errormessage: "",
            dataerror: false
        };

        var url = stpapiurl + '/profitLoss';

        if (selectedUnit != -1) {
            url = url + '?' + JSON.stringify({unitId: selectedUnit});
        }

        $http.get(url, {timeout: REQUEST_TIMEOUT})
            .then(function (result) {

                var plResp = result.data;

                if (plResp.status == 'OK') {
                    var newPlItems = [];

                    plResp.payload.forEach(function (plItem) {

                        var localItem = undefined;

                        newPlItems.forEach(function (item) {
                            if (plItem.symbol == item.Instrument)
                                localItem = item;
                        });

                        if (!localItem)
                            localItem = newPlItems[newPlItems.push({
                                Instrument: plItem.symbol,
                                Abook: 0,
                                Bbook: 0,
                                PL: 0,
                                AbookMonth: 0,
                                BbookMonth: 0,
                                PLMonth: 0
                            }) - 1];

                        if (plItem.calcPeriod == "ThisDay") {
                            if (plItem.calcBook == "a")
                                localItem.Abook = Math.round(plItem.amount);
                            else //if (plItem.calcBook == "total")
                                localItem.PL = Math.round(plItem.amount);

                            localItem.Bbook = localItem.PL - localItem.Abook;
                        }
                        else {
                            if (plItem.calcBook == "a")
                                localItem.AbookMonth = Math.round(plItem.amount);
                            else //if (plItem.calcBook == "total")
                                localItem.PLMonth = Math.round(plItem.amount);

                            localItem.BbookMonth = localItem.PLMonth - localItem.AbookMonth;
                        }
                    });

                    plItems = newPlItems;

                    plSummary =
                    {
                        Bbook: 0,
                        Abook: 0,
                        PL: 0,
                        BbookMonth: 0,
                        AbookMonth: 0,
                        PLMonth: 0
                    };

                    plItems.forEach(function(item){
                        plSummary.Bbook += item.Bbook;
                        plSummary.Abook += item.Abook;
                        plSummary.PL += item.PL;
                        plSummary.BbookMonth += item.BbookMonth;
                        plSummary.AbookMonth += item.AbookMonth;
                        plSummary.PLMonth += item.PLMonth;
                    });
                }
                else {
                    requestResult.errormessage = 'Error loading data';
                    requestResult.dataerror = true;
                }

                $rootScope.$broadcast('plloaded', requestResult);
                runningRequests.pl = false;
            },
            function (error) {
                requestResult.errormessage = 'Error loading data';
                requestResult.dataerror = true;

                $rootScope.$broadcast('plloaded', requestResult);
                runningRequests.pl = false;
            }
        );

        $http.get(apiurl + '/time')
            .then(function(result) {
                if (result.data.status == 'OK') {
                    currentNYDate = moment(result.data.payload[0]);
                }
                else
                    currentNYDate = moment();
            },
            function(error){
                currentNYDate = moment();
            });
    }

    var load = function () {
        loadExposure();
        loadBlotter();
        loadPL();
    };
}