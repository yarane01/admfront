/// <reference path="../../ts/jquery.d.ts" />
/// <reference path="../../ts/angular.d.ts" />
/// <reference path="../../ts/moment.d.ts" />

namespace biInfo {

    export abstract class Chart {
        chartData: ChartData;
        chartId: string;
        reloading = false;
        updating = false;
        loaded = false;
        thumbnail = true;
        graph;
        graphEl;
        loadingEl;
        updatingEl;
        errorEl;

        abstract loadData(): angular.IPromise<Response>;

        abstract updateChart(): void;

        createChart(): void {
            this.graphEl.empty();
            this.loadingEl.hide();
            this.graphEl.fadeIn();
        }

        abstract updateData(): angular.IPromise<Response>;

        bindElements = () => {
            $(this.chartId).data('chart', this);
            this.graph = $(this.chartId + ' .bi-graph');
            this.graphEl = $(this.chartId + ' .graph-content');
            this.loadingEl = $(this.chartId + ' .chart-loading');
            this.updatingEl = $(this.chartId + ' .chart-updating');
            this.errorEl = $(this.chartId + ' .chart-error');
            this.graphEl.bind('redraw', () => {
                if (this.loaded) this.createChart()
            })

            this.loadingEl.append('<i class="fa fa-spinner fa-spin"></i>');
            this.updatingEl.append('<i class="fa fa-spinner fa-spin"></i>');
        }

        init = () => {
            this.bindElements();
            // Google.init().then(() => {
            if (this.chartData.data.length == 0) {
                this.load().then((result) => {
                    if (result) {
                        this.loaded = true;
                    }
                })
            }
            else {
                this.createChart();
                this.loaded = true;
            }
            // }
            // )
        }

        update = () => {
            if (this.reloading) return;
            if (this.updating) return;
            this.updating = true;
            this.updatingEl.fadeIn();
            setTimeout(() => {
                    this.updateData().then((response) => {
                        if (response.status == "OK") {
                            this.updatingEl.hide();
                            this.updateChart();
                            this.chartData.lastupdate = moment.utc();
                        }
                        this.updating = false;
                    })
                }, 1000
            )

        }

        load = () => {
            this.errorEl.hide();
            this.graphEl.hide();
            this.loadingEl.fadeIn();

            return this.loadData()
                .then((response) => {
                        if (response.status == "OK") {
                            if (this.chartData.data.length > 0) {
                                this.loadingEl.hide();
                                this.createChart();
                                this.chartData.lastupdate = moment.utc().seconds(0);
                                this.chartData.lastload = moment.utc().seconds(0);
                                return true;
                            }
                            else {
                                this.loadingEl.hide();
                                this.errorEl.html('Empty response');
                                this.errorEl.fadeIn();
                                return false;
                            }
                        }
                        else {
                            this.loadingEl.hide();
                            this.errorEl.html(response.data);
                            this.errorEl.fadeIn();
                            return false;
                        }
                    },
                    (response) => {
                        this.loadingEl.hide();
                        this.errorEl.html('Error. HTTP status ' + response.status + '<br>' + response.statusText);
                        this.errorEl.fadeIn();
                        return false;
                    }
                )
        }

    }
}
