var tradingPeriods = {
    fileContent: "",
    data:[],
    clear: function() { 
        this.data.length = 0; 
        this.fileContent = "";
    },
    loadFromCSV: function(file, successCallBack, errorCallBack) {
        if (!file) {
            successCallBack();
            return;
        }

        var target = this;
        var fileReader = new FileReader();

        fileReader.onloadend = function (event) {
            var fileContent = event.target.result;

            try {
                var allTextLines = fileContent.split(/\r\n|\n/);
                
                for (var i = 0; i < allTextLines.length; i++) {
                    if(target.fileContent == "") {
                        target.fileContent = allTextLines[i].replaceAll('"', '\\"');
                    } else {
                        target.fileContent = target.fileContent + "\\n" + allTextLines[i].replaceAll('"', '\\"');
                    }

                    if(i == 0) {
                        continue; //ignore headers
                    }

                    //instrumentid - tradingperiod
                    const [instId, ...tPeriod] = allTextLines[i].split(',');
                    const tradingPeriodString = tPeriod.join(',');

                    var period = {};

                    period.instrumentid = instId;
                    period.tradingperiod = tradingPeriodString.replaceAll('"', '');

                    target.data.push(period);
                }

                successCallBack();
            }
            catch(e) {
                errorCallBack('Error parsing file "' + file.name + '": ' + e.message);
            }
        };

        fileReader.onerror = function () {
            errorCallBack('Error reading file "' + file.name + '"');
        };
        
        fileReader.readAsText(file);
    }
};

function uploadTradingTimes($http, successCallBack, errorCallBack) {
    var req = {
        method: 'PUT',
        url: apiurl + '/updatetradinghours',
        data: "{\"csv_data\":\"" + tradingPeriods.fileContent + "\"}"
    };

    $http(req)
    .then(
        function (successResponse) {
            if (successResponse.data.status == 'OK') {
                successCallBack(successResponse.data.payload[0]);
            } else {
                errorCallBack('Error uploading data: ' + successResponse.data.payload[0]);
            }
        },
        function (errorResponse) {
            var errorMessage = null;

            if (errorResponse.data.payload && (errorResponse.data.payload.length > 0)) {
                errorMessage = 'Error uploading data: ' + errorResponse.data.payload[0];
            } else {
                errorMessage = 'Error uploading data';
            }

            errorCallBack(errorMessage);
        }
    )
    .catch(function (response) {
        errorCallBack('Error uploading data');
    });
}

function doUpdateTradePeriods($scope, $http) {
    $('#updateTradingPeriodsDialog').data('bs.modal').options.backdrop = 'static';

    $scope.processing = true;
    $scope.errorMessage = null;

    var errorCallBack = function(errorMessage) {
        $scope.processing = false;
        $scope.errorMessage = errorMessage;
        $scope.tradingPeriodsCSVFile = null;
        $('#updateTradingPeriodsDialog').data('bs.modal').options.backdrop = true;
    };
    
    tradingPeriods.clear();

    tradingPeriods.loadFromCSV($scope.tradingPeriodsCSVFile, function() {
        uploadTradingTimes($http, function(results) {
            $scope.processing = false;
            $scope.tradingPeriodsCSVFile = null;

            var items = tradingPeriods.data;

            for (var i = 0; i < items.length ;i++) {
                var item = items[i];

                var instrument = $scope.$root.instruments.getByName(item.instrumentid);

                if (instrument) {
                    instrument.tradingperiod = item.tradingperiod;
                }
            }

            //reload table data
            $scope.table.clear().rows.add($scope.$root.instruments.data).draw(false);

            if(results) {
                confirm(results);
            }

            $('#updateTradingPeriodsDialog').modal('hide');
        }, errorCallBack);
    }, errorCallBack);
}