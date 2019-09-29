/// <reference path="../../ts/jquery.d.ts" />
/// <reference path="../../ts/angular.d.ts" />
/// <reference path="../../ts/moment.d.ts" />
/// <reference path="data.ts" />
/// <reference path="misc.ts" />

namespace biInfo {
    declare var google: any;
    declare var d3: any;
    angular
        .module('portal')
        .controller('biInfoCtrl', function ($scope,
                                            $rootScope,
                                            $biInfo) {

                $rootScope.activePage = "biInfo";
                var interval;

                var volumeChart,
                    revenueChart,
                    yieldChart,
                    accountsChart,
                    todayVolumeChart,
                    monthVolumeChart,
                    unitVolumeChart,
                    lpVolumeChart,
                    hourVolumeChart;

                var startOfTheDay = moment.utc(moment().format('YYYY-MM-DD') + "T17:00:00-05:00").subtract(1, "days");

                $scope.Minimize = function (el, panel) {
                }

                $scope.Maximize = function (el, panel) {
                    var chart = $(el).data('chart');
                    chart.thumbnail = false;
                    chart.graph.removeClass('small-graph');
                    chart.graph.addClass('expanded-graph');
                    chart.graphEl.trigger('redraw');
                }

                $scope.Minimize = function (el, panel) {
                    var chart = $(el).data('chart');
                    chart.thumbnail = true;
                    chart.graph.removeClass('expanded-graph');
                    chart.graph.addClass('small-graph');
                    chart.graphEl.trigger('redraw');
                }

                function init() {
                    volumeChart = new biInfo.VolumeChart("#daily-volume-chart", $biInfo.dailyvolume);
                    revenueChart = new biInfo.RevenueChart("#revenue-chart", $biInfo.revenue);
                    yieldChart = new biInfo.YieldChart("#yield-chart", $biInfo.yield);
                    accountsChart = new biInfo.ActiveAccountsChart("#accounts-chart", $biInfo.accounts);
                    todayVolumeChart = new biInfo.SymbolVolumeChart("#today-volume-chart", $biInfo.todayvolume);
                    monthVolumeChart = new biInfo.SymbolVolumeChart("#month-volume-chart", $biInfo.monthvolume);
                    hourVolumeChart = new biInfo.HourVolumeChart("#hour-volume-chart", $biInfo.hourvolume);
                    lpVolumeChart = new biInfo.LPVolumeChart("#lp-volume-chart", $biInfo.lpvolume);
                    unitVolumeChart = new biInfo.UnitsVolumeChart("#units-volume-chart", $biInfo.unitvolume);

                    var utcMinus5Hours = moment.utc("2000-01-01T17:00:00-05:00").hours();
                    // interval = setInterval(update, 30 * 1000);
                }

                function update() {
                    // return
                    if (moment().utc().diff(volumeChart.chartData.lastload, "days") >= 1) {
                        volumeChart.load();
                        revenueChart.load();
                        yieldChart.load();
                        accountsChart.load();
                        monthVolumeChart.load();
                        hourVolumeChart.load();
                        lpVolumeChart.load();
                        startOfTheDay = moment.utc(moment().format('YYYY-MM-DD') + "T17:00:00-05:00").subtract(1, "days");
                    }
                    else {
                        if (moment().utc().diff(volumeChart.chartData.lastupdate, "seconds") >= 10) {
                            volumeChart.update();
                            revenueChart.update();
                            yieldChart.update();
                            accountsChart.update();
                            todayVolumeChart.update();
                            hourVolumeChart.update();
                            lpVolumeChart.update();
                        }
                    }
                }

                init();

                $scope.$on("$destroy", function () {
                    if (interval > 0)
                        clearInterval(interval);
                });

            }
        )
}