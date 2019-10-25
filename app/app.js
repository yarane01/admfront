var pullSettings = false;
var UPDATE_INTERVAL = 10000;
var PING_INTERVAL = 60000;
var valuetypes;
var pingInterval = 0;
var OSInfoInterval = 20000;
var DiskInfoInterval = 10 * 60 * 1000;
var rateInterval = 20000;
var OSInfoLength = 500;
var chartLength = 100;
var $appControllers;


var app = angular.module("portal", [
    //'ngAnimate',
    'ngRoute',
    'tableSort',
    'treeControl',
    'unitsControllers',
    'groupsControllers',
    'usersControllers',
    'accountsControllers',
    'settingsControllers',
    'instrumentsControllers',
    'dashboardControllers',
    'hierarchyControllers',
    'tradesControllers',
    'ordersControllers',
    'stpControllers',
    'miscControllers'
]).run(function ($rootScope,
    $http,
    $q,
    $timeout,
    $location,
    $routeParams,
    systemInfo,
    feedproviders,
    quotes) {


    $rootScope.appVersion = appRevision;
    $rootScope.integerType = "Positive integer";
    $rootScope.timezones = timezones;
    $rootScope.rootNodeName = "";
    $rootScope.config = {
        autoupdate: true,
        reports: "path not defined",
        production: true
    };
    var query = parseQuery(window.location.search);
    if (query.autoupdate)
        $rootScope.config.autoupdate = query.autoupdate != 'false';

    if (localStorage.tables) {
        var localTableProperties = JSON.parse(localStorage.tables);
        var defaultTableProperties = getDefaultTableProperties();

        tableProperties = $.extend(true, {}, defaultTableProperties, localTableProperties);

        // tableProperties = angular.extend({}, defaultTableProperties, localTableProperties);
        // tableProperties.Columns = angular.extend({}, defaultTableProperties.Columns, localTableProperties.Columns);
        //
        // tableProperties.riskmanagement_exposure = angular.extend({}, defaultTableProperties.riskmanagement_exposure,
        //     localTableProperties.riskmanagement_exposure);
        // tableProperties.riskmanagement_blotter = angular.extend({}, defaultTableProperties.riskmanagement_exposure,
        //     localTableProperties.riskmanagement_blotter);
        // tableProperties.riskmanagement_pl = angular.extend({}, defaultTableProperties.riskmanagement_pl,
        //     localTableProperties.riskmanagement_pl);
    }
    else {
        tableProperties = getDefaultTableProperties();
    }

    $rootScope.loaded = false;
    $rootScope.initerror = true;

    $rootScope.currencies = currencies;
    $rootScope.countries = objectToArray(isoCountries);
    $rootScope.instrumenttypemap = instrumenttypemap;
    $rootScope.changepasswordurl = changepasswordurl;


    $rootScope.portalUser =
        {
            username: "",
            password: "",
            remember: true,
            issystemmanager: false,
            isaccountmanager: false,
            issettingmanager: false,
            loggedIn: false
        }

    var local = localStorage.getItem("portal.feedDecor");
    if (local) $rootScope.feedDecor = JSON.parse(local);
    else $rootScope.feedDecor = {
        units: "minutes",
        level1: 1,
        level2: 3
    }

    local = localStorage.getItem("portal.user");
    if (local) {
        $rootScope.portalUser = JSON.parse(local);
        try {
            $rootScope.portalUser.password = sjcl.decrypt(appName, $rootScope.portalUser.password)
        }
        catch (e) {
            $rootScope.portalUser.password = "";
        }
        //$rootScope.portalUser.loggedIn = true;
        //systemInfo.start();
    }
    //else $location.path("/logon");
    $location.path("/logon");

    local = localStorage.getItem("portal.dropdownmouseopen");
    $rootScope.dropdownMouseOpen = false;
    if ((!local) || (local == "true")) {
        $rootScope.dropdownMouseOpen = true;
    }

    $rootScope.enableDropdownHover = function () {
        this.dropdownMouseOpen = true;
        localStorage.setItem("portal.dropdownmouseopen", "true");
        enableDropdownHover();
    }

    $rootScope.disableDropdownHover = function () {
        this.dropdownMouseOpen = false;
        localStorage.setItem("portal.dropdownmouseopen", "false");
        disableDropdownHover();
    }

    fillParents = function () {
        this.data.forEach(function (item) {
            item.parentName = 'Unknown';
            for (var i = 0; i < $rootScope.units.data.length; i++) {
                var u = $rootScope.units.data[i];
                if (u.hierarchynodeid == item.parenthierarchynodeid) {
                    item.parentName = u.name;
                    item.parentsystemid = u.systemid;
                    item.parentnodesystemid = u.systemid;
                    return;
                }
            }
            for (var i = 0; i < $rootScope.groups.data.length; i++) {
                var u = $rootScope.groups.data[i];
                if (u.hierarchynodeid == item.parenthierarchynodeid) {
                    item.parentName = u.name;
                    item.parentsystemid = u.systemid;
                    item.parentnodesystemid = u.systemid;
                    return;
                }
            }
        })
    };

    getById = function (id) {
        for (var i = 0; i < this.data.length; i++) {
            var item = this.data[i];
            if (item.systemid == id)
                return item;
        }
        return undefined;
    };

    getByName = function (name) {
        for (var i = 0; i < this.data.length; i++) {
            var item = this.data[i];
            if (item.name == name)
                return item;
        }
        return undefined;
    };

    remove = function (id) {
        var index = -1;
        for (var i = 0; i < this.data.length; i++) {
            var item = this.data[i];
            if (item.systemid == id) {
                index = i;
                break;
            }
        }
        if (index != -1)
            this.data.splice(index, 1);
    };

    updateItem = function (id, response) {
        for (var i = 0; i < this.data.length; i++) {
            var item = this.data[i];
            if (item.systemid == id) {
                this.data[i] = response;
                return;
            }
        }
    };

    $rootScope.fillUserRoles = function (user) {
        function isRole(role) {
            return user.roles.indexOf(role) >= 0;
        }

        user.istrader = isRole("Trader");
        user.ismoneyowner = isRole("MoneyOwner");
        user.isdealer = isRole("Dealer");
        user.issystemmanager = isRole("system_manager");
        user.isaccountmanager = isRole("account_manager");
        user.issettingmanager = isRole("setting_manager");
        user.isratemanager = isRole("rate_manager");
    };

    $rootScope.OpenStpTransactionMonitor = function () {
        var parser = document.createElement('a');
        parser.href = stpurl + '/transactionsMonitor.jsf';

        parser.protocol;
        parser.hostname;
        parser.port;
        parser.pathname;
        parser.search;
        parser.hash;
        parser.host;
        //var url = stpurl + '/transactionsMonitor.jsf';
        var url = parser.protocol + "//" + $rootScope.portalUser.username + ":" + $rootScope.portalUser.password + "@" + parser.hostname + parser.pathname;
        openInNewTab(url);
        /*
         var wnd = window.open("temp.html", "STP Transaction Monitor");
         var auth = $rootScope.getAuthHeader();
         var url = stpurl + '/transactionsMonitor.jsf';
         $http.get(url, {headers: auth})
         .success(function (response) {
         wnd.document.write(response);
         })
         */
    }

    $rootScope.userslist = {
        data: [],
        upToDate: false,
    }

    $rootScope.accountslist = {
        data: [],
        upToDate: false,
    }

    $rootScope.users = {
        total: 0,
        data: [],
        list: {},
        valid: true,
        upToDate: false,
        getById: getById,
        update: updateItem,
        fillParents: fillParents,
        state: createTableState(),
        fillRoles: function () {
            this.data.forEach(function (u) {
                $rootScope.fillUserRoles(u);
            })
        },
        isAdmin: function (id) {
            var user = this.getById(id);
            if (user) return isAdmin(user);
            else return false;
        },
        getEmpty: function () {
            return {
                "loginname": "",
                "istrader": false,
                "ismoneyowner": false,
                "isdealer": false,
                "issystemmanager": false,
                "isaccountmanager": false,
                "issettingmanager": false,
                "isratemanager": false,
                "tradingstate": "E",
                "symbol": "",
                "lastname": "",
                "address": "",
                "city": "",
                "state": "",
                "zip": "",
                "country": "",
                "email": "",
                "dayphone": "",
                "homephone": "",
                "parentsystemid": $rootScope.units.getRoot().systemid,
                "password": generatePassword(),
                cleanup: function () {
                    if (!this.istrader) delete this.istrader;
                    if (!this.ismoneyowner) delete this.ismoneyowner;
                    if (!this.isdealer) delete this.isdealer;
                    if (!this.issystemmanager) delete this.issystemmanager;
                    if (!this.isaccountmanager) delete this.isaccountmanager;
                    if (!this.issettingmanager) delete this.issettingmanager;
                    if (!this.isratemanager) delete this.isratemanager;
                }
            }
        }
    };

    $rootScope.units = {
        data: [],
        valid: true,
        upToDate: false,
        getById: getById,
        getByName: getByName,
        update: updateItem,
        remove: remove,
        state: createTableState(),
        getParent: function (id) {
            for (var i = 0; i < this.data.length; i++) {
                var u = this.data[i];
                if (u.hierarchynodeid == id) return u;
            }
            return null;
        },
        getRoot: function () {
            for (var i = 0; i < this.data.length; i++) {
                var u = this.data[i];
                if (u.type == 0) return u;
            }
            return this.data[0];
        },
        fillParents: function () {
            var self = this;
            this.data.forEach(function (unit) {
                var parent = self.getParent(unit.parenthierarchynodeid);
                unit.parentName = parent == null ? '-' : parent.name;
                unit.parentsystemid = parent == null ? 0 : parent.systemid;
                unit.parentnodesystemid = parent == null ? 0 : parent.systemid;
            })
        },
        getEmpty: function () {
            return {
                "type": 3,
                "daynight": 0,
                "marketstatus": 0,
                "parentmarketmakerunitid": 0,
                "versionid": 2,
                "name": "",
                "defaultcurrency": "USD",
                "timezone": "America/New_York",
                "description": "",
                "url": "",
                "closed": "N",
                "hasstp": "N",
                "parentnodeid": this.getRoot().hierarchynodeid
            }
        }
    }
    $rootScope.accounts = {
        total: 0,
        data: [],
        valid: true,
        upToDate: false,
        getById: getById,
        update: updateItem,
        fillParents: fillParents,
        state: createTableState(),
        fillOwners: function () {
            this.data.forEach(function (item) {
                item.ownerloginname = $rootScope.users.getById(item.ownerid).loginname;
                item.traderloginname = $rootScope.users.getById(item.traderid).loginname;
            })
        },
        getEmpty: function () {
            return {
                "parentsystemid": $rootScope.units.getRoot().systemid,
                "accountn": "",
                "type": 0,
                "ownerloginname": "",
                "traderloginname": "",
                "basecurrency": "USD",
                "description": ""
            }
        }
    };
    $rootScope.groups = {
        data: [],
        valid: true,
        upToDate: false,
        getById: getById,
        getByName: getByName,
        update: updateItem,
        fillParents: fillParents,
        remove: remove,
        state: createTableState(),
        getEmpty: function () {
            return {
                "name": "",
                "type": 0,
                "description": "",
                "managerid": 0,
                //"parentsystemid": $rootScope.units.getRoot().systemid,
                "parentnodesystemid": $rootScope.units.getRoot().systemid
            }
        }
    };
    $rootScope.instruments = {
        data: [],
        valid: true,
        upToDate: false,
        state: createTableState(),
        init: function (list) {
            var colors = new biInfo.ColorRange(list.length);
            $rootScope.instruments.data = [];
            list.forEach(function (s, i) {
                s.d3color = colors.getColor(i);
                s.pipsize = Math.pow(10, s.pipposition);
                $rootScope.instruments.data.push(s);
            })
        },
        getById: function (id) {
            for (var i = 0; i < this.data.length; i++) {
                var instr = this.data[i];
                if (instr.instrumentid == id)
                    return instr;
            }
            return undefined;
        },
        getByName: function (name) {
            for (var i = 0; i < this.data.length; i++) {
                var instr = this.data[i];
                if (instr.symbol == name)
                    return instr;
            }
            return undefined;
        },
        getCrossSymbol: function (name) {
            for (var i = 0; i < this.data.length; i++) {
                var instr = this.data[i];
                if ((instr.basesymbol == name) && (instr.derivedsymbol == "USD"))
                    return {
                        symbol: instr.symbol, direction: "mult"
                    }
                if ((instr.derivedsymbol == name) && (instr.basesymbol == "USD"))
                    return {
                        symbol: instr.symbol, direction: "div"
                    }
            }
            return undefined;
        },
        getList: function () {
            var result = [];
            for (var i = 0; i < this.data.length; i++) {
                result.push(this.data[i].symbol);
            }
            return result.join(',')
        },
        getNameId: function () {
            return this.data.map(function (s) {
                return { symbol: s.symbol, id: s.instrumentid };
            })
        },
        createBulkContext: function (items, title, key) {
            var bulkContext = new BulkContext();
            bulkContext.title = title;
            var self = this;
            items.forEach(function (id) {
                var instr = self.getById(id);
                bulkContext.createItem(
                    {
                        name: instr.symbol,
                        id: instr.instrumentid,
                        value: instr[key],
                        instrument: instr
                    }
                );
            });
            bulkContext.items.sort(function (a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
            return bulkContext;
        },
        getEmpty: function () {
            return {
                "basesymbol": "",
                "derivedsymbol": "",
                "symbol": "",
                "instrumentid": 0,
                "lotsize": 1,
                "pipposition": 2,
                "instrumenttype": "0",
                "buyrate": 1.0,
                "sellrate": 1.0,
                "maxpipsupdate": 100000,
                "round": 3,
                "tradingperiod": "9:30-16:30",
                "spread": 0.0,
                "traderrange": 100.0,
                "dealerrange": 100.0,
                "marginrequirement": 1.0,
                "basesellshift": 0.0,
                "basebuyshift": 0.0
            }
        }
    };

    $rootScope.trades = {
        data: [],
        state: createTableState(),
        total: 0,
        getById: function (id) {
            for (var i = 0; i < this.data.length; i++) {
                var t = this.data[i];
                if (t.tradeid == id)
                    return t;
            }
            return undefined;
        }
    }

    $rootScope.orders = {
        data: [],
        state: createTableState(),
        total: 0,
        getById: function (id) {
            for (var i = 0; i < this.data.length; i++) {
                var t = this.data[i];
                if (t.orderid == id)
                    return t;
            }
            return undefined;
        }
    }

    $rootScope.stpOrders = {
        data: [],
        state: createTableState(),
        total: 0
    }

    $rootScope.saveTableProperties = function () {
        localStorage.tables = JSON.stringify(tableProperties);
    };

    $rootScope.showAboutWin = function () {
        $('#aboutWin').modal();
        $http.get(apiurl+'/version').then(
            function (response) {
                $rootScope.apiVersion = response.data.payload[0].apiversion;
            }, function (response) {
                $rootScope.apiVersion = 'Error';
            }
        );
        $http.get(apiurl + '/patches').then(
            function (response) {
                $rootScope.dbpatches = {};
                $rootScope.dbpatches.needed = response.data.payload[0].needed;
                $rootScope.dbpatches.applied = response.data.payload[0].applied;
                $rootScope.currentTime = Date.now();

            }, function (response) {
                $rootScope.dbpatches.needed = 'Error';
                $rootScope.dbpatches.applied = 'Error';
            }
        );
        $http.get(tradeserverurl + '/ping/').then(
            function (response) {
                var x2js = new X2JS();
                var pingResponse = x2js.xml_str2json(response.data);
                $rootScope.serverVersion = pingResponse.ok._version;
                $rootScope.serverRevision = pingResponse.ok._revision;

            }, function (response) {
                $rootScope.serverVersion = 'Error';
                $rootScope.serverRevision = 'Error';
            }
        );

        $http.get(stpurl + '/ping').then(
            function (response) {
                var x2js = new X2JS();
                var pingResponse = x2js.xml_str2json(response.data);
                $rootScope.stpVersion = pingResponse.health.module.revision;

            }, function (response) {
                $rootScope.stpVersion = 'Error';
            }
        );

        $http.get(reportsurl + '/healthcheck').then(
            function (response) {
                $rootScope.reportsVersion = response.data.gitVersion;

            }, function (response) {
                $rootScope.reportsVersion = 'Error';
            }
        );
    }

    $rootScope.init = function () {
        $rootScope.initerror = true;
        if (!$rootScope.loaded) {
            $rootScope.loaded = $q.defer();
            $q.all([
                $http.get(apiurl + '/groups'),
                $http.get(apiurl + '/instruments'),
                $http.get(apiurl + '/units'),
                $http.get(apiurl + '/valuetypes')
                //$http.get(apiurl)
                //$http.get(apiurl + '/patches'),
            ]).then(
                function (responses) {
                    var r = responses[0].data;
                    $rootScope.groups.valid = r.status == 'OK';
                    $rootScope.groups.data = r.payload[0];

                    r = responses[1].data;
                    $rootScope.instruments.valid = r.status == 'OK';
                    $rootScope.instruments.init(r.payload[0]);

                    r = responses[2].data;
                    $rootScope.units.valid = r.status == 'OK';
                    $rootScope.units.data = r.payload[0];

                    var r = responses[3].data;
                    valuetypes = r.payload[0];

                    $rootScope.groups.upToDate = true;
                    $rootScope.instruments.upToDate = true;
                    $rootScope.units.upToDate = true;
                    $rootScope.units.fillParents();
                    $rootScope.groups.fillParents();

                    quotes.start();

                    $rootScope.updateAccountsCount();
                    $rootScope.updateUserCount();
                    $rootScope.updateUsersList();
                    $rootScope.updateAccountList();
                    $rootScope.initerror = false;
                    $rootScope.initialized = true;
                    $rootScope.loaded.resolve();

                },
                function (reason) {
                    $rootScope.loaded.resolve(reason);
                }
            );
        }
        return $rootScope.loaded.promise;
    };

    $rootScope.locateSetting = function (s) {
        $rootScope.settingLocator = s;
        $('#settingnodes').modal();
        angular.element($('#settingnodes')).scope().init();
    }

    $rootScope.getGroupParents = function () {
        return $rootScope.units.data
            .concat($rootScope.groups.data);

    };

    $rootScope.getUserParents = function () {
        return $rootScope.units.data
            .concat($rootScope.groups.data.filter(
                function (item) {
                    return item.type == 1;
                }
            )
            );
    };

    $rootScope.getAccountParents = function () {
        return $rootScope.units.data
            .concat($rootScope.groups.data.filter(
                function (item) {
                    return item.type == 0;
                }
            )
            );
    };

    $rootScope.updateSettingList = function (entities) {
        if ((entities.settingList == undefined) && (entities.data.length > 0))
            $http.get(apiurl + '/settings/' +
                entities.data[0].systemid)
                .then(function (result) {
                    entities.settingList = [];
                    result.data.payload.forEach(function (s) {
                        entities.settingList.push(
                            {
                                name: s.systemsetting.constname,
                                id: s.systemsetting.systemsettingid,
                                description: s.systemsetting.description
                            }
                        );
                    }
                    )

                }, function (result) {
                }
                )
    }

    $rootScope.updateUnits = function () {
        var q = $q.defer();
        if (!$rootScope.units.upToDate)
            $http.get(apiurl + '/units')
                .then(
                    function (response) {
                        $rootScope.units.data = response.data.payload[0];
                        $rootScope.units.upToDate = true;
                        $rootScope.units.fillParents();
                        q.resolve();
                    },
                    function (error) {
                    }
                );
        else q.resolve();
        return q.promise;
    };

    $rootScope.updateUsersList = function () {
        var q = $q.defer();
        if (!$rootScope.userslist.upToDate)
            $http.get(apiurl + '/users')
                .then(function (response) {
                    $rootScope.userslist.data = response.data.payload[0];
                    $rootScope.userslist.upToDate = true;
                    q.resolve();
                });
        else q.resolve();
        return q.promise;
    };

    $rootScope.updateAccountList = function () {
        var q = $q.defer();
        if (!$rootScope.userslist.upToDate)
            $http.get(apiurl + '/accounts')
                .then(function (response) {
                    $rootScope.accountslist.data = response.data.payload[0];
                    $rootScope.accountslist.upToDate = true;
                    q.resolve();
                });
        else q.resolve();
        return q.promise;
    };

    $rootScope.updateGroups = function () {
        var q = $q.defer();
        if (!$rootScope.groups.upToDate)
            $http.get(apiurl + '/groups')
                .then(function (response) {
                    $rootScope.groups.data = response.data.payload[0];
                    $rootScope.groups.upToDate = true;
                    $rootScope.groups.fillParents();
                    q.resolve();
                });
        else q.resolve();
        return q.promise;
    };

    $rootScope.updateInstruments = function () {
        var q = $q.defer();
        if (!$rootScope.instruments.upToDate)
            $http.get(apiurl + '/instruments')
                .then(function (response) {
                    $rootScope.instruments.data = response.data.payload[0];
                    $rootScope.instruments.upToDate = true;
                    q.resolve();
                });
        else q.resolve();
        return q.promise;
    };

    $rootScope.updateUserCount = function () {
        return $http.get(apiurl + '/users2count')
            .then(function (response) {
                $rootScope.users.total = response.data.payload[0].count;
            });
    };

    $rootScope.updateAccountsCount = function () {
        return $http.get(apiurl + '/accounts2count')
            .then(function (response) {
                $rootScope.accounts.total = response.data.payload[0].count;
            });
    };

    $rootScope.updateTradeCount = function () {
        return $http.get(apiurl + '/trades2count')
            .then(function (response) {
                $rootScope.trades.total = response.data.payload[0].count;
            });
    };

    $rootScope.updateOrdersCount = function () {
        return $http.get(apiurl + '/orders/pending/count')
            .then(function (response) {
                $rootScope.orders.total = response.data.payload[0].count;
            });
    };

    $rootScope.getPortalUserRolesList = function () {
        var result = '';
        if ($rootScope.portalUser.isaccessadmin) result += '<p>Access&nbsp;administrator</p>';
        if ($rootScope.portalUser.ismanager) result += '<p>Manager</p>';
        if ($rootScope.portalUser.issystemmanager) result += '<p>System&nbsp;manager</p>';
        if ($rootScope.portalUser.isaccountmanager) result += '<p>Account&nbsp;manager</p>';
        if ($rootScope.portalUser.issettingmanager) result += '<p>Settings&nbsp;manager</p>';
        if ($rootScope.portalUser.isratemanager) result += '<p>Rate&nbsp;manager</p>';
        if ($rootScope.portalUser.isdealer) result += '<p>Dealer</p>';
        return result;
    }

    $rootScope.settingsInfoStack = {
        data: [],
        index: -1,
        push: function (type, id, name) {
            this.data.push(
                {
                    "type": type,
                    "id": id,
                    "name": name
                }
            );
            this.index++;
        },
        pop: function (item) {
            if (this.index >= 0) {
                this.index--;
                return this.data.pop();
            }
            else
                return null;
        },
        clear: function () {
            this.index = -1;
            this.data = [];
        },
        type: function () {
            return this.index == -1 ? "" :
                this.data[this.index].type;
        },
        id: function () {
            return this.index == -1 ? "" :
                this.data[this.index].id;
        },
        name: function () {
            return this.index == -1 ? "" :
                this.data[this.index].name;
        },
        level: function () {
            return this.index;
        },
        breadcrumb: function () {
            var result = [];
            for (var i = 0; i < this.data.length; i++) {
                var obj = this.data[i];
                result.push(obj.name);
            }
            return result.join(' > ');
        }
    }

    $rootScope.getAuthHeader = function () {
        var credentials = btoa(this.portalUser.username + ':' + this.portalUser.password);
        return { 'Authorization': 'Basic ' + credentials };
    }


    $http.get("appconfig.json")
        .then(
            function (response) {
                //angular.extend($rootScope.config, response.data);
                //if (response.data.reports != "*") {
                //    reportsurl = response.data.reports;
                //    $rootScope.externalReports = true;
                //}
                //else
                //    reportsurl = tradeserverurl + "/reports";
                //console.log('reports at: ' + reportsurl)
            },
            function (response) {
                //reportsurl = tradeserverurl + "/reports";
            }
        )

    $rootScope.logonToReports = function () {
        $http.get(reportsurl + '/logon?login=' +
            $rootScope.portalUser.username + '&password=' +
            $rootScope.portalUser.password)
            .then(function (response) {
                console.log('logged to reports OK')
            }, function (response) {
                console.log('log to reports failed');
                console.log('status:' + response.status + response.statusText);
                console.log('data:' + response.data)
            })
    }

    $rootScope.access = (function () {
        var user = $rootScope.portalUser;

        function systemButNotRoot() {
            return user.issystemmanager && !user.isaccessadmin
        }

        return {
            units: {
                Page: function () {
                    return true;
                },
                Create: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Edit: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Settings: function () {
                    return user.issystemmanager ||
                        user.issettingmanager;
                },
                Exposure: function () {
                    return true
                },
                Delete: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Reports: function () {
                    return true;
                }
            },
            groups: {
                Page: function () {
                    return true
                },
                Create: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Edit: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Settings: function () {
                    return user.issystemmanager ||
                        user.issettingmanager;
                },
                Delete: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                }
            },
            users: {
                Page: function () {
                    return (!user.isaccessadmin)
                },
                Create: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Edit: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Delete: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Settings: function () {
                    return user.issystemmanager ||
                        user.issettingmanager;
                },
                Exposure: function () {
                    return true;
                },
                LockUnlock: function () {
                    return true;
                },
                Password: function () {
                    return true;
                },
                CreateAccount: function () {
                    return true;
                },
                Reports: function () {
                    return true;
                }
            },
            accounts: {
                Page: function () {
                    return (!user.isaccessadmin)
                },
                Create: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Edit: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Delete: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager;
                },
                Settings: function () {
                    return user.issystemmanager ||
                        user.issettingmanager;
                },
                Exposure: function () {
                    return true;
                },
                Money: function () {
                    return true;
                },
                Reports: function () {
                    return true;
                }
            },
            trades: {
                Create: function () {
                    return user.isdealer;
                },
                Page: function () {
                    return (!user.isaccessadmin)
                },
                Details: function () {
                    return true;
                },
                Edit: function () {
                    return user.isdealer;
                }
            },
            orders: {
                Create: function () {
                    return user.isdealer;
                },
                Page: function () {
                    return (!user.isaccessadmin)
                },
                Details: function () {
                    return true;
                },
                Edit: function () {
                    return user.isdealer;
                },
                Delete: function () {
                    return user.isdealer;
                }
            },
            instruments: {
                Page: function () {
                    return true
                },
                Create: function () {
                    return user.isratemanager
                },
                Edit: function () {
                    return user.isratemanager
                    /*
                     return systemButNotRoot() ||
                     user.issettingmanager ||
                     user.isdealer
                     */
                },
                History: function () {
                    return user.issettingmanager ||
                        user.isdealer
                }
            },
            feed: {
                Page: function () {
                    return true
                },
                Subscription: function () {
                    //return user.isdealer ||
                    return user.isratemanager
                }
            },
            hierarchy: {
                Page: function () {
                    return true
                },
                Create: function () {
                    return user.issystemmanager;
                },
                Move: function () {
                    return user.issystemmanager;
                    //return false;
                }
            },
            settings: {
                Edit: function () {
                    return true
                },
                Delete: function () {
                    return true;
                },
                Clear: function () {
                    var type = $rootScope.settingsInfoStack.type();
                    return (type == 'unit') || (type == 'group');
                }
            },
            exposure: {
                Page: function () {
                    return user.isdealer
                }
            },
            riskmanagement: {
                Page: function () {
                    return user.isdealer
                }
            },
            dashboard: {
                Entities: function () {
                    return true
                },
                OrdersInQueue: function () {
                    return systemButNotRoot() ||
                        user.isaccountmanager ||
                        user.issettingmanager ||
                        user.isdealer
                },
                Logs: function () {
                    return user.issystemmanager ||
                        user.isaccessadmin ||
                        user.ismanager ||
                        user.isdealer
                },
                Modules: function () {
                    return user.issystemmanager;
                },
                Rates: function () {
                    return true;
                },
                Feed: function () {
                    //return user.isdealer ||
                    return user.isratemanager
                },
                System: function () {
                    return user.issystemmanager;
                },
                Closeday: function () {
                    return user.issystemmanager;
                },
                MCAccounts: function () {
                    return true;
                },
                OnlineUsers: function () {
                    return user.issystemmanager ||
                        user.isaccountmanager ||
                        user.issettingmanager ||
                        user.isdealer
                }
            }
        }
    })()
})


app.config(['$locationProvider', '$controllerProvider', '$routeProvider', '$animateProvider', '$httpProvider',
    function ($locationProvider, $controllerProvider, $routeProvider, $animateProvider, $httpProvider) {
        /*
         $locationProvider.html5Mode({
         enabled: true,
         requireBase: true
         })
         */

        $appControllers = $controllerProvider;
        //$animateProvider.classNameFilter(/app-animate/);
        $httpProvider.defaults.withCredentials = true;
        //$httpProvider.defaults.cache = false;
        $httpProvider.interceptors.push('responseInterceptor');
        $httpProvider.defaults.headers.common["cache-control"] = "private, max-age=0, no-cache";
        //$httpProvider.defaults.transformResponse = [];
        //$httpProvider.defaults.headers.common["request-to"] = "https://ec2-54-69-141-245.us-west-2.compute.amazonaws.com";
        $routeProvider
            .when('/', { templateUrl: 'partials/dashboard/dashboard.html' })
            .when('/logon', { templateUrl: 'partials/logon.html' })
            .when('/logout', { templateUrl: 'partials/logout.html' })
            .when('/hierarchy', { templateUrl: 'partials/hierarchy/hierarchy.html' })
            .when('/units', { templateUrl: 'partials/units/units.html' })
            .when('/groups', { templateUrl: 'partials/groups/groups.html' })
            .when('/users', { templateUrl: 'partials/users/users.html' })
            .when('/trades', { templateUrl: 'partials/trades/trades.html' })
            .when('/orders', { templateUrl: 'partials/orders/orders.html' })
            .when('/stp', { templateUrl: 'partials/stp/stp.html' })
            .when('/accounts', { templateUrl: 'partials/accounts/accounts.html' })
            .when('/instruments', { templateUrl: 'partials/instruments/instruments.html' })
            .when('/feed', { templateUrl: 'partials/feed/panels.html' })
            .when('/feedsubscription', { templateUrl: 'partials/feed/subscription.html' })
            .when('/exposure', { templateUrl: 'partials/exposure/exposure.html' })
            .when('/riskmanagement', { templateUrl: 'partials/riskmanagement/riskmanagement.html' })
            .when('/biinfo', { templateUrl: 'partials/biinfo/biinfo.html' })
            .when('/logs', { templateUrl: 'partials/logs/logs.html' })
            .when('/debug', { templateUrl: 'partials/settings/settingnodes.html' })
            .otherwise({ redirectTo: '/' });
    }
]);

app.factory('responseInterceptor', ['$rootScope', '$location',
    function ($rootScope, $location) {
        return {
            request: function (req) {
                if (req.url.indexOf(".html") != -1) {
                    req.url += '?mark=' + Date.now();
                }
                if (req.url.indexOf(stpapiurl) != -1) {
                    var credentials = btoa($rootScope.portalUser.username + ':' + $rootScope.portalUser.password);
                    req.headers.Authorization = 'Basic ' + credentials;
                }
                return req;
            },
            response: function (response) {
                //console.log(response.config.url);
                return response;
            }
        }
    }]
);

var userRolesMap = {
    Dealer: "Dealer",
    MoneyOwner: "Money owner",
    Trader: "Trader",
    account_manager: "Account manager",

    setting_manager: "Setting manager",
    system_manager: "System manager",
    rate_manager: "Rate manager"
};

function createUsers() {
    //create test users and accounts

    var nameStart = 200;
    var pass = 'password';
    var parent;

    var limit = 200;
    var count = 0;
    var nameBase;
    var parents = [];


    function creteUsers(next) {
        if (next) {
            parent = parents.pop()
            if (parent) {
                count = 0;
                nameBase = nameStart;
            }
            else {
                console.log('all done');
                return;
            }
        }
        nameBase++;
        var username = 'u_' + parent + '_';
        var user = {
            "loginname": username + nameBase,
            "istrader": true,
            "ismoneyowner": true,
            "tradingstate": "enabled",
            "firstname": "First name " + nameBase,
            "lastname": "Last name " + nameBase,
            "address": "",
            "city": "City",
            "state": "",
            "zip": "",
            "country": "AZ",
            "parentsystemid": parent
        };

        var account = {
            "parentsystemid": parent,
            "accountn": 'a_' + user.loginname,
            "ownerloginname": user.loginname,
            "traderloginname": user.loginname,
            "basecurrency": "USD",
            "description": "created for test"
        };
        console.log('creating user ' + user.loginname);
        $.ajax(apiurl + '/users', {
            data: JSON.stringify(user),
            contentType: 'application/json',
            type: 'POST'
        }).done(function () {
            $.ajax(apiurl + '/accounts', {
                data: JSON.stringify(account),
                contentType: 'application/json',
                type: 'POST'
            }).done(function () {
                count++;
                if (count < limit) creteUsers(false);
                else {
                    creteUsers(true);
                }
            }).error(function () {
                console.log('error creating account');
            });
        }).error(function () {
            console.log('error creating user');
        });
    };

    $.ajax(apiurl + '/units')
        .done(function (response) {
            response.payload[0].forEach(function (item) {
                parents.push(item.systemid);
            }
            )
            creteUsers(true);
        })
        .error(function () {
            console.log('error getting units');
        });
}


function generatePassword() {
    return Math.random().toString(36).slice(-8);
}

function handleModalsOpenedTwice() {
    var $body = $('body'),
        isOpened = false,
        isOpenedTwice = false;
    $body.on('shown.bs.modal', '.modal', function () {
        if (isOpened) {
            isOpenedTwice = true;
        } else {
            isOpened = true;
        }
    });
    $body.on('hidden.bs.modal', '.modal', function () {
        if (isOpenedTwice) {
            $body.addClass('modal-open');
            isOpenedTwice = false;
        }
        else isOpened = false;
    });
}

function enableDropdownHover() {
    $(document).on("mouseenter", ".dropdown-hover", function () {
        if (!($(this).hasClass('open'))) {
            $('.dropdown-toggle', this).trigger('click');
        }
    })
    $(document).on("mouseleave", ".dropdown-hover", function () {
        if ($(this).hasClass('open')) {
            $('.dropdown-toggle', this).trigger('click');
        }
    })
}

function disableDropdownHover() {
    $(document).off("mouseenter mouseleave", ".dropdown-hover")
}

function handleDropdownHover() {
    var local = localStorage.getItem("portal.dropdownmouseopen");
    if ((!local) || (local == "true")) {
        enableDropdownHover();
    }
}

function parseQuery(qstr) {
    var query = {};
    var a = qstr.substr(1).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
}