angular
    .module('portal')
    .controller('MCAccountsCtrl', MCAccountsCtrl);

function MCAccountsCtrl($scope, $http, $timeout) {
    const updateInterval = 60 * 1000;

    var interval = 0;
    $scope.busy = false;
    var count = 0;

    createStandardContext($scope);
    $scope.Refresh = function () {
        if ($scope.busy) return;
        $scope.busy = true;
        // standardClear($scope);
        // $http.get(apiurl + '/accountsmargin?p=20')
        $http.get(apiurl + '/accounts2?filter=account_status=1&n1=1&n2=100')
        // $http.get(apiurl + '/accounts2?n1=1&n2=10')
            .then(standardSuccess($scope), standardError($scope))
            .finally(function () {
                $scope.busy = false;
            })

        // .then(standardSuccess($scope, getSettings), standardError($scope))
    }
    /*function getSettings(response) {
        $scope.context.data = response.data.payload[0];
        count = response.data.payload[0].length;
        $scope.context.data.forEach(function (acc) {
            acc.inMarginCall = null;
            $http.get(apiurl + '/settings/' + acc.accountid)
                .then(function (res) {
                // .then(res => {
                        if (res.data.status == "OK") {
                            var mcLevel = $.grep(res.data.payload, function (e) {
                                return e.systemsetting.constname == "ACCOUNT_MC_LEVEL";
                            })
                            if (mcLevel[0].effectivevalues.length == 0) {
                                acc.mcLevel = mcLevel[0].systemsetting.defaultvalue;
                            }
                            else {
                                acc.mcLevel = mcLevel[0].effectivevalues[0].settingbyvalue.value;
                            }
                            acc.inMarginCall = acc.used_margin >= acc.equity * acc.mcLevel;
                            acc.inMarginCall = true;
                        }
                    }
                )
                .finally(function () {
                    if (--count == 0) busy = false;
                })
        })
    }*/

    $scope.forceMC = function (account) {
        $http.get(tradeserverurl + "/trading/forceMarginCall?mcAccountID=" + account.systemid)
            .finally(function () {
                    $scope.Refresh()
                }
            )
    }

    $scope.Refresh();
    setInterval($scope.Refresh, updateInterval);

    $scope.Maximize = function () {
        $("#mc-accounts").toggleClass("pre-scrollable");
    };

    $scope.Minimize = function () {
        $("#mc-accounts").toggleClass("pre-scrollable");
    };

    $scope.$on("$destroy", function () {
        if (interval != 0) {
            clearInterval(interval);
        }
    });


}



