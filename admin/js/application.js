var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var biInfo;
(function (biInfo) {
    function getChartAnimation() {
        return {
            duration: 500,
            easing: 'out',
            startup: true
        };
    }
    biInfo.getChartAnimation = getChartAnimation;
    function getSingleResponse(response, nested) {
        if (response.data.status == "OK") {
            return {
                status: "OK",
                data: nested ? response.data.payload[0][0] : response.data.payload[0]
            };
        }
        else
            return {
                status: "Fail",
                data: nested ? response.data.payload[0][0] : response.data.payload[0]
            };
    }
    biInfo.getSingleResponse = getSingleResponse;
    function getDoubleResponse(response) {
        if ((response[0].data.status == "OK") && (response[1].data.status == "OK"))
            return {
                status: "OK"
            };
        else
            return {
                status: "Fail",
                data: response[0].data.status == "OK" ? response[1].data.payload[0] : response[0].data.payload[0]
            };
    }
    biInfo.getDoubleResponse = getDoubleResponse;
    function dayAndMonth(date) {
        return moment(date, "YYYY-MM-DD").format("MM/DD");
    }
    biInfo.dayAndMonth = dayAndMonth;
    function Hour(date) {
        return moment(date, "YYYY-MM-DD HH:mm:ss").format("HH");
    }
    biInfo.Hour = Hour;
    function toM(value, digits) {
        if (!digits)
            digits = 2;
        return (value / 1000000).toFixed(digits).toLocaleString() + "M";
    }
    biInfo.toM = toM;
    var ColorRange = (function () {
        function ColorRange(count) {
            var _this = this;
            this.count = count;
            this.bucket = 0;
            this.getColor = function (count) {
                if (count > _this.count)
                    count = count % _this.count;
                _this.bucket = _this.bucket == 0 ? 1 : 0;
                return _this.scales[_this.bucket](count);
            };
            this.scales = [
                d3.scaleLinear()
                    .domain([0, count])
                    .range(['orangered', 'royalblue']),
                d3.scaleLinear()
                    .domain([0, count])
                    .range(["#112231", "#ffd24d"])
            ];
        }
        return ColorRange;
    }());
    biInfo.ColorRange = ColorRange;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var DailyVolume = (function () {
        function DailyVolume(http, q) {
            this.http = http;
            this.q = q;
            this.name = "dailyvolume";
            this.data = [];
            this.defer = q.defer();
        }
        DailyVolume.prototype.init = function () {
            return this.defer.promise;
        };
        DailyVolume.prototype.load = function () {
            var _this = this;
            return this.q.all([
                this.http.get(apiurl + '/dailystpvolume'),
                this.http.get(apiurl + '/dailywarehousevolume')
            ]).then(function (response) {
                var ret = biInfo.getDoubleResponse(response);
                if (ret.status == "OK") {
                    ret.data = [];
                    for (var i = 0; i < response[0].data.payload[0].length; i++) {
                        var obj1 = response[0].data.payload[0][i];
                        var obj2 = response[1].data.payload[0][i];
                        ret.data.push({ date: biInfo.dayAndMonth(obj1.date), stp: obj1.volume, wh: obj2.volume });
                    }
                    _this.data = ret.data.reverse();
                    _this.defer.resolve();
                    return ret;
                }
                else
                    return ret;
            });
        };
        DailyVolume.prototype.update = function () {
            var _this = this;
            this.defer = this.q.defer();
            return this.q.all([
                this.http.get(apiurl + '/dailystpvolume?n=0'),
                this.http.get(apiurl + '/dailywarehousevolume?n=0')
            ]).then(function (response) {
                var ret = biInfo.getDoubleResponse(response);
                if (ret.status == "OK") {
                    var obj1 = response[0].data.payload[0][0];
                    var obj2 = response[1].data.payload[0][0];
                    var lastIndex = _this.data.length - 1;
                    var last = _this.data[lastIndex];
                    last.stp = obj1.volume;
                    last.wh = obj2.volume;
                    _this.defer.resolve();
                    return ret;
                }
                else
                    return ret;
            });
        };
        return DailyVolume;
    }());
    biInfo.DailyVolume = DailyVolume;
    var Revenue = (function () {
        function Revenue(http, q) {
            this.http = http;
            this.q = q;
            this.name = "revenue";
            this.data = [];
            this.defer = q.defer();
        }
        Revenue.prototype.init = function () {
            return this.defer.promise;
        };
        Revenue.prototype.load = function () {
            var _this = this;
            return this.q.all([
                this.http.get(apiurl + '/dailystprevenue'),
                this.http.get(apiurl + '/dailywarehouserevenue')
            ]).then(function (response) {
                var ret = biInfo.getDoubleResponse(response);
                if (ret.status == "OK") {
                    ret.data = [];
                    for (var i = 0; i < response[0].data.payload[0].length; i++) {
                        var obj1 = response[0].data.payload[0][i];
                        var obj2 = response[1].data.payload[0][i];
                        ret.data.push({ date: biInfo.dayAndMonth(obj1.date), stp: obj1.revenue, wh: obj2.revenue });
                    }
                    _this.data = ret.data.reverse();
                    _this.defer.resolve();
                    return ret;
                }
                else
                    return ret;
            });
        };
        Revenue.prototype.update = function () {
            var _this = this;
            this.defer = this.q.defer();
            return this.q.all([
                this.http.get(apiurl + '/dailystprevenue?n=0'),
                this.http.get(apiurl + '/dailywarehouserevenue?n=0')
            ]).then(function (response) {
                var ret = biInfo.getDoubleResponse(response);
                if (ret.status == "OK") {
                    var obj1 = response[0].data.payload[0][0];
                    var obj2 = response[1].data.payload[0][0];
                    var lastIndex = _this.data.length - 1;
                    var last = _this.data[lastIndex];
                    last.stp = obj1.revenue;
                    last.wh = obj2.revenue;
                    _this.defer.resolve();
                    return ret;
                }
                else
                    return ret;
            });
        };
        return Revenue;
    }());
    biInfo.Revenue = Revenue;
    var Yield = (function () {
        function Yield(volume, revenue, http, q) {
            this.volume = volume;
            this.revenue = revenue;
            this.http = http;
            this.q = q;
            this.name = "revenue";
            this.data = [];
        }
        Yield.prototype.calc = function () {
            var ret = { status: "OK", data: [] };
            for (var i = 0; i < this.volume.data.length; i++) {
                var vol = this.volume.data[i];
                var rev = this.revenue.data[i];
                var stp = vol.stp == 0 ? 0 : rev.stp / vol.stp;
                var wh = vol.wh == 0 ? 0 : rev.wh / vol.wh;
                ret.data.push({ date: vol.date, stp: stp, wh: wh });
            }
            this.data = ret.data;
            return ret;
        };
        Yield.prototype.load = function () {
            var _this = this;
            return this.q.all([
                this.volume.init(),
                this.revenue.init()
            ]).then(function () {
                return _this.calc();
            });
        };
        Yield.prototype.update = function () {
            var _this = this;
            return this.q.all([
                this.volume.init(),
                this.revenue.init()
            ]).then(function () {
                return _this.calc();
            });
        };
        return Yield;
    }());
    biInfo.Yield = Yield;
    var ActiveAccounts = (function () {
        function ActiveAccounts(http, q) {
            this.http = http;
            this.q = q;
            this.name = "accounts";
            this.data = [];
        }
        ActiveAccounts.prototype.load = function () {
            var _this = this;
            return this.http.get(apiurl + '/accountsactive?n=10')
                .then(function (response) {
                var ret = biInfo.getSingleResponse(response);
                if (ret.status == "OK") {
                    for (var i = 0; i < ret.data.length; i++) {
                        ret.data[i].date = biInfo.dayAndMonth(ret.data[i].date);
                    }
                    _this.data = ret.data.reverse();
                    return ret;
                }
                else
                    return ret;
            });
        };
        ActiveAccounts.prototype.update = function () {
            var _this = this;
            return this.http.get(apiurl + '/accountsactive?n=0')
                .then(function (response) {
                var ret = biInfo.getSingleResponse(response);
                if (ret.status == "OK") {
                    var lastIndex = _this.data.length - 1;
                    var last = _this.data[lastIndex];
                    last.count = ret.data.count;
                    return ret;
                }
                else
                    return ret;
            });
        };
        return ActiveAccounts;
    }());
    biInfo.ActiveAccounts = ActiveAccounts;
    function getFirstItems(data, count, key, divider) {
        if (divider)
            data.forEach(function (d) {
                d[key] /= divider;
            });
        data.sort(function (item1, item2) {
            return item2[key] - item1[key];
        });
        var result = {
            data: null,
            rest: 0,
            total: 0,
            negativeSum: 0,
            positiveSum: 0,
            min: 1e10,
            max: -1e10
        };
        for (var i = 0; i < data.length; i++) {
            result.total += Math.abs(data[i][key]);
            result.min = Math.min(result.min, data[i][key]);
            result.max = Math.max(result.max, data[i][key]);
            if (data[i][key] > 0)
                result.positiveSum += data[i][key];
            else
                result.negativeSum += data[i][key];
        }
        if (data.length > count) {
            result.data = data.splice(0, count);
            for (var i = 0; i < data.length; i++) {
                result.rest += data[i][key];
            }
        }
        else
            result.data = data;
        return result;
    }
    var Volume = (function () {
        function Volume(http, root) {
            this.http = http;
            this.root = root;
            this.name = "volumes";
            this.data = [];
        }
        Volume.prototype.load = function () {
            var _this = this;
            return this.http.get(this.url)
                .then(function (response) {
                var ret = biInfo.getSingleResponse(response);
                if (ret.status == "OK") {
                    var sorted = getFirstItems(ret.data, 9, "volume");
                    _this.data = sorted.data;
                    _this.data.forEach(function (d) {
                        var symbol = _this.root.instruments.getByName(d.symbol);
                        d.color = symbol.d3color;
                    });
                    _this.total = sorted.total;
                    if (sorted.rest > 0)
                        _this.data.push({ symbol: "Others", volume: sorted.rest, color: "rgb(0,0,0)" });
                    return ret;
                }
                else
                    return ret;
            });
        };
        Volume.prototype.update = function () {
            return this.load();
        };
        return Volume;
    }());
    var TodayVolume = (function (_super) {
        __extends(TodayVolume, _super);
        function TodayVolume(http, root) {
            _super.call(this, http, root);
            this.url = apiurl + '/orderflowbyinstrument';
        }
        return TodayVolume;
    }(Volume));
    biInfo.TodayVolume = TodayVolume;
    var MonthVolume = (function (_super) {
        __extends(MonthVolume, _super);
        function MonthVolume(http, root) {
            _super.call(this, http, root);
            this.url = apiurl + '/orderflowbyinstrument?monthly=true';
        }
        return MonthVolume;
    }(Volume));
    biInfo.MonthVolume = MonthVolume;
    var HourVolume = (function () {
        function HourVolume(http, root) {
            this.http = http;
            this.root = root;
            this.name = "flowBySymbol";
            this.data = [];
            this.currencies = [];
        }
        HourVolume.prototype.load = function () {
            var _this = this;
            return this.http.get(apiurl + '/hourvolume')
                .then(function (response) {
                var ret = biInfo.getSingleResponse(response);
                if (ret.status == "OK") {
                    var groupped = d3.nest()
                        .key(function (d) {
                        return d.hour;
                    })
                        .entries(ret.data);
                    _this.total = 0;
                    _this.min = 1e10;
                    _this.max = -1e10;
                    _this.negative = 0;
                    _this.positive = 0;
                    var count = ret.data.length;
                    if (count > 0) {
                        groupped.forEach(function (d) {
                            d.value = groupped.length;
                            d.date = d.key;
                            var sorted = getFirstItems(d.values, 9, "volume");
                            d.volumes = sorted.data;
                            d.total = sorted.total;
                            d.min = sorted.min;
                            d.max = sorted.max;
                            _this.min = Math.min(_this.min, d.min);
                            _this.max = Math.max(_this.max, d.max);
                            _this.negative = Math.min(_this.negative, sorted.negativeSum);
                            _this.positive = Math.max(_this.positive, sorted.positiveSum);
                            _this.total += sorted.total;
                            if (sorted.rest > 0)
                                d.volumes.push({ currency: "Others", volume: sorted.rest });
                        });
                    }
                    _this.data = groupped;
                    _this.currencies = ret.data.map(function (d) {
                        return d.symbol;
                    });
                    _this.currencies = _this.currencies.filter(function (d, i) {
                        return _this.currencies.indexOf(d) == i;
                    });
                    _this.currencies = _this.currencies.map(function (d) {
                        var symbol = _this.root.instruments.getByName(d);
                        return { symbol: d, color: symbol.d3color };
                    });
                    return ret;
                }
                else
                    return ret;
            });
        };
        HourVolume.prototype.update = function () {
            return this.load();
        };
        return HourVolume;
    }());
    biInfo.HourVolume = HourVolume;
    function calcTotal(data, key) {
        var total = data.reduce(function (a, b) {
            return a + b[key];
        }, 0);
        return total;
    }
    var VolumeLP = (function () {
        function VolumeLP(http) {
            this.http = http;
            this.name = "volumeLP";
            this.data = [];
        }
        VolumeLP.prototype.load = function () {
            var _this = this;
            return this.http.get(apiurl + '/volumebylp')
                .then(function (response) {
                var ret = biInfo.getSingleResponse(response);
                if (ret.status == "OK") {
                    _this.data = ret.data;
                    return ret;
                }
                else
                    return ret;
            });
        };
        VolumeLP.prototype.update = function () {
            return this.load();
        };
        return VolumeLP;
    }());
    biInfo.VolumeLP = VolumeLP;
    var VolumeByUnit = (function () {
        function VolumeByUnit(http) {
            this.http = http;
            this.name = "volumeByUnit";
            this.data = [];
        }
        VolumeByUnit.prototype.load = function () {
            var _this = this;
            return this.http.get(apiurl + '/orderflowbyunit')
                .then(function (response) {
                var ret = biInfo.getSingleResponse(response);
                if (ret.status == "OK") {
                    _this.data = ret.data;
                    _this.total = calcTotal(_this.data, 'volume');
                    return ret;
                }
                else
                    return ret;
            });
        };
        VolumeByUnit.prototype.update = function () {
            return this.load();
        };
        return VolumeByUnit;
    }());
    biInfo.VolumeByUnit = VolumeByUnit;
    var biStorage = (function () {
        function biStorage(http, q, root) {
            this.dailyvolume = new DailyVolume(http, q);
            this.revenue = new Revenue(http, q);
            this.yield = new Yield(this.dailyvolume, this.revenue, http, q);
            this.accounts = new ActiveAccounts(http, q);
            this.todayvolume = new TodayVolume(http, root);
            this.monthvolume = new MonthVolume(http, root);
            this.hourvolume = new HourVolume(http, root);
            this.lpvolume = new VolumeLP(http);
            this.unitvolume = new VolumeByUnit(http);
        }
        return biStorage;
    }());
    biInfo.biStorage = biStorage;
    angular
        .module("portal")
        .factory("$biInfo", function ($http, $q, $rootScope) {
        return new biStorage($http, $q, $rootScope);
    });
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var Chart = (function () {
        function Chart() {
            var _this = this;
            this.reloading = false;
            this.updating = false;
            this.loaded = false;
            this.thumbnail = true;
            this.bindElements = function () {
                $(_this.chartId).data('chart', _this);
                _this.graph = $(_this.chartId + ' .bi-graph');
                _this.graphEl = $(_this.chartId + ' .graph-content');
                _this.loadingEl = $(_this.chartId + ' .chart-loading');
                _this.updatingEl = $(_this.chartId + ' .chart-updating');
                _this.errorEl = $(_this.chartId + ' .chart-error');
                _this.graphEl.bind('redraw', function () {
                    if (_this.loaded)
                        _this.createChart();
                });
                _this.loadingEl.append('<i class="fa fa-spinner fa-spin"></i>');
                _this.updatingEl.append('<i class="fa fa-spinner fa-spin"></i>');
            };
            this.init = function () {
                _this.bindElements();
                if (_this.chartData.data.length == 0) {
                    _this.load().then(function (result) {
                        if (result) {
                            _this.loaded = true;
                        }
                    });
                }
                else {
                    _this.createChart();
                    _this.loaded = true;
                }
            };
            this.update = function () {
                if (_this.reloading)
                    return;
                if (_this.updating)
                    return;
                _this.updating = true;
                _this.updatingEl.fadeIn();
                setTimeout(function () {
                    _this.updateData().then(function (response) {
                        if (response.status == "OK") {
                            _this.updatingEl.hide();
                            _this.updateChart();
                            _this.chartData.lastupdate = moment.utc();
                        }
                        _this.updating = false;
                    });
                }, 1000);
            };
            this.load = function () {
                _this.errorEl.hide();
                _this.graphEl.hide();
                _this.loadingEl.fadeIn();
                return _this.loadData()
                    .then(function (response) {
                    if (response.status == "OK") {
                        if (_this.chartData.data.length > 0) {
                            _this.loadingEl.hide();
                            _this.createChart();
                            _this.chartData.lastupdate = moment.utc().seconds(0);
                            _this.chartData.lastload = moment.utc().seconds(0);
                            return true;
                        }
                        else {
                            _this.loadingEl.hide();
                            _this.errorEl.html('Empty response');
                            _this.errorEl.fadeIn();
                            return false;
                        }
                    }
                    else {
                        _this.loadingEl.hide();
                        _this.errorEl.html(response.data);
                        _this.errorEl.fadeIn();
                        return false;
                    }
                }, function (response) {
                    _this.loadingEl.hide();
                    _this.errorEl.html('Error. HTTP status ' + response.status + '<br>' + response.statusText);
                    _this.errorEl.fadeIn();
                    return false;
                });
            };
        }
        Chart.prototype.createChart = function () {
            this.graphEl.empty();
            this.loadingEl.hide();
            this.graphEl.fadeIn();
        };
        return Chart;
    }());
    biInfo.Chart = Chart;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    angular
        .module('portal')
        .controller('biInfoCtrl', function ($scope, $rootScope, $biInfo) {
        $rootScope.activePage = "biInfo";
        var interval;
        var volumeChart, revenueChart, yieldChart, accountsChart, todayVolumeChart, monthVolumeChart, unitVolumeChart, lpVolumeChart, hourVolumeChart;
        var startOfTheDay = moment.utc(moment().format('YYYY-MM-DD') + "T17:00:00-05:00").subtract(1, "days");
        $scope.Minimize = function (el, panel) {
        };
        $scope.Maximize = function (el, panel) {
            var chart = $(el).data('chart');
            chart.thumbnail = false;
            chart.graph.removeClass('small-graph');
            chart.graph.addClass('expanded-graph');
            chart.graphEl.trigger('redraw');
        };
        $scope.Minimize = function (el, panel) {
            var chart = $(el).data('chart');
            chart.thumbnail = true;
            chart.graph.removeClass('expanded-graph');
            chart.graph.addClass('small-graph');
            chart.graphEl.trigger('redraw');
        };
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
        }
        function update() {
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
    });
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var d3PieChart = (function (_super) {
        __extends(d3PieChart, _super);
        function d3PieChart(chartId, chartData) {
            var _this = this;
            _super.call(this);
            this.infoSize = "18px";
            this.legendYshift = 20;
            this.tweenPie = function (finish) {
                var start = {
                    startAngle: 0,
                    endAngle: 0
                };
                var interpolator = d3.interpolate(start, finish);
                return function (t) {
                    return _this.arc(interpolator(t));
                };
            };
            this.tweenArc = function (outerRadius, delay) {
                return function () {
                    d3.select(this).transition().delay(delay).attrTween("d", function (d) {
                        var _this = this;
                        var i = d3.interpolate(d.outerRadius, outerRadius);
                        return function (t) {
                            d.outerRadius = i(t);
                            return _this.arc(d);
                        };
                    });
                };
            };
            this.explodePie = function (d, i) {
                var offset = (i == 9) ? 10 : 0;
                var angle = (d.startAngle + d.endAngle) / 2;
                var xOff = Math.sin(angle) * offset;
                var yOff = -Math.cos(angle) * offset;
                return "translate(" + xOff + "," + yOff + ")";
            };
            this.setInfoText = function (values, delay) {
                _this.infoText.transition()
                    .delay(delay)
                    .on("start", function () {
                    for (var i = 0; i < values.length; i++) {
                        _this.infoLines[i].text(values[i]);
                    }
                });
            };
            this.createInfoText = function () {
                _this.infoLines = [];
                _this.infoText = _this.chart.append("g");
                return _this.infoText;
            };
            this.createInfoLine = function () {
                var text = _this.infoText.append("text")
                    .attr("text-anchor", "middle")
                    .attr("font-family", "Arial")
                    .attr("font-size", _this.infoSize)
                    .attr("font-weight", "bold");
                _this.infoLines.push(text);
                return text;
            };
            this.chartData = chartData;
            this.chartId = chartId;
            this.radiusRatio = 0.5;
            this.init();
        }
        d3PieChart.prototype.createChart = function () {
            _super.prototype.createChart.call(this);
            this.width = this.graphEl.width();
            this.height = this.graphEl.height();
            this.margin = this.thumbnail ? 10 : 30;
            this.outerRadius = Math.min(this.width, this.height) / 2 - this.margin;
            this.innerRadius = this.outerRadius * this.radiusRatio;
            this.svg = d3.select(this.chartId + ' .graph-content')
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);
            var trans = this.thumbnail ? this.width / 2 + "," + this.height / 2 :
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
                    .style("opacity", 0);
                this.createLegend();
                var el = $(this.chartId + ' .bi-legend').get(0);
                var lw = el.getBBox().width;
                this.legend.attr("transform", "translate(" + (this.width - lw - 10) + ",10)");
                this.legend.transition()
                    .duration(1000)
                    .style("opacity", 1);
            }
        };
        d3PieChart.prototype.updateData = function () {
            return this.chartData.load()
                .then(function (ret) {
                return ret;
            });
        };
        d3PieChart.prototype.loadData = function () {
            return this.chartData.load();
        };
        d3PieChart.prototype.updateChart = function () {
            this.createChart();
        };
        return d3PieChart;
    }(biInfo.Chart));
    biInfo.d3PieChart = d3PieChart;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var SymbolVolumeChart = (function (_super) {
        __extends(SymbolVolumeChart, _super);
        function SymbolVolumeChart(chartId, chartData) {
            _super.call(this, chartId, chartData);
        }
        SymbolVolumeChart.prototype.createColors = function () {
        };
        SymbolVolumeChart.prototype.initD3 = function () {
            this.arc = d3.arc()
                .innerRadius(this.innerRadius)
                .padAngle(0.01);
            this.pie = d3.pie()
                .sort(null)
                .value(function (d) {
                return d.volume;
            })(this.chartData.data);
        };
        SymbolVolumeChart.prototype.buildPies = function () {
            var _this = this;
            var self = this;
            var path = this.chart.selectAll("path")
                .data(this.pie)
                .enter().append("path")
                .each(function (d, i) {
                d.color = d.data.color;
                d.outerRadius = _this.outerRadius;
                d.total = _this.chartData.total;
            })
                .attr("fill", function (d, i) {
                return d.color;
            })
                .attr("d", this.arc)
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut)
                .transition()
                .duration(750)
                .attrTween("d", this.tweenPie);
            function handleMouseOver(d) {
                if (self.thumbnail)
                    return;
                d3.select(this).transition().delay(0).attrTween("d", function (d) {
                    var interpolator = d3.interpolate(d.outerRadius, self.outerRadius + 20);
                    return function (t) {
                        d.outerRadius = interpolator(t);
                        return self.arc(d);
                    };
                });
                self.setInfoText([d.data.symbol, biInfo.toM(d.value)], 100);
            }
            function handleMouseOut(d) {
                if (self.thumbnail)
                    return;
                d3.select(this).transition().delay(150).attrTween("d", function (d) {
                    var interpolator = d3.interpolate(d.outerRadius, self.outerRadius);
                    return function (t) {
                        d.outerRadius = interpolator(t);
                        return self.arc(d);
                    };
                });
                setDefaultInfoText(500);
            }
            var setDefaultInfoText = function (delay) {
                _this.setInfoText(["Total", biInfo.toM(_this.chartData.total)], delay);
            };
            if (!self.thumbnail)
                setDefaultInfoText(800);
        };
        SymbolVolumeChart.prototype.createExtras = function () {
            var _this = this;
            this.chart.selectAll(".bi-symbol-label")
                .data(this.pie)
                .enter().append("text")
                .attr("opacity", 0)
                .attr("class", "bi-symbol-label")
                .attr("transform", function (d) {
                return "translate(" + _this.arc.centroid(d) + ")" + " rotate(" + angle(d) + ")";
            })
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .style("pointer-events", "none")
                .attr("dy", "4")
                .text(function (d) {
                if ((d.endAngle - d.startAngle) > 0.1)
                    return d.data.symbol;
                else
                    return '';
            })
                .transition()
                .duration(1000)
                .style("opacity", 1);
            function angle(d) {
                var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
                return a > 90 ? a - 180 : a;
            }
        };
        SymbolVolumeChart.prototype.createLegend = function () {
            var _this = this;
            this.legend.selectAll('rect .legend')
                .data(this.pie)
                .enter()
                .append("rect")
                .attr("class", "legend")
                .attr("x", 0)
                .attr("y", function (d, i) {
                return i * _this.legendYshift;
            })
                .attr("width", 20)
                .attr("height", 10)
                .attr("fill", function (d, i) {
                return d.color;
            });
            var legentText = this.legend.selectAll('text')
                .data(this.pie)
                .enter()
                .append("text")
                .attr("x", 30)
                .attr("y", function (d, i) {
                return i * _this.legendYshift + 9;
            })
                .attr("text-anchor", "start");
            legentText.append('tspan')
                .attr("class", "symbol")
                .text(function (d, i) {
                return d.data.symbol;
            });
            legentText.append('tspan')
                .attr("class", "value")
                .text(function (d, i) {
                return " " + biInfo.toM(d.value);
            });
        };
        return SymbolVolumeChart;
    }(biInfo.d3PieChart));
    biInfo.SymbolVolumeChart = SymbolVolumeChart;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var ActiveAccountsChart = (function (_super) {
        __extends(ActiveAccountsChart, _super);
        function ActiveAccountsChart(chartId, chartData) {
            _super.call(this);
            this.chartData = chartData;
            this.chartId = chartId;
            this.init();
        }
        ActiveAccountsChart.prototype.createChart = function () {
            _super.prototype.createChart.call(this);
            this.fillTable();
            var hAxis = this.thumbnail ? { textPosition: 'none' } : { slantedText: true };
            this.chartOptions = {
                legend: 'none',
                animation: biInfo.getChartAnimation(),
                enableInteractivity: !this.thumbnail,
                hAxis: hAxis,
                vAxis: { format: 'short' }
            };
            this.chart = new google.visualization.AreaChart(this.graphEl[0]);
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        ActiveAccountsChart.prototype.fillTable = function () {
            var _this = this;
            this.dataTable = new google.visualization.DataTable();
            this.dataTable.addColumn('string', 'date');
            this.dataTable.addColumn('number', 'count');
            this.chartData.data.forEach(function (obj) {
                _this.dataTable.addRow([obj.date, obj.count]);
            });
        };
        ActiveAccountsChart.prototype.updateData = function () {
            var _this = this;
            return this.chartData.update()
                .then(function (ret) {
                if (ret.status == "OK") {
                    var lastIndex = _this.chartData.data.length - 1;
                    var last = _this.chartData.data[lastIndex];
                    _this.dataTable.setValue(lastIndex, 1, last.count);
                    return ret;
                }
                else
                    return ret;
            });
        };
        ActiveAccountsChart.prototype.updateChart = function () {
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        ActiveAccountsChart.prototype.loadData = function () {
            return this.chartData.load();
        };
        return ActiveAccountsChart;
    }(biInfo.Chart));
    biInfo.ActiveAccountsChart = ActiveAccountsChart;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var VolumeChart = (function (_super) {
        __extends(VolumeChart, _super);
        function VolumeChart(chartId, chartData) {
            _super.call(this);
            this.chartData = chartData;
            this.chartId = chartId;
            this.init();
        }
        VolumeChart.prototype.createChart = function () {
            _super.prototype.createChart.call(this);
            this.fillTable();
            var hAxis = this.thumbnail ? { textPosition: 'none' } : { slantedText: true };
            this.chartOptions = {
                colors: ['orangered', 'royalblue'],
                enableInteractivity: !this.thumbnail,
                animation: biInfo.getChartAnimation(),
                hAxis: hAxis,
                vAxis: { format: 'short' },
                isStacked: true
            };
            this.chart = new google.visualization.ColumnChart(this.graphEl[0]);
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        VolumeChart.prototype.fillTable = function () {
            var _this = this;
            this.dataTable = new google.visualization.DataTable();
            this.dataTable.addColumn('string', 'date');
            this.dataTable.addColumn('number', 'WH');
            this.dataTable.addColumn('number', 'STP');
            this.chartData.data.forEach(function (obj) {
                _this.dataTable.addRow([obj.date, obj.wh, obj.stp]);
            });
        };
        VolumeChart.prototype.updateData = function () {
            var _this = this;
            return this.chartData.update()
                .then(function (ret) {
                if (ret.status == "OK") {
                    var lastIndex = _this.chartData.data.length - 1;
                    var last = _this.chartData.data[lastIndex];
                    _this.dataTable.setValue(lastIndex, 1, last.wh);
                    _this.dataTable.setValue(lastIndex, 2, last.stp);
                    return ret;
                }
                else
                    return ret;
            });
        };
        VolumeChart.prototype.updateChart = function () {
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        VolumeChart.prototype.loadData = function () {
            return this.chartData.load();
        };
        return VolumeChart;
    }(biInfo.Chart));
    biInfo.VolumeChart = VolumeChart;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var LPVolumeChart = (function (_super) {
        __extends(LPVolumeChart, _super);
        function LPVolumeChart(chartId, chartData) {
            _super.call(this);
            this.chartData = chartData;
            this.chartId = chartId;
            this.init();
        }
        LPVolumeChart.prototype.createChart = function () {
            _super.prototype.createChart.call(this);
            this.fillTable();
            var hAxis = this.thumbnail ? { textPosition: 'none' } : { slantedText: true, scaleType: 'log' };
            this.chartOptions = {
                legend: 'none',
                animation: biInfo.getChartAnimation(),
                enableInteractivity: !this.thumbnail,
                hAxis: hAxis,
                vAxis: { format: 'short' },
                isStacked: true
            };
            this.chart = new google.visualization.BarChart(this.graphEl[0]);
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        LPVolumeChart.prototype.fillTable = function () {
            var _this = this;
            this.dataTable = new google.visualization.DataTable();
            this.dataTable.addColumn('string', 'name');
            this.dataTable.addColumn('number', 'volume');
            this.dataTable.addColumn({ 'type': 'string', 'role': 'style' });
            this.chartData.data.forEach(function (obj) {
                var color = '';
                if (obj.bank.toUpperCase() == "WAREHOUSE")
                    color = "orangered";
                _this.dataTable.addRow([obj.bank, obj.volume, color]);
            });
        };
        LPVolumeChart.prototype.updateData = function () {
            return this.chartData.load()
                .then(function (ret) {
                return ret;
            });
        };
        LPVolumeChart.prototype.updateChart = function () {
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        LPVolumeChart.prototype.loadData = function () {
            return this.chartData.load();
        };
        return LPVolumeChart;
    }(biInfo.Chart));
    biInfo.LPVolumeChart = LPVolumeChart;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var UnitsVolumeChart = (function (_super) {
        __extends(UnitsVolumeChart, _super);
        function UnitsVolumeChart(chartId, chartData) {
            _super.call(this, chartId, chartData);
        }
        UnitsVolumeChart.prototype.createColors = function () {
            this.colors = new biInfo.ColorRange(this.chartData.data.length);
        };
        UnitsVolumeChart.prototype.initD3 = function () {
            this.arc = d3.arc()
                .innerRadius(this.innerRadius)
                .padAngle(0.03);
            this.pie = d3.pie()
                .sort(null)
                .value(function (d) {
                return d.volume;
            })(this.chartData.data);
        };
        UnitsVolumeChart.prototype.buildPies = function () {
            var _this = this;
            var self = this;
            var path = this.chart.selectAll("path")
                .data(this.pie)
                .enter().append("path")
                .each(function (d, i) {
                d.outerRadius = _this.outerRadius;
                d.color = _this.colors.getColor(i);
            })
                .attr("fill", function (d, i) {
                return d.color;
            })
                .attr("d", this.arc)
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut)
                .transition()
                .duration(750)
                .attrTween("d", this.tweenPie);
            function handleMouseOver(d) {
                if (self.thumbnail)
                    return;
                d3.select(this).transition().delay(0).attrTween("d", function (d) {
                    var interpolator = d3.interpolate(d.outerRadius, self.outerRadius + 20);
                    return function (t) {
                        d.outerRadius = interpolator(t);
                        return self.arc(d);
                    };
                });
                self.setInfoText([d.data.unit, biInfo.toM(d.value)], 100);
            }
            function handleMouseOut(d) {
                if (self.thumbnail)
                    return;
                d3.select(this).transition().delay(150).attrTween("d", function (d) {
                    var interpolator = d3.interpolate(d.outerRadius, self.outerRadius);
                    return function (t) {
                        d.outerRadius = interpolator(t);
                        return self.arc(d);
                    };
                });
                setDefaultInfoText(500);
            }
            var setDefaultInfoText = function (delay) {
                _this.setInfoText(["Total", biInfo.toM(_this.chartData.total)], delay);
            };
            if (!self.thumbnail)
                setDefaultInfoText(800);
        };
        UnitsVolumeChart.prototype.createLegend = function () {
            var _this = this;
            this.legend.selectAll('rect .legend')
                .data(this.pie)
                .enter()
                .append("rect")
                .attr("class", "legend")
                .attr("x", 0)
                .attr("y", function (d, i) {
                return i * _this.legendYshift;
            })
                .attr("width", 20)
                .attr("height", 10)
                .attr("fill", function (d, i) {
                return d.color;
            });
            var legentText = this.legend.selectAll('text')
                .data(this.pie)
                .enter()
                .append("text")
                .attr("x", 30)
                .attr("y", function (d, i) {
                return i * _this.legendYshift + 9;
            })
                .attr("text-anchor", "start");
            legentText.append('tspan')
                .attr("class", "label")
                .text(function (d, i) {
                return d.data.unit;
            });
            legentText.append('tspan')
                .attr("class", "value")
                .text(function (d, i) {
                return " " + biInfo.toM(d.value);
            });
        };
        UnitsVolumeChart.prototype.createExtras = function () {
        };
        return UnitsVolumeChart;
    }(biInfo.d3PieChart));
    biInfo.UnitsVolumeChart = UnitsVolumeChart;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var RevenueChart = (function (_super) {
        __extends(RevenueChart, _super);
        function RevenueChart(chartId, chartData) {
            _super.call(this);
            this.chartData = chartData;
            this.chartId = chartId;
            this.init();
        }
        RevenueChart.prototype.createChart = function () {
            _super.prototype.createChart.call(this);
            this.fillTable();
            var hAxis = this.thumbnail ? { textPosition: 'none' } : { slantedText: true };
            this.chartOptions = {
                colors: ['orangered', 'royalblue'],
                enableInteractivity: !this.thumbnail,
                animation: biInfo.getChartAnimation(),
                hAxis: hAxis,
                vAxis: { format: 'short' },
                isStacked: true
            };
            this.chart = new google.visualization.SteppedAreaChart(this.graphEl[0]);
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        RevenueChart.prototype.fillTable = function () {
            var _this = this;
            this.dataTable = new google.visualization.DataTable();
            this.dataTable.addColumn('string', 'date');
            this.dataTable.addColumn('number', 'WH');
            this.dataTable.addColumn('number', 'STP');
            this.chartData.data.forEach(function (obj) {
                _this.dataTable.addRow([obj.date, obj.wh, obj.stp]);
            });
        };
        RevenueChart.prototype.updateData = function () {
            var _this = this;
            return this.chartData.update()
                .then(function (ret) {
                if (ret.status == "OK") {
                    var lastIndex = _this.chartData.data.length - 1;
                    var last = _this.chartData.data[lastIndex];
                    _this.dataTable.setValue(lastIndex, 1, last.wh);
                    _this.dataTable.setValue(lastIndex, 2, last.stp);
                    return ret;
                }
                else
                    return ret;
            });
        };
        RevenueChart.prototype.updateChart = function () {
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        RevenueChart.prototype.loadData = function () {
            return this.chartData.load();
        };
        return RevenueChart;
    }(biInfo.Chart));
    biInfo.RevenueChart = RevenueChart;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var HourVolumeChart = (function (_super) {
        __extends(HourVolumeChart, _super);
        function HourVolumeChart(chartId, chartData) {
            _super.call(this, chartId, chartData);
            this.margin = 70;
            this.infoSize = "14px";
        }
        HourVolumeChart.prototype.createColors = function () {
        };
        HourVolumeChart.prototype.initD3 = function () {
            var _this = this;
            this.currencies = {};
            this.chartData.currencies.forEach(function (d, i) {
                _this.currencies[d.symbol] = { color: d.color };
            });
            this.rScale = d3.scaleLinear()
                .domain([this.chartData.negative, this.chartData.positive])
                .range([this.innerRadius, this.outerRadius]);
            this.arc = d3.arc()
                .padAngle(0.01);
            this.pie = d3.pie()
                .sort(null)
                .value(function (d) {
                return d.value;
            })(this.chartData.data);
        };
        HourVolumeChart.prototype.buildPies = function () {
            var _this = this;
            var self = this;
            var pies = this.chart.selectAll(".pie")
                .data(this.pie)
                .enter().append("g")
                .attr("class", "pie");
            function tweenSector(d) {
                var start = { outerRadius: d.innerRadius };
                var interpolator = d3.interpolate(start, d);
                return function (t) {
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
                    .each(function (d, i) {
                    d.startAngle = p.startAngle;
                    d.endAngle = p.endAngle;
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
                    .attr("fill", function (d, i) {
                    return d.color;
                })
                    .attr("d", self.arc)
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut)
                    .transition().duration(750).attrTween("d", function (d) {
                    return d.index == 0 ? tweenSector(d) : self.tweenPie(d);
                });
            });
            function handleMouseOver(d) {
                if (self.thumbnail)
                    return;
                d3.select(this).transition().duration(200)
                    .attr("stroke", "white")
                    .attr("stroke-width", 4);
                self.setInfoText([d.symbol, biInfo.toM(d.volume)], 100);
            }
            function handleMouseOut(d) {
                if (self.thumbnail)
                    return;
                d3.select(this).transition().duration(200)
                    .attr("fill", d.color)
                    .attr("stroke-width", 0);
                setDefaultInfoText(500);
            }
            var setDefaultInfoText = function (delay) {
                _this.setInfoText(["Total", biInfo.toM(_this.chartData.total)], delay);
            };
            if (!self.thumbnail)
                setDefaultInfoText(800);
        };
        HourVolumeChart.prototype.createLegend = function () {
            var _this = this;
            this.legend.selectAll('rect')
                .data(this.chartData.currencies)
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", function (d, i) {
                return i * _this.legendYshift;
            })
                .attr("width", 20)
                .attr("height", 10)
                .attr("fill", function (d, i) {
                return d.color;
            });
            var legentText = this.legend.selectAll('text')
                .data(this.chartData.currencies)
                .enter()
                .append("text")
                .attr("x", 30)
                .attr("y", function (d, i) {
                return i * _this.legendYshift + 9;
            })
                .attr("text-anchor", "start");
            legentText.append('tspan')
                .attr("class", "currency")
                .text(function (d, i) {
                return d.symbol;
            });
        };
        HourVolumeChart.prototype.createExtras = function () {
            var self = this;
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
                    .innerRadius(d.maxRadius + 10);
                return arc(d);
            });
            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle) / 2;
            }
            var arc = d3.arc()
                .outerRadius(this.outerRadius)
                .innerRadius(this.innerRadius);
            var textArc = d3.arc()
                .outerRadius(this.outerRadius + 10)
                .innerRadius(this.outerRadius + 10);
            this.chart.selectAll(".date-text")
                .data(this.pie)
                .enter().append("text")
                .attr("font-size", "11px")
                .attr("class", "date-text")
                .attr("dy", "0.25em")
                .text(function (d) {
                return moment(d.data.date, "YYYY-MM-DD HH:mm:ss").format("MM/DD HH:mm");
            })
                .attr("text-anchor", function (d) {
                return midAngle(d) < Math.PI ? "start" : "end";
            })
                .attr("transform", function (d) {
                var pos = textArc.centroid(d);
                pos[0] = textArc.outerRadius()() * (midAngle(d) < Math.PI ? 1 : -1);
                return "translate(" + pos + ")";
            });
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
            });
        };
        return HourVolumeChart;
    }(biInfo.d3PieChart));
    biInfo.HourVolumeChart = HourVolumeChart;
})(biInfo || (biInfo = {}));
var biInfo;
(function (biInfo) {
    var YieldChart = (function (_super) {
        __extends(YieldChart, _super);
        function YieldChart(chartId, chartData) {
            _super.call(this);
            this.chartData = chartData;
            this.chartId = chartId;
            this.init();
        }
        YieldChart.prototype.createChart = function () {
            _super.prototype.createChart.call(this);
            this.fillTable();
            var hAxis = this.thumbnail ? { textPosition: 'none' } : { slantedText: true };
            this.chartOptions = {
                enableInteractivity: !this.thumbnail,
                colors: ['orangered', 'royalblue'],
                animation: biInfo.getChartAnimation(),
                hAxis: hAxis,
                vAxis: { format: 'short' }
            };
            this.chart = new google.visualization.ColumnChart(this.graphEl[0]);
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        YieldChart.prototype.fillTable = function () {
            var _this = this;
            this.dataTable = new google.visualization.DataTable();
            this.dataTable.addColumn('string', 'date');
            this.dataTable.addColumn('number', 'WH');
            this.dataTable.addColumn('number', 'STP');
            this.chartData.data.forEach(function (obj) {
                _this.dataTable.addRow([obj.date, obj.wh, obj.stp]);
            });
        };
        YieldChart.prototype.updateData = function () {
            var _this = this;
            return this.chartData.update()
                .then(function (ret) {
                if (ret.status == "OK") {
                    var lastIndex = _this.chartData.data.length - 1;
                    var last = _this.chartData.data[lastIndex];
                    _this.dataTable.setValue(lastIndex, 1, last.wh);
                    _this.dataTable.setValue(lastIndex, 2, last.stp);
                    return ret;
                }
                else
                    return ret;
            });
        };
        YieldChart.prototype.updateChart = function () {
            this.chart.draw(this.dataTable, this.chartOptions);
        };
        YieldChart.prototype.loadData = function () {
            return this.chartData.load();
        };
        return YieldChart;
    }(biInfo.Chart));
    biInfo.YieldChart = YieldChart;
})(biInfo || (biInfo = {}));
//# sourceMappingURL=application.js.map