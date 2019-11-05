/// <reference path="../../ts/jquery.d.ts" />
/// <reference path="../../ts/angular.d.ts" />
/// <reference path="../../ts/moment.d.ts" />
/// <reference path="data.ts" />
/// <reference path="misc.ts" />

namespace biInfo {
    declare var d3: any;

    export class HourVolumeChart extends biInfo.d3PieChart {
        currencies;
        rScale;

        createColors() {
            // this.colors = new ColorRange(this.chartData.currencies.length);
        }

        initD3() {
            this.currencies = {};
            this.chartData.currencies.forEach((d, i) => {
                this.currencies[d.symbol] = {color: d.color}//this.colors.getColor(i)}
            })

            this.rScale = d3.scaleLinear()
                .domain([this.chartData.negative, this.chartData.positive])
                .range([this.innerRadius, this.outerRadius]);

            this.arc = d3.arc()
            // .cornerRadius(5)
                .padAngle(0.01)

            this.pie = d3.pie()
                .sort(null)
                .value((d) => {
                    return d.value
                })
                (this.chartData.data);
        }

        buildPies() {
            var self = this;
            var pies = this.chart.selectAll(".pie")
                .data(this.pie)
                .enter().append("g")
                .attr("class", "pie")

            function tweenSector(d) {
                var start = {outerRadius: d.innerRadius}
                var interpolator = d3.interpolate(start, d);
                return (t) => {
                    return self.arc(interpolator(t));
                };
            }

            pies.each(function (p, i) {
                var positiveVol = 0;
                var negativeVol = 0;
                var delta = 0;
                var gap;


                p.maxRadius = 0;
                d3.select(this).selectAll("path")
                    .data(p.data.volumes)
                    .enter().append("path")
                    .each((d, i) => {
                        d.startAngle = p.startAngle;// + delta;//i / 10;
                        d.endAngle = p.endAngle;//' - delta;//
                        delta += 0.05;
                        d.color = self.currencies[d.symbol].color;
                        d.index = i;

                        if (d.volume > 0) {
                            gap = positiveVol == 0 ? 0 : 2;
                            d.innerRadius = self.rScale(positiveVol) + gap;
                            d.outerRadius = self.rScale(positiveVol + d.volume);
                            p.maxRadius = d.outerRadius;
                            positiveVol += d.volume;
                        }
                        else {
                            gap = negativeVol == 0 ? 0 : 2;
                            d.innerRadius = self.rScale(negativeVol + d.volume);
                            d.outerRadius = self.rScale(negativeVol) - gap;
                            negativeVol += d.volume;
                        }
                        d.minRadius = d.innerRadius;
                        d.maxRadius = d.outerRadius;
                    })
                    .attr("fill", (d, i) => {
                        return d.color;
                    })
                    .attr("d", self.arc)
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut)
                    // .transition().duration(750).attrTween("d", tweenSector)
                    // .transition().duration(750).attrTween("d", self.tweenPie)
                    .transition().duration(750).attrTween("d", (d) => {
                    return d.index == 0 ? tweenSector(d) : self.tweenPie(d)
                })
            })

            function handleMouseOver(d) {
                if (self.thumbnail) return;
                d3.select(this).transition().duration(200)
                // .attr("stroke", "lightgray")
                    .attr("stroke", "white")
                    // .attr("fill", "transparent")
                    .attr("stroke-width", 4);

                self.setInfoText([d.symbol, toM(d.volume)], 100)
            }

            function handleMouseOut(d) {
                if (self.thumbnail) return;
                d3.select(this).transition().duration(200)
                    .attr("fill", d.color)
                    .attr("stroke-width", 0);
                // self.setInfoText(["", ""], 500)
                setDefaultInfoText(500);
            }

            var setDefaultInfoText = (delay) => {
                this.setInfoText(["Total", toM(this.chartData.total)], delay);
            }

            if (!self.thumbnail)
                setDefaultInfoText(800)
        }

        createLegend() {
            this.legend.selectAll('rect')
                .data(this.chartData.currencies)
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => {
                    return i * this.legendYshift;
                })
                .attr("width", 20)
                .attr("height", 10)
                .attr("fill", (d, i) => {
                    return d.color;
                })

            var legentText = this.legend.selectAll('text')
                .data(this.chartData.currencies)
                .enter()
                .append("text")
                .attr("x", 30)
                .attr("y", (d, i) => {
                    return i * this.legendYshift + 9;
                })
                .attr("text-anchor", "start")

            legentText.append('tspan')
                .attr("class", "currency")
                .text((d, i) => {
                    return d.symbol;
                })

        }

        createExtras() {
            var self = this;
            /*
             this.chart.append("path")
             .attr("d", function () {
             return d3.arc()
             .innerRadius(rScale(0))
             .outerRadius(rScale(0))
             .startAngle(0)
             .endAngle(2 * Math.PI)()
             })
             .attr("stroke", "red")
             .attr("stroke-width", 2);
             */

            var datePath = this.chart.selectAll(".date-path")
                .data(this.pie)
                .enter().append("path")
                .attr("class", "date-path")
                .attr("id", function (d, i) {
                    return "pie_" + i;
                })
                .attr("d", function (d) {
                    var arc = d3.arc()
                        .outerRadius(d.maxRadius + 10)
                        .innerRadius(d.maxRadius + 10)
                    return arc(d);
                })
            /*
             .attr("transform", function (d) {
             var a = (d.endAngle - d.startAngle) / 2 * 90 / Math.PI;
             return "rotate(" + a + ")"
             })
             */

            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle) / 2;
            }

            //labels on path
            /*
             this.chart.selectAll(".date-text")
             .data(this.pie)
             .enter().append("text")
             .attr("class", "date-text")
             .append("textPath")
             // .attr("startOffset", "50%")
             .attr("xlink:href", function (d, i) {
             return "#pie_" + i;
             })
             .text(function (d) {
             // return d.data.date;
             return moment(d.data.date, "YYYY-MM-DD HH:mm:ss").format("MM/DD HH:mm");
             })
             */

            //labels with lines

            var arc = d3.arc()
                .outerRadius(this.outerRadius)
                .innerRadius(this.innerRadius)

            var textArc = d3.arc()
                .outerRadius(this.outerRadius + 10)
                .innerRadius(this.outerRadius + 10)

            this.chart.selectAll(".date-text")
                .data(this.pie)
                .enter().append("text")
                .attr("font-size", "11px")
                .attr("class", "date-text")
                .attr("dy", "0.25em")
                .text(function (d) {
                    // return d.data.date;
                    return moment(d.data.date, "YYYY-MM-DD HH:mm:ss").format("MM/DD HH:mm");
                })
                .attr("text-anchor", function (d) {
                    return midAngle(d) < Math.PI ? "start" : "end";
                })
                .attr("transform", function (d) {
                    var pos = textArc.centroid(d);
                    pos[0] = textArc.outerRadius()() * (midAngle(d) < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                })

            var textline = this.chart.selectAll(".line")
                .data(this.pie)
                .enter().append("polyline")
                .attr("stroke", "black")
                .attr("fill", "none")
                .attr("opacity", 0.5)
                .attr("points", function (d) {
                    var pos = textArc.centroid(d);
                    pos[0] = textArc.outerRadius()() * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), textArc.centroid(d), pos];
                })

        }

        chartData: biInfo.HourVolume;

        constructor(chartId, chartData: biInfo.HourVolume) {
            super(chartId, chartData);
            this.margin = 70;
            this.infoSize = "14px";
        }
    }
}

