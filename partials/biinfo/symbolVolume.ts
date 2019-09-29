/// <reference path="../../ts/jquery.d.ts" />
/// <reference path="../../ts/angular.d.ts" />
/// <reference path="../../ts/moment.d.ts" />
/// <reference path="data.ts" />
/// <reference path="misc.ts" />

namespace biInfo {
    declare var google: any;
    declare var d3: any;

    export class SymbolVolumeChart extends biInfo.d3PieChart {

        // colors;

        constructor(chartId, chartData) {
            super(chartId, chartData);
        }

        createColors() {
            // this.colors = new ColorRange(this.chartData.data.length);
        }

        initD3() {
            this.arc = d3.arc()
                .innerRadius(this.innerRadius)
                // .cornerRadius(5)
                .padAngle(0.01)

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
                    d.color = d.data.color;//this.colors.getColor(i);
                    d.outerRadius = this.outerRadius;
                    d.total = this.chartData.total;
                })
                .attr("fill", (d, i) => {
                    return d.color;
                })
                .attr("d", this.arc)
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
                self.setInfoText([d.data.symbol, toM(d.value)], 100)
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

        createExtras() {
            this.chart.selectAll(".bi-symbol-label")
                .data(this.pie)
                .enter().append("text")
                .attr("opacity", 0)
                .attr("class", "bi-symbol-label")
                .attr("transform", (d) => {
                    return "translate(" + this.arc.centroid(d) + ")" + " rotate(" + angle(d) + ")";
                })
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .style("pointer-events", "none")
                .attr("dy", "4")
                .text((d) => {
                    if ((d.endAngle - d.startAngle) > 0.1)
                        return d.data.symbol;
                    else
                        return '';
                })
                .transition()
                .duration(1000)
                .style("opacity", 1)

            function angle(d) {
                var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
                return a > 90 ? a - 180 : a;
            }
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
                .attr("class", "symbol")
                .text((d, i) => {
                    return d.data.symbol;
                })

            legentText.append('tspan')
                .attr("class", "value")
                .text((d, i) => {
                    return " " + toM(d.value);
                });

        }
    }
}
