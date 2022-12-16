var corporateActionsControllers = angular.module('corporateActionsControllers', []);

corporateActionsControllers.controller('CorporateActionsCtrl',
    ['$q', '$rootScope', '$scope', '$http', '$route', 'api', '$timeout', 'SubscriptionService',
        function ($q, $rootScope, $scope, $http, $route, api, $timeout, SubscriptionService) {
            $scope.createCorporateAction = function() {
                document.getElementById('loadingspinner').removeAttribute('hidden');
                document.getElementById('corpaction_submit').setAttribute('disabled', true);

                var req = {
                    method: 'POST',
                    url: apiurl + '/corporateAction',
                    data: {
                        symbol:$scope.corpaction.symbol.symbol,
                        dividend:$scope.corpaction.dividend,
                        divisor:$scope.corpaction.divisor
                    }
                };
            
                $http(req)
                .then(
                    function (successResponse) {
                        if (successResponse.data.status == 'OK') {
                            alert("Successfully processed corporate action.");
                        } else {
                            alert("Received error while creating corporate action.");
                        }

                        $scope.clearAllFields();
                    },
                    function (errorResponse) {
                        var errorMessage = null;
            
                        if (errorResponse.data.payload && (errorResponse.data.payload.length > 0)) {
                            errorMessage = 'Error uploading data: ' + errorResponse.data.payload[0];
                        } else {
                            errorMessage = 'Error uploading data';
                        }
            
                        confirm(errorMessage);
                        $scope.clearAllFields();
                    }
                )
                .catch(function (response) {
                    confirm('Error uploading data');
                });
            };

            $scope.clearAllFields = function() {
                document.getElementById('loadingspinner').setAttribute('hidden', true);
                document.getElementById('corpaction_submit').removeAttribute('disabled');
                document.getElementById('corpaction_symbol').value = "";
                document.getElementById('corpaction_dividend').value = "";
                document.getElementById('corpaction_divisor').value = "";
            };
        }
    ]
)