var corporateActionsControllers = angular.module('corporateActionsControllers', []);

corporateActionsControllers.controller('CorporateActionsCtrl',
    ['$q', '$rootScope', '$scope', '$http', '$route', 'api', '$timeout', 'SubscriptionService',
        function ($q, $rootScope, $scope, $http, $route, api, $timeout, SubscriptionService) {
            $scope.createCorporateAction = function() {
                var req = {
                    method: 'POST',
                    url: apiurl + '/position/conditionalorder',
                    data: {
                        conditionaltype: $scope.trade.conditionaltype,
                        price: $scope.trade.conditionalRate,
                        orderRequestId: $scope.trade.openorderid
                    }
                };
            
                $http(req)
                .then(
                    function (successResponse) {
                        if (successResponse.data.status == 'OK') {
                            $('#conditionalOrder').modal('hide');
                            confirm("Successfully created conditional order " + successResponse.data.payload[0]);
                        } else {
                            confirm('Error uploading data: ' + successResponse.data.payload[0]);
                        }
                    },
                    function (errorResponse) {
                        var errorMessage = null;
            
                        if (errorResponse.data.payload && (errorResponse.data.payload.length > 0)) {
                            errorMessage = 'Error uploading data: ' + errorResponse.data.payload[0];
                        } else {
                            errorMessage = 'Error uploading data';
                        }
            
                        confirm(errorMessage);
                    }
                )
                .catch(function (response) {
                    confirm('Error uploading data');
                });


                $.ajax(apiurl + '/corporateAction', {
                    data: {
                        "symbol":$scope.corpaction.symbol,
                        "dividend":$scope.corpaction.dividend,
                        "divisor":$scope.corpaction.divisor
                    },
                    contentType: 'application/json',
                    type: 'POST'
                }).done(function () {
                    alert("successfully processed corporate action.");
                    $scope.clearAllFields();
                }).error(function () {
                    alert("Received error while creating corporate action.");
                    $scope.clearAllFields();
                });
            };

            $scope.clearAllFields = function() {
                document.getElementById('corpaction_symbol').value = "";
                document.getElementById('corpaction_dividend').value = "";
                document.getElementById('corpaction_divisor').value = "";
            };
        }
    ]
)