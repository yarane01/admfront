/// <reference path="../../ts/moment.d.ts" />
/// <reference path="../../ts/angular.d.ts" />
/// <reference path="misc.ts" />

namespace biInfo {
    declare var d3: any;
    declare var apiurl: string;

    export interface Interval {
        value: number;
        units: string;
    }

    export interface ChartData {
        name: string;
        data: any[];
        total?: number;
        lastupdate?: moment.Moment;
        lastload?: moment.Moment;
        init?(): angular.IPromise <void>;
        load(): angular.IPromise <biInfo.Response>;
        update(): angular.IPromise <biInfo.Response>;
    }

    export class DailyVolume implements ChartData {
        name = "dailyvolume";
        data = [];
        defer;

        constructor(private http, private q) {
            this.defer = q.defer();
        }

        init() {
            return this.defer.promise;
        }

        load() {
            return this.q.all([
                this.http.get(apiurl + '/dailystpvolume'),
                this.http.get(apiurl + '/dailywarehousevolume')
            ]).then((response) => {
                var ret = getDoubleResponse(response);
                if (ret.status == "OK") {
                    ret.data = [];
                    for (var i = 0; i < response[0].data.payload[0].length; i++) {
                        var obj1 = response[0].data.payload[0][i];
                        var obj2 = response[1].data.payload[0][i];
                        ret.data.push({date: dayAndMonth(obj1.date), stp: obj1.volume, wh: obj2.volume})
                    }
                    this.data = ret.data.reverse();
                    // this.chartData.data.push({date: 'Today', stp: 0, wh: 0});
                    // this.data.push({
                    //     date: 'Today',
                    //     stp: Math.random() * 1000000,
                    //     wh: Math.random() * 1000000
                    // });

                    this.defer.resolve();
                    return ret;
                }
                else
                    return ret;
            })
        }

        update() {
            this.defer = this.q.defer();
            return this.q.all([
                this.http.get(apiurl + '/dailystpvolume?n=0'),
                this.http.get(apiurl + '/dailywarehousevolume?n=0')
            ]).then((response) => {
                    var ret = getDoubleResponse(response);
                    if (ret.status == "OK") {
                        var obj1 = response[0].data.payload[0][0];
                        var obj2 = response[1].data.payload[0][0];
                        var lastIndex = this.data.length - 1;
                        var last = this.data[lastIndex];
                        last.stp = obj1.volume;
                        last.wh = obj2.volume;
                        this.defer.resolve();
                        return ret;
                    }
                    else
                        return ret;
                }
            )
        }

    }

    export class Revenue implements ChartData {
        name = "revenue";
        data = [];
        defer;

        constructor(private http, private q) {
            this.defer = q.defer();
        }

        init() {
            return this.defer.promise;
        }

        load(): angular.IPromise<biInfo.Response> {
            return this.q.all([
                this.http.get(apiurl + '/dailystprevenue'),
                this.http.get(apiurl + '/dailywarehouserevenue')
            ]).then((response) => {
                var ret = getDoubleResponse(response);
                if (ret.status == "OK") {
                    ret.data = [];
                    for (var i = 0; i < response[0].data.payload[0].length; i++) {
                        var obj1 = response[0].data.payload[0][i];
                        var obj2 = response[1].data.payload[0][i];
                        ret.data.push({date: dayAndMonth(obj1.date), stp: obj1.revenue, wh: obj2.revenue})
                    }
                    this.data = ret.data.reverse();
                    // this.chartData.data.push({date: 'Today', stp: 0, wh: 0});
                    // this.data.push({
                    //     date: 'Today',
                    //     stp: Math.random() * 1000,
                    //     wh: Math.random() * 1000
                    // });

                    this.defer.resolve();
                    return ret;
                }
                else return ret;
            })
        }


        update(): angular.IPromise<biInfo.Response> {
            this.defer = this.q.defer();
            return this.q.all([
                this.http.get(apiurl + '/dailystprevenue?n=0'),
                this.http.get(apiurl + '/dailywarehouserevenue?n=0')
            ]).then((response) => {
                    var ret = getDoubleResponse(response);
                    if (ret.status == "OK") {
                        var obj1 = response[0].data.payload[0][0];
                        var obj2 = response[1].data.payload[0][0];
                        var lastIndex = this.data.length - 1;
                        var last = this.data[lastIndex];
                        last.stp = obj1.revenue;
                        last.wh = obj2.revenue;
                        this.defer.resolve();
                        return ret;
                    }
                    else
                        return ret;
                }
            )
        }
    }


    export class Yield implements ChartData {
        name = "revenue";
        data = [];

        constructor(private volume: DailyVolume,
                    private revenue: Revenue,
                    private http,
                    private q) {
        }

        calc() {
            var ret = {status: "OK", data: []};
            for (var i = 0; i < this.volume.data.length; i++) {
                var vol = this.volume.data[i];
                var rev = this.revenue.data[i];
                var stp = vol.stp == 0 ? 0 : rev.stp / vol.stp;
                var wh = vol.wh == 0 ? 0 : rev.wh / vol.wh;
                ret.data.push({date: vol.date, stp: stp, wh: wh})
            }
            this.data = ret.data;
            return ret;
        }

        load(): angular.IPromise<biInfo.Response> {
            return this.q.all([
                this.volume.init(),
                this.revenue.init()
            ]).then(() => {
                return this.calc();
            })
        }


        update(): angular.IPromise<biInfo.Response> {
            return this.q.all([
                this.volume.init(),
                this.revenue.init()
            ]).then(() => {
                return this.calc();
            })
        }
    }

    export class ActiveAccounts implements ChartData {
        name = "accounts";
        data = [];

        constructor(private http, private q) {
        }

        load() {
            return this.http.get(apiurl + '/accountsactive?n=10')
                .then((response) => {
                    var ret = getSingleResponse(response);
                    if (ret.status == "OK") {
                        for (var i = 0; i < ret.data.length; i++) {
                            ret.data[i].date = dayAndMonth(ret.data[i].date);
                        }
                        this.data = ret.data.reverse();
                        // this.data.push({
                        //     date: 'Today',
                        //     count: Math.random() * 100
                        // });

                        return ret;
                    }
                    else return ret;
                })
        }

        update() {
            return this.http.get(apiurl + '/accountsactive?n=0')
                .then((response) => {
                        var ret = getSingleResponse(response);
                        if (ret.status == "OK") {
                            var lastIndex = this.data.length - 1;
                            var last = this.data[lastIndex];
                            last.count = ret.data.count;//Math.random() * 10000;
                            return ret;
                        }
                        else
                            return ret;
                    }
                )
        }

    }

    interface ISortedAndFiltered {
        data: [any];
        rest: number;
        total: number;
        negativeSum: number;
        positiveSum: number;
        min: number;
        max: number;
    }

    function getFirstItems(data, count, key, divider?): ISortedAndFiltered {
        if (divider)
            data.forEach(function (d) {
                d[key] /= divider;
            })
        data.sort((item1, item2) => {
            return item2[key] - item1[key]
        });
        var result = {
            data: null,
            rest: 0,
            total: 0,
            negativeSum: 0,
            positiveSum: 0,
            min: 1e10,// Number.MAX_SAFE_INTEGER,
            max: -1e10//Number.MAX_SAFE_INTEGER
        }
        for (var i = 0; i < data.length; i++) {
            result.total += Math.abs(data[i][key]);
            result.min = Math.min(result.min, data[i][key]);
            result.max = Math.max(result.max, data[i][key]);
            if (data[i][key] > 0) result.positiveSum += data[i][key];
            else result.negativeSum += data[i][key];
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

    abstract class Volume implements ChartData {
        name = "volumes";
        data = [];
        total;
        url;


        constructor(private http, private root) {
        }

        load() {
            return this.http.get(this.url)
                .then((response) => {
                    var ret = getSingleResponse(response);
                    if (ret.status == "OK") {
                        // ret.data.push({symbol: "EURRUB", volume: Math.random() * 200000000})
                        var sorted = getFirstItems(ret.data, 9, "volume");
                        this.data = sorted.data;
                        this.data.forEach((d) => {
                            var symbol = this.root.instruments.getByName(d.symbol);
                            d.color = symbol.d3color;
                        })
                        this.total = sorted.total;
                        if (sorted.rest > 0)
                            this.data.push({symbol: "Others", volume: sorted.rest, color: "rgb(0,0,0)"});
                        return ret;
                    }
                    else return ret;
                })
        }

        update() {
            return this.load();
        }

    }

    export class TodayVolume extends Volume {
        constructor(http, root) {
            super(http, root);
            this.url = apiurl + '/orderflowbyinstrument';
        }

    }

    export class MonthVolume extends Volume {
        constructor(http, root) {
            super(http, root);
            this.url = apiurl + '/orderflowbyinstrument?monthly=true';
        }

    }

    export class HourVolume implements ChartData {
        name = "flowBySymbol";
        data = [];
        currencies = [];
        total;
        min;
        max;
        negative;
        positive;

        constructor(private http, private root) {
        }

        load() {
            // return this.http.get(apiurl + '/orderflowbyinstrument')
            return this.http.get(apiurl + '/hourvolume')
                .then((response) => {
                    var ret = getSingleResponse(response);
                    if (ret.status == "OK") {
                        var groupped = d3.nest()
                            .key(function (d) {
                                return d.hour;
                            })
                            .entries(ret.data);
                        this.total = 0;
                        this.min = 1e10;//Number.MAX_SAFE_INTEGER;
                        this.max = -1e10;//Number.MAX_SAFE_INTEGER;
                        this.negative = 0;
                        this.positive = 0;
                        var count = ret.data.length;
                        if (count > 0) {
                            groupped.forEach((d) => {
                                d.value = groupped.length;
                                // d.date = Hour(d.key);
                                d.date = d.key;
                                var sorted = getFirstItems(d.values, 9, "volume");
                                d.volumes = sorted.data;
                                d.total = sorted.total;
                                d.min = sorted.min;
                                d.max = sorted.max;
                                this.min = Math.min(this.min, d.min);
                                this.max = Math.max(this.max, d.max);
                                this.negative = Math.min(this.negative, sorted.negativeSum);
                                this.positive = Math.max(this.positive, sorted.positiveSum);

                                this.total += sorted.total;
                                if (sorted.rest > 0)
                                    d.volumes.push({currency: "Others", volume: sorted.rest});
                            })
                        }
                        this.data = groupped;
                        this.currencies = ret.data.map((d) => {
                            return d.symbol;
                        });
                        this.currencies = this.currencies.filter((d, i) => {
                            return this.currencies.indexOf(d) == i;
                        })
                        this.currencies = this.currencies.map((d) => {
                            var symbol = this.root.instruments.getByName(d);
                            return {symbol: d, color: symbol.d3color}
                        })

                        return ret;
                    }
                    else return ret;
                })
        }

        update() {
            return this.load();
        }

    }

    function calcTotal(data, key) {
        var total = data.reduce(function (a, b) {
            return a + b[key];
        }, 0);
        return total;
    }

    export class VolumeLP implements ChartData {
        name = "volumeLP";
        data = [];

        constructor(private http) {
        }

        load() {
            return this.http.get(apiurl + '/volumebylp')
                .then((response) => {
                    var ret = getSingleResponse(response);
                    if (ret.status == "OK") {
                        this.data = ret.data;
                        return ret;
                    }
                    else return ret;
                })
        }

        update() {
            return this.load();
        }

    }

    export class VolumeByUnit implements ChartData {
        name = "volumeByUnit";
        data = [];
        total;

        constructor(private http) {
        }

        load() {
            return this.http.get(apiurl + '/orderflowbyunit')
                .then((response) => {
                    var ret = getSingleResponse(response);
                    if (ret.status == "OK") {
                        this.data = ret.data;
                        this.total = calcTotal(this.data, 'volume');
                        return ret;
                    }
                    else return ret;
                })
        }

        update() {
            return this.load();
        }

    }

    export class biStorage {
        //static $inject = ["$q", "$http"];
        dailyvolume;
        revenue;
        yield;
        accounts;
        todayvolume;
        monthvolume;
        hourvolume;
        lpvolume;
        unitvolume;

        constructor(http, q, root) {
            this.dailyvolume = new DailyVolume(http, q)
            this.revenue = new Revenue(http, q)
            this.yield = new Yield(this.dailyvolume, this.revenue, http, q)
            this.accounts = new ActiveAccounts(http, q)
            this.todayvolume = new TodayVolume(http, root)
            this.monthvolume = new MonthVolume(http, root)
            this.hourvolume = new HourVolume(http, root)
            this.lpvolume = new VolumeLP(http)
            this.unitvolume = new VolumeByUnit(http)
        }
    }

    angular
        .module("portal")
        .factory("$biInfo",
            function ($http, $q, $rootScope) {
                return new biStorage($http, $q, $rootScope);
            }
        )

}

