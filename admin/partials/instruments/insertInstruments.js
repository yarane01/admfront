var instrumentList = {
    fileContent: "",
    data: [],
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

function uploadInstruments($http, successCallBack, errorCallBack) {
    var req = {
        method: 'POST',
        url: apiurl + '/bulkInstrument',
        data: "{\"csv_data\":\"" + instrumentList.fileContent + "\"}"
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

function doInsertInstruments($scope, $http) {
    $('#submitInstrumentsDialog').data('bs.modal').options.backdrop = 'static';

    $scope.processing = true;
    $scope.errorMessage = null;

    var errorCallBack = function(errorMessage) {
        $scope.processing = false;
        $scope.errorMessage = errorMessage;
        $scope.instrumentsCSVFile = null;
        $('#submitInstrumentsDialog').data('bs.modal').options.backdrop = true;
    };

    instrumentList.clear();

    instrumentList.loadFromCSV($scope.instrumentsCSVFile, function() {
        uploadInstruments($http, function(results) {
            $scope.processing = false;
            $scope.instrumentsCSVFile = null;

            $scope.Refresh();

            if(results) {
                confirm(results);
            }

            $('#submitInstrumentsDialog').modal('hide');
        }, errorCallBack);
    }, errorCallBack);
}