var tradingPeriods = {
    fileContent: "",
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
                    console.log(allTextLines[i]);

                    if(target.fileContent == "") {
                        target.fileContent = allTextLines[i].replaceAll('"', '\\"');
                    } else {
                        target.fileContent = target.fileContent + "\\n" + allTextLines[i].replaceAll('"', '\\"');
                    }
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

    $http(req).
    then(
        function (successResponse) {
            if (successResponse.data.status == 'OK') {
                successCallBack();
            }
            else {
                errorCallBack('Error uploading data: ' + successResponse.data.payload[0]);
            }
        },
        function (errorResponse) {
            var errorMessage = null;

            if (errorResponse.data.payload && (errorResponse.data.payload.length > 0))
                errorMessage = 'Error uploading data: ' + errorResponse.data.payload[0];
            else
                errorMessage = 'Error uploading data';

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
        $('#updateTradingPeriodsDialog').data('bs.modal').options.backdrop = true;
    };
    
    tradingPeriods.loadFromCSV($scope.tradingPeriodsCSVFile, function() {
        uploadTradingTimes($http, function() {
            $scope.processing = false;
            $('#updateTradingPeriodsDialog').modal('hide');
        }, errorCallBack)
    }, errorCallBack);
}