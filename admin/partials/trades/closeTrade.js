function sendCloseTradeMessage(price, orderrequestid, $scope, $rootScope, $http, successCallBack, errorCallBack) {
    var req = {
        method: 'POST',
        url: apiurl + '/closeposition',
        data: {
            orderrequestid: orderrequestid,
            price: price,
            username: $rootScope.portalUser.username
        }
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

function processClosePosition($scope, $rootScope, $http) {
    $('#closeTradeDialog').data('bs.modal').options.backdrop = 'static';

    $scope.processing = true;
    $scope.errorMessage = null;

    var errorCallBack = function(errorMessage) {
        $scope.processing = false;
        $scope.errorMessage = errorMessage;
        $scope.orderrequestid = null;
        $('#closeTradeDialog').data('bs.modal').options.backdrop = true;
    };

    sendCloseTradeMessage(document.getElementById("price").value, document.getElementById("orderrequestid").value, $scope, $rootScope, $http, function(results) {
        $scope.processing = false;
        $scope.orderrequestid = null;

        //reload table data
        $('#table').DataTable().ajax.reload();

        if(results) {
            confirm(results);
        }

        $('#closeTradeDialog').modal('hide');
    }, errorCallBack);
}