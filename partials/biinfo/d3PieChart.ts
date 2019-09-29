/// <reference path="../../ts/jquery.d.ts" />
/// <reference path="../../ts/angular.d.ts" />
/// <reference path="../../ts/moment.d.ts" />
/// <reference path="data.ts" />
/// <reference path="misc.ts" />

namespace biInfo {
    declare var d3: any;

    export abstract class d3PieChart extends biInfo.Chart {
        svg;
        chart;
        margin;
        width;
        height;
        outerRadius;
        innerRadius;
        arc;
        pie;
        infoText;
        infoLines;
        radiusRatio;
        colors;
        legend;
        infoSize = "18px";
        legendYshift = 20;

        tweenPie = (finish) => {
            var start = {
                startAngle: 0,
                endAngle: 0
            };
            var interpolator = d3.interpolate(start, finish);
            return (t) => {
                return this.arc(interpolator(t));
            };
        }

        tweenArc = (outerRadius, delay) => {
            return function () {
                d3.select(this).transition().delay(delay).attrTween("d", function (d) {
                    var i = d3.interpolate(d.outerRadius, outerRadius);
                    return (t) => {
                        d.outerRadius = i(t);
                        return this.arc(d);
                    };
                });
            };
        }

        explodePie = (d, i) => {
            var offset = (i == 9) ? 10 : 0;
            var angle = (d.startAngle + d.endAngle) / 2;
            var xOff = Math.sin(angle) * offset;
            var yOff = -Math.cos(angle) * offset;
            return "translate(" + xOff + "," + yOff + ")";
        }

        setInfoText = (values: string[], delay) => {
            this.infoText.transition()
                .delay(delay)
                // .on("end", () => {
                .on("start", () => {
                    for (var i = 0; i < values.length; i++) {
                        this.infoLines[i].text(values[i]);
                    }
                })
        }

        createInfoText = () => {
            this.infoLines = [];
            this.infoText = this.chart.append("g")
            return this.infoText;
        }

        createInfoLine = () => {
            var text = this.infoText.append("text")
                .attr("text-anchor", "middle")
                .attr("font-family", "Arial")
                .attr("font-size", this.infoSize)
                .attr("font-weight", "bold")
            this.infoLines.push(text);
            return text;
        }

        abstract createColors();

        abstract initD3();

        abstract buildPies();

        abstract createLegend();

        abstract createExtras();

        constructor(chartId, chartData) {
            super();
            this.chartData = chartData;
            this.chartId = chartId;
            this.radiusRatio = 0.5;
            this.init();
        }

        createChart(): void {
            super.createChart();

            this.width = this.graphEl.width();
            this.height = this.graphEl.height();
            this.margin = this.thumbnail ? 10 : 30;
            this.outerRadius = Math.min(this.width, this.height) / 2 - this.margin;
            this.innerRadius = this.outerRadius * this.radiusRatio;

            this.svg = d3.select(this.chartId + ' .graph-content')
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)

            let trans = this.thumbnail ? this.width / 2 + "," + this.height / 2 :
            (this.outerRadius + this.margin) + "," + this.height / 2;
            this.chart = this.svg
                .append("g").attr("transform", "translate(" + trans + ")");

            this.createColors();
            this.initD3();
            this.createInfoText();
            this.createInfoLine().attr("dy", "-10px");
            this.createInfoLine().attr("dy", "10px");
            this.buildPies();
            if (!this.thumbnail)
                this.createExtras();

            if (!this.thumbnail) {
                this.legend = this.svg.append("g")
                    .attr("class", "bi-legend")
                    .style("opacity", 0)
                // .attr("transform", "translate(" + width * 3 / 5 + ",0)")
                this.createLegend();
                let el: any = $(this.chartId + ' .bi-legend').get(0);
                var lw = el.getBBox().width;

                this.legend.attr("transform", "translate(" + (this.width - lw - 10) + ",10)")
                this.legend.transition()
                    .duration(1000)
                    .style("opacity", 1);
            }

        }

        updateData(): angular.IPromise < biInfo.Response > {
            return this.chartData.load()
                .then((ret) => {
                    return ret;
                })
        }


        loadData(): angular.IPromise < biInfo.Response > {
            return this.chartData.load();
        }

        updateChart(): void {
            this.createChart();
        }

    }
}
