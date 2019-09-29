/// <reference path="../../ts/jquery.d.ts" />
/// <reference path="../../ts/angular.d.ts" />
/// <reference path="../../ts/moment.d.ts" />
/// <reference path="data.ts" />
/// <reference path="misc.ts" />

namespace biInfo {
    declare var google: any;
    declare var d3: any;
    export class ActiveAccountsChart extends biInfo.Chart {
        dataTable;
        chartOptions;
        chart;

        constructor(chartId, chartData) {
            super();
            this.chartData = chartData;//$biInfo.accounts;
            this.chartId = chartId;//"#accounts-chart";
            this.init();
        }


        createChart(): void {
            super.createChart();
            this.fillTable();
            let hAxis = this.thumbnail ? {textPosition: 'none'} : {slantedText: true};
            this.chartOptions = {
                //fontSize: 12,
                legend: 'none',
                // colors: getbISingleColor(),
                // colors: ['orangered', 'royalblue'],
                // chartArea: {left: 30, top: 10, width: '80%', height: '60%'},
                animation: biInfo.getChartAnimation(),
                enableInteractivity: !this.thumbnail,
                hAxis: hAxis,
                // vAxis: {format: 'short', scaleType: 'log'},
                vAxis: {format: 'short'},
            }
            this.chart = new google.visualization.AreaChart(this.graphEl[0]);
            this.chart.draw(this.dataTable, this.chartOptions);
        }

        fillTable(): void {
            this.dataTable = new google.visualization.DataTable();
            this.dataTable.addColumn('string', 'date');
            this.dataTable.addColumn('number', 'count');

            this.chartData.data.forEach((obj) => {
                this.dataTable.addRow([obj.date, obj.count]);
            })
        }

        updateData(): angular.IPromise<biInfo.Response> {
            return this.chartData.update()
                .then((ret) => {
                        if (ret.status == "OK") {
                            var lastIndex = this.chartData.data.length - 1;
                            var last = this.chartData.data[lastIndex];
                            this.dataTable.setValue(lastIndex, 1, last.count);
                            return ret;
                        }
                        else
                            return ret;
                    }
                )
        }


        updateChart(): void {
            this.chart.draw(this.dataTable, this.chartOptions);
        }

        loadData(): angular.IPromise < biInfo.Response > {
            return this.chartData.load();
        }

    }
}
