/// <reference path="../../ts/jquery.d.ts" />
/// <reference path="../../ts/angular.d.ts" />
/// <reference path="../../ts/moment.d.ts" />
/// <reference path="data.ts" />
/// <reference path="misc.ts" />

namespace biInfo {
    declare var google: any;
    declare var d3: any;

    export class LPVolumeChart extends biInfo.Chart {
        dataTable;
        chartOptions;
        chart;

        constructor(chartId, chartData) {
            super();
            this.chartData = chartData;//$biInfo.dailyvolume;
            // this.chartId = "#daily-volume-chart";
            this.chartId = chartId;
            this.init();
        }


        createChart(): void {
            super.createChart();
            this.fillTable();
            let hAxis = this.thumbnail ? {textPosition: 'none'} : {slantedText: true, scaleType: 'log'};
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
                // bar: {groupWidth: 20},
                isStacked: true
            }
            this.chart = new google.visualization.BarChart(this.graphEl[0]);
            this.chart.draw(this.dataTable, this.chartOptions);
        }

        fillTable(): void {
            this.dataTable = new google.visualization.DataTable();
            this.dataTable.addColumn('string', 'name');
            this.dataTable.addColumn('number', 'volume');
            this.dataTable.addColumn({'type': 'string', 'role': 'style'});

            this.chartData.data.forEach((obj) => {
                var color = '';
                if (obj.bank.toUpperCase() == "WAREHOUSE") color = "orangered";
                this.dataTable.addRow([obj.bank, obj.volume, color]);
            })
        }

        updateData(): angular.IPromise<biInfo.Response> {
            return this.chartData.load()
                .then((ret) => {
                    return ret;
                })
        }


        updateChart(): void {
            this.chart.draw(this.dataTable, this.chartOptions);
        }

        loadData(): angular.IPromise < biInfo.Response > {
            return this.chartData.load();
        }

    }
}