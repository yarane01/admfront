
angular
    .module('portal')
    .controller('RiskManagementPLSummaryCtrl', RiskManagementPLSummaryCtrl);

function RiskManagementPLSummaryCtrl($scope, $rootScope, RiskManagementService, $http) {

    $scope.context = {
        dataloaded: false,
        firsttimeload: true
    };

    $scope.currentNYDate = moment().format('L');
    $scope.lastMonthNYDate = moment().subtract(1, 'month').endOf('month').format('L');

    $scope.getClass = function(value) {
        if (value >= 0)
            return 'bluetextcolor';
        else
            return 'redtextcolor';
    };

    function update(requestResult) {
        $scope.context.dataerror = requestResult.dataerror;
        $scope.context.errormessage = requestResult.errormessage;

        if (!$scope.context.dataerror)
        {
            var currentNYDate = RiskManagementService.getCurrentNYDate();

            $scope.currentNYDate = currentNYDate.format('L');
            $scope.lastMonthNYDate = currentNYDate.subtract(1, 'month').endOf('month').format('L');

            var plSummary = RiskManagementService.getPlSummary();

            $scope.summary =
            {
                Bbook: plSummary.Bbook,
                BbookFormatted: formatInteger(plSummary.Bbook),
                Abook: plSummary.Abook,
                AbookFormatted: formatInteger(plSummary.Abook),
                PL: plSummary.PL,
                PLFormatted: formatInteger(plSummary.PL),
                BbookMonth: plSummary.BbookMonth,
                BbookMonthFormatted: formatInteger(plSummary.BbookMonth),
                AbookMonth: plSummary.AbookMonth,
                AbookMonthFormatted: formatInteger(plSummary.AbookMonth),
                PLMonth: plSummary.PLMonth,
                PLMonthFormatted: formatInteger(plSummary.PLMonth)
            }
        }

        $scope.context.dataloaded = true;
    }

    var listener1 = $rootScope.$on("plloading", function (event, args) {
        $scope.context.dataloaded = false;
    });

    var listener2 = $rootScope.$on("plloaded", function (event, args) {
        update(args);
        $scope.context.firsttimeload = false;
    });

    $scope.$on('$destroy', function() {
        listener1();
        listener2();
    });

}
