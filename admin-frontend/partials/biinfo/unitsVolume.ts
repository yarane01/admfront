/// <reference path="../../ts/jquery.d.ts" />
/// <reference path="../../ts/angular.d.ts" />
/// <reference path="../../ts/moment.d.ts" />
/// <reference path="data.ts" />
/// <reference path="misc.ts" />

namespace biInfo {
    declare var d3: any;

    export class UnitsVolumeChart extends biInfo.d3PieChart {

        // colors;

        createColors() {
            this.colors = new ColorRange(this.chartData.data.length);
        }

        initD3() {
            this.arc = d3.arc()
                .innerRadius(this.innerRadius)
                // .cornerRadius(5)
                .padAngle(0.03)

            this.pie = d3.pie()
                .sort(null)
                .value((d) => {
                    return d.volume
                })
                (this.chartData.data);
        }

        buildPies() {
            var self = this;
            var path = this.chart.selectAll("path")
                .data(this.pie)
                .enter().append("path")
                .each((d, i) => {
                    d.outerRadius = this.outerRadius;
                    d.color = this.colors.getColor(i);
                })
                .attr("fill", (d, i) => {
                    return d.color;
                })
                .attr("d", this.arc)
                // .attr("transform", explode)
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut)
                .transition()
                .duration(750)
                // .ease(d3.easeLinear)
                .attrTween("d", this.tweenPie)


            function handleMouseOver(d) {
                if (self.thumbnail) return;
                d3.select(this).transition().delay(0).attrTween("d", function (d) {
                    var interpolator = d3.interpolate(d.outerRadius, self.outerRadius + 20);
                    return function (t) {
                        d.outerRadius = interpolator(t);
                        return self.arc(d);
                    };
                });
                self.setInfoText([d.data.unit, toM(d.value)], 100)
            }

            function handleMouseOut(d) {
                if (self.thumbnail) return;
                d3.select(this).transition().delay(150).attrTween("d", function (d) {
                    var interpolator = d3.interpolate(d.outerRadius, self.outerRadius);
                    return function (t) {
                        d.outerRadius = interpolator(t);
                        return self.arc(d);
                    };
                });
                setDefaultInfoText(500)
            }

            var setDefaultInfoText = (delay) => {
                this.setInfoText(["Total", toM(this.chartData.total)], delay);
            }

            if (!self.thumbnail)
                setDefaultInfoText(800)
        }

        createLegend() {
            this.legend.selectAll('rect .legend')
                .data(this.pie)
                .enter()
                .append("rect")
                .attr("class", "legend")
                .attr("x", 0)
                .attr("y", (d, i) => {
                    return i * this.legendYshift;
                })
                .attr("width", 20)
                .attr("height", 10)
                .attr("fill", (d, i) => {
                    // return colors[i % 2](Math.random());
                    return d.color;
                })

            var legentText = this.legend.selectAll('text')
                .data(this.pie)
                .enter()
                .append("text")
                .attr("x", 30)
                .attr("y", (d, i) => {
                    return i * this.legendYshift + 9;
                })
                .attr("text-anchor", "start")

            legentText.append('tspan')
                .attr("class", "label")
                .text((d, i) => {
                    return d.data.unit;
                })

            legentText.append('tspan')
                .attr("class", "value")
                .text((d, i) => {
                    return " " + toM(d.value);
                });

        }

        createExtras() {
        }

        constructor(chartId, chartData) {
            super(chartId, chartData);
        }

    }
}
