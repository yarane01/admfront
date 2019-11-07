angular.module('portal')
    .service('api', ['$http',
        function ($http) {
            return {
                do: function (method, url, data, callbacks) {
                    var req = {
                        method: method,
                        url: apiurl + url,
                        data: data
                    };
                    return $http(req).then(
                        function (response) {
                            if (response.data.status == 'OK') {
                                if (callbacks.internalok) callbacks.internalok(response);
                                if (callbacks.ok) callbacks.ok(response);
                            }
                            else {
                                if (callbacks.internalerror) callbacks.internalerror(response);
                                if (callbacks.error) callbacks.error(response);
                            }
                            return response;
                        },
                        function (response) {
                            if (callbacks.internalerror) callbacks.internalerror(response);
                            if (callbacks.error) callbacks.error(response);
                            return response;
                        }
                    );
                },
                get: function (url, data, callbacks) {
                    return this.do('GET', url, data, callbacks);
                },
                put: function (url, data, callbacks) {
                    return this.do('PUT', url, data, callbacks);
                },
                post: function (url, data, callbacks) {
                    return this.do('POST', url, data, callbacks);
                },
                delete: function (url, data, callbacks) {
                    return this.do('DELETE', url, data, callbacks);
                },
                //MISC
                getSettinsHistory: function (callbacks) {
                    return this.get('/instruments//settinghistory', null, callbacks);
                },
                getExposure: function (id, title, path, scope, callbacks) {
                    scope.exposure = {
                        title: title,
                        hasData: true,
                        loaded: false,
                        data: null
                    };
                    return this.get('/' + path + '/' + id + '/exposure', null,
                        $.extend(callbacks, {
                            internalok: function (response) {
                                scope.exposure.loaded = true;
                                var data = response.data.payload[0];
                                if (data.length > 0) {
                                    scope.exposure.data = data;
                                }
                                else scope.exposure.hasData = false;
                            }
                        }
                        )
                    );
                },
                updateTrade: function (data, callbacks) {
                    return this.put('/trades/' + data.tradeid, JSON.stringify(data), callbacks);
                },
                updateOrder: function (data, callbacks) {
                    return this.put('/orders/' + data.orderid, JSON.stringify(data), callbacks);
                },


                //---------------- INSTRUMENTS
                createInstrument: function (data, callbacks) {
                    return this.post('/instruments', JSON.stringify(data), callbacks);
                },
                updateInstrument: function (data, callbacks) {
                    return this.put('/instruments/' + data.systemid, JSON.stringify(data), callbacks);
                },

                //---------------- ACCOUNTS
                getAccount: function (id, callbacks) {
                    return this.get('/accounts/' + id, null, callbacks);
                },
                getAccountByName: function (name, callbacks) {
                    return this.get('/accounts?accountn=' + name, null, callbacks);
                },
                createAccount: function (data, callbacks) {
                    //data.type = accounttypemap[data.type];
                    return this.post('/accounts', JSON.stringify(data), callbacks);
                },
                updateAccount: function (data, callbacks) {
                    return this.put('/accounts/' + data.systemid, JSON.stringify(data), callbacks);
                },
                depositAccount: function (data, callbacks) {
                    var deposit = {
                        amount: data.amount,
                        description: data.description
                    };
                    return this.put('/accounts/' + data.systemid + '/deposit', JSON.stringify(deposit), callbacks);
                },
                adjustAccount: function (data, callbacks) {
                    var adjust = {
                        amount: data.amount,
                        description: data.description
                    };
                    return this.put('/accounts/' + data.systemid + '/adjust', JSON.stringify(adjust), callbacks);
                },
                withdrawAccount: function (data, callbacks) {
                    var withdraw = {
                        amount: data.amount,
                        description: data.description
                    };
                    return this.put('/accounts/' + data.systemid + '/withdraw', JSON.stringify(withdraw), callbacks);
                },
                withdrawAvailable: function (systemid, callbacks) {
                    return this.get('/accounts/' + systemid + '/withdraw', null, callbacks);
                },
                getAccountsTotal: function (callbacks) {
                    return this.get('/accounts2count', null, callbacks);
                },

                //---------------- USERS
                getUser: function (id, callbacks) {
                    return this.get('/users/' + id, null, callbacks);
                },
                getUsers: function (callbacks) {
                    return this.get('/users', null, callbacks);
                },
                getUsersTotal: function (callbacks) {
                    return this.get('/users2count', null, callbacks);
                },
                getOnlineUsers: function (callbacks) {
                    return this.get('/onlineusers', null, callbacks);
                },
                createUser: function (data, callbacks) {
                    return this.post('/users', JSON.stringify(data), callbacks);
                },
                updateUser: function (data, callbacks) {
                    return this.put('/users/' + data.systemid, JSON.stringify(data), callbacks);
                },
                deleteUser: function (id, callbacks) {
                    return this.delete('/users/' + id, null, callbacks);
                },
                updateUserPassword: function (data, callbacks) {
                    return this.put('/users/' + data.systemid + '/updatepassword', JSON.stringify(data), callbacks);
                },
                lockUser: function (data, callbacks) {
                    return this.put('/users/' + data.systemid + '/lock', JSON.stringify(data), callbacks);
                },
                unlockUser: function (data, callbacks) {
                    return this.put('/users/' + data + '/unlock', null, callbacks);
                },

                //---------------- UNITS
                getUnit: function (id, callbacks) {
                    return this.get('/units/' + id, null, callbacks);
                },
                deleteUnit: function (id, callbacks) {
                    return this.delete('/units/' + id, null, callbacks);
                },
                createUnit: function (data, callbacks) {
                    return this.post('/units', JSON.stringify(data), callbacks);
                },
                updateUnit: function (data, callbacks) {
                    return this.put('/units/' + data.systemid, JSON.stringify(data), callbacks);
                },

                //---------------- GROUPS
                getGroup: function (id, callbacks) {
                    return this.get('/groups/' + id, null, callbacks);
                },
                deleteGroup: function (id, callbacks) {
                    return this.delete('/groups/' + id, null, callbacks);
                },
                createGroup: function (data, callbacks) {
                    return this.post('/groups', JSON.stringify(data), callbacks);
                },
                updateGroup: function (data, callbacks) {
                    return this.put('/groups/' + data.systemid, JSON.stringify(data), callbacks);
                },

                //HIERARCHY
                changeParent: function (id, parent, callbacks) {
                    var data = { parentsystemid: parent };
                    return this.put('/hierarchy/' + id, JSON.stringify(data), callbacks);
                },

                //Trading
                createTrade: function (data, callbacks) {
                    return this.post('/orders', JSON.stringify(data), callbacks);
                },
                deleteOrder: function (id, callbacks) {
                    return this.delete('/orders/' + id, null, callbacks);
                },


            }
        }]
    );

angular.module('portal')
    .service('modal', ['$rootScope', '$timeout', 'api',
        function ($rootScope, $timeout, api) {
            return {
                show: function (id, options) {
                    if (options.before) options.before();
                    $timeout(function () {
                        if (options.onshow) $(id).on('shown.bs.modal', options.onshow);
                        if (options.onhide) $(id).on('hidden.bs.modal', options.onhide);
                        $(id).modal();
                    })
                },
                showShort: function (id, scope, conditionObj, condition, focusControl, apply) {
                    this.show(id,
                        {
                            before: function () {
                                conditionObj[condition] = true;
                                if (apply) scope.$apply();
                            },
                            onshow: function () {
                                $(focusControl).focus()
                            },
                            onhide: function () {
                                conditionObj[condition] = false;
                                if (apply) scope.$apply();
                            }
                        }
                    )

                },
                showCreateUnitDialog: function ($scope, apply) {
                    beforeDialog($scope);
                    $scope.unit = $rootScope.units.getEmpty();
                    this.showShort('#createUnit', $scope, $scope.context, 'createUnit', '#unit-create', apply);
                },
                showEditUnitDialog: function ($scope, apply) {
                    beforeDialog($scope);
                    this.showShort('#editUnit', $scope, $scope.context, 'editUnit', '#unit-edit', apply);
                },
                showCreateGroupDialog: function ($scope, apply) {
                    beforeDialog($scope);
                    $scope.parents = $rootScope.getGroupParents();
                    $scope.group = $rootScope.groups.getEmpty();
                    this.showShort('#createGroup', $scope, $scope.context, 'createGroup', '#group-create', apply);
                },
                showEditGroupDialog: function ($scope, apply) {
                    beforeDialog($scope);
                    $scope.parents = $rootScope.getGroupParents();
                    this.showShort('#editGroup', $scope, $scope.context, 'editGroup', '#group-edit', apply);
                },
                showCreateUserDialog: function ($scope, apply) {
                    beforeDialog($scope);
                    $scope.parents = $rootScope.getUserParents();
                    $scope.user = $rootScope.users.getEmpty();
                    this.showShort('#createUser', $scope, $scope.context, 'createUser', '#user-create', apply);
                },
                showEditUserDialog: function ($scope, apply) {
                    beforeDialog($scope);
                    $scope.parents = $rootScope.getUserParents();
                    this.showShort('#editUser', $scope, $scope.context, 'editUser', '#user-edit', apply);
                },
                showCreateAccountDialog: function ($scope, apply, empty) {
                    beforeDialog($scope);
                    if (empty) $scope.account = $rootScope.accounts.getEmpty();
                    $scope.parents = $rootScope.getAccountParents();
                    this.showShort('#createAccount', $scope, $scope.context, 'createAccount', '#account-create', apply);
                },
                showEditAccountDialog: function ($scope, apply) {
                    beforeDialog($scope);
                    this.showShort('#editAccount', $scope, $scope.context, 'editAccount', '#account-edit', apply);
                },
                makeUnitCreateCallback: function ($scope, updateFunc) {
                    return angular.extend(errorHandler($scope),
                        {
                            ok: function (response) {
                                $scope.context.inprogress = false;
                                $("#createUnit").modal('hide').on('hidden.bs.modal', updateFunc);
                                $rootScope.units.upToDate = false;
                                $rootScope.updateUnits();
                            }
                        })

                },
                makeGroupCreateCallback: function ($scope, updateFunc) {
                    return angular.extend(errorHandler($scope),
                        {
                            ok: function (response) {
                                $scope.context.inprogress = false;
                                $("#createGroup").modal('hide').on('hidden.bs.modal', updateFunc);
                                $rootScope.groups.upToDate = false;
                                $rootScope.updateGroups();
                            }
                        })

                },
                makeUserCreateCallback: function ($scope, updateFunc) {
                    return angular.extend(errorHandler($scope),
                        {
                            ok: function (response) {
                                $scope.context.inprogress = false;
                                $rootScope.updateUserCount();
                                $("#createUser").modal('hide').on('hidden.bs.modal', updateFunc);
                            }
                        })

                },
                makeAccountCreateCallback: function ($scope, updateFunc) {
                    return angular.extend(errorHandler($scope),
                        {
                            ok: function (response) {
                                $scope.context.inprogress = false;
                                $rootScope.updateAccountsCount();
                                $("#createAccount").modal('hide').on('hidden.bs.modal', updateFunc);
                            }
                        })

                }
            }
        }]
    );

angular.module('portal')
    .service('quotes', ['$q', '$rootScope', '$timeout', '$http',
        function ($q, $rootScope, $timeout, $http) {
            var interval = 0;
            var rateInterval = 1;
            var busy = false;
            //var error = false;
            var loaded = false;
            var list = [];
            var q = $q.defer();

            var symbols = {
                getFirstProvider: function (symbol) {
                    var s = this[symbol];
                    if (s) {
                        var provider = Object.keys(s)[0];
                        return s[provider];
                    }
                    else return undefined;
                },
                getProviders: function (symbol) {
                    var s = this[symbol];

                    if (s)
                        return Object.keys(s);
                    else
                        return undefined;
                }
                /*
                 clearUpdate: function () {
                 for (s in $rootScope.symbols) {
                 if ($rootScope.symbols.hasOwnProperty(s)) {
                 var symbol = $rootScope.symbols[s];
                 for (p in symbol) {
                 if (typeof symbol[p] === 'object')
                 symbol[p].updated = false;
                 }
                 }
                 }
                 }
                 */
            };

            function Symbols() {
            }

            Symbols.prototype = symbols;
            $rootScope.symbols = new Symbols();

            var updatetime;

            function getSymbols() {

                if (busy) return;

                busy = true;

                $http.get(apiurl + '/quotes?symbols=' + list)
                    .success(function (data, status) {

                        //$rootScope.symbols.clearUpdate();
                        if (data.status == 'OK') {
                            loaded = true;

                            var quotes = (data.payload)[0];

                            for (var i = 0; i < quotes.length; i++) {
                                var quote = quotes[i];
                                var s = $rootScope.symbols[quote.symbol];
                                if (!s) {
                                    $rootScope.symbols[quote.symbol] = {};
                                    s = $rootScope.symbols[quote.symbol];
                                }

                                var p = s[quote.provider];
                                if (!p) {
                                    s[quote.provider] = {
                                        ask: quote.basebuyrate,
                                        bid: quote.basesellrate
                                    };
                                    if (!s.$count) s.$count = 1;
                                    else s.$count++;
                                    s.last = quote.provider;
                                    p = s[quote.provider];
                                }

                                var instrument = $rootScope.instruments.getByName(quote.symbol);
                                if (!instrument) break;

                                if (!updatetime)
                                    updatetime = moment(quote.updatedate, 'YYYY-MM-DD HH:mm:ss');

                                p.updatedate = quote.updatedate;
                                p.moment = moment(quote.updatedate, 'YYYY-MM-DD HH:mm:ss');
                                updatetime = moment.max(updatetime, p.moment);
                                p.istraded = quote.istraded;

                                p.highsellrate = quote.highsellrate.toFixed(instrument.round);
                                p.lowsellrate = quote.lowsellrate.toFixed(instrument.round);
                                p.highbuyrate = quote.highbuyrate.toFixed(instrument.round);
                                p.lowbuyrate = quote.lowbuyrate.toFixed(instrument.round);

                                p.quotespersec = quote.quotespersec.toFixed(1);
                                p.spread = ((quote.basebuyrate - quote.basesellrate) * instrument.pipsize).toFixed(1);

                                var prevask = p.ask;
                                if (quote.basebuyrate > prevask)
                                    p.askchange = 'Up';
                                else if (quote.basebuyrate < prevask)
                                    p.askchange = 'Down';
                                else
                                    p.askchange = '';
                                p.ask = quote.basebuyrate.toFixed(instrument.round);

                                var prevbid = p.bid;
                                if (quote.basesellrate > prevbid)
                                    p.bidchange = 'Up';
                                else if (quote.basesellrate < prevbid)
                                    p.bidchange = 'Down';
                                else
                                    p.bidchange = '';
                                p.bid = quote.basesellrate.toFixed(instrument.round);


                                //debug
                                //p.askchange = Math.random() > 0.5 ? 'Up' : 'Down';
                                //p.bidchange = Math.random() > 0.5 ? 'Up' : 'Down';

                                $rootScope.$emit('symbolchanged', quote);
                            }
                            q.resolve();
                            busy = false;
                            $rootScope.$emit('quotesupdated');
                        }
                        else {
                            busy = false;
                            q.resolve();
                        }
                    }
                    ).error(function (data, status, headers, config) {
                        busy = false;
                        q.resolve();
                    });

            }

            const updateList = () => {
                var symbols = getStoredSymbols('rates');
                list = symbols.list;
                rateInterval = symbols.interval;
            }

            return {
                start: function () {
                    updateList();
                    getSymbols();
                    if ($rootScope.config.autoupdate)
                        interval = setInterval(getSymbols, rateInterval * 1000);
                },
                stop: function () {
                    if (interval > 0)
                        clearInterval(interval);
                },
                update: function () {
                    updateList();
                },
                loaded: function () {
                    return loaded;
                },
                getLastUpdateTime: function () {
                    return updatetime;
                },
                init: function () {
                    this.stop();
                    q = $q.defer();
                    this.start();
                    return q.promise;
                }
            }

        }]
    );

angular.module('portal')
    .service('systemInfo', ['$q', '$rootScope', '$timeout', '$http',
        function ($q, $rootScope, $timeout, $http) {
            var totalmemory;
            var freememory;
            var swapused;
            var cpu;
            var javamaxmemory;
            var javatotalmemory;
            var javafreememory;
            var error = false;
            var errorMessage;
            var loaded = false;
            var started = false;
            var disks = [];

            var buffer = [];
            var osInfoInterval = 0;
            var diskInfoInterval = 0;
            var busy = false;
            var q = $q.defer();

            function getOSInfo() {
                if (busy) return;
                busy = true;
                $http.get(apiurl + '/osinfo').success(function (data, status, headers, config) {
                    busy = false;
                    if (data.status == 'OK') {
                        error = false;
                        var info = data.payload[0];
                        info.time = moment();
                        totalmemory = info.totalmemory;
                        freememory = info.freememory;
                        swapused = info.swapused;
                        cpu = info.cpu;
                        if (cpu > 95) {
                            cpuAlertIndicator.update(cpu);
                            $rootScope.cpuAlert = true;
                        }
                        else
                            $rootScope.cpuAlert = false;
                        javamaxmemory = info.javamaxmemory;
                        javatotalmemory = info.javatotalmemory;
                        javafreememory = info.javafreememory;
                        buffer.push(info);
                        if (buffer.length > OSInfoLength)
                            buffer.shift();
                        loaded = true;
                        $rootScope.$emit('osinfochanged');
                        q.resolve();
                    } else {
                        loaded = true;
                        error = true;
                        errorMessage = data.payload[0];
                        if (errorMessage.indexOf("is not allowed for caller with roles") >= 0) {
                            if (osInfoInterval > 0) clearInterval(osInfoInterval);
                        }
                        q.resolve(errorMessage);
                    }
                }).error(function (data, status, headers, config) {
                    loaded = true;
                    error = true;
                    errorMessage = data.payload[0];
                    busy = false;
                    q.resolve();
                });
            }

            function getDiskInfo() {
                disks = [];
                $http.post(apiurl + '/execonserver', '{"command":"df -h"}')
                    .then(function (response) {
                        if (response.data.status == 'OK') {
                            var output = response.data.payload[0].output.split("\n");
                            for (var i = 1; i < output.length - 1; i++) {
                                var o = output[i].split(/\s+/);
                                if (o != "")
                                    disks.push({
                                        fileSystem: o[0],
                                        size: o[1],
                                        used: o[2],
                                        avail: o[3],
                                        use: o[4],
                                        mount: o[5]
                                    })
                            }
                            $rootScope.$emit('diskinfochanged');
                        }
                    }
                    )
            }

            //interval = setInterval(getOSInfo, OSInfoInterval);
            //getOSInfo();

            return {
                start: function () {
                    if (!started) {
                        getOSInfo();
                        getDiskInfo()
                        if ($rootScope.config.autoupdate) {
                            osInfoInterval = setInterval(getOSInfo, OSInfoInterval);
                            diskInfoInterval = setInterval(getDiskInfo, DiskInfoInterval);
                        }
                        started = true;
                    }
                },
                stop: function () {
                    if (osInfoInterval > 0) clearInterval(osInfoInterval);
                    if (diskInfoInterval > 0) clearInterval(diskInfoInterval);
                },
                init: function () {
                    return q.promise;
                },
                update: function () {
                    getOSInfo();
                },
                totalMemory: function () {
                    return totalmemory;
                },
                freeMemory: function () {
                    return freememory;
                },
                swap: function () {
                    return swapused;
                },
                CPU: function () {
                    return cpu;
                },
                javaMaxMemory: function () {
                    return javamaxmemory;
                },
                javaTotalMemory: function () {
                    return javatotalmemory;
                },
                javaFreeMemory: function () {
                    return javafreememory;
                },
                error: function () {
                    return error;
                },
                errorMessage: function () {
                    return errorMessage;
                },
                loaded: function () {
                    return loaded;
                },
                getLast: function (number) {
                    number = Math.min(buffer.length, number);
                    return buffer.slice(-number);
                },
                disks: function () {
                    return disks;
                }
            }

        }]
    );

angular
    .module('portal')
    .service('feedproviders', feedproviders);

function feedproviders($http, $q) {
    var error = false;
    var errorMessage;
    var loaded = false;
    var providers = [];

    this.refresh = function (forced) {
        //To not reload already loaded providers data
        if (loaded && !forced) {
            var deferred = $q.defer();

            deferred.resolve();
            return deferred.promise;
        }

        error = false;
        loaded = false;

        return $http.get(stpapiurl + '/GetProviders')
            .then(function (data) {
                if (data.data.status == 'OK') {
                    providers = [];
                    for (var i = 0; i < data.data.payload.length; i++) {
                        if (data.data.payload[i].loaded)
                            providers.push(data.data.payload[i]);
                    }
                    providers.sort(function (p1, p2) {
                        return p1.name.localeCompare(p2.name)
                    });

                    loaded = true;
                }
                else {
                    loaded = true;
                    error = true;
                    errorMessage = data.data.payload[0];
                }
            }, function (data) {
                loaded = true;
                error = true;
                errorMessage = data.data.payload[0];
            });
    };

    function post(data) {
        return $http.post(stpapiurl + '/GetProviders', data);
    }

    this.getProviders = function () {
        return providers;
    };

    this.error = function () {
        return error;
    };

    this.errorMessage = function () {
        return errorMessage;
    };

    this.loaded = function () {
        return loaded;
    };

    this.connectFeed = function (bank) {
        return post([{ bank: bank, connectFeed: true }]);
    };

    this.disconnectFeed = function (bank) {
        return post([{ bank: bank, connectFeed: false }]);
    };
    this.connectTrading = function (bank) {
        return post([{ bank: bank, connectTrading: true }]);
    };
    this.disconnectTrading = function (bank) {
        return post([{ bank: bank, connectTrading: false }]);
    }
}

function errorHandler($scope) {
    return {
        error: function (response) {
            $scope.context.inprogress = false;
            $scope.context.errorMessage = response.data.payload[0];
            if ($scope.context.errorMessage == '') $scope.context.errorMessage = "Request failed";
            $scope.context.error = true;
        }
    }
}

function beforeDialog($scope) {
    $scope.context.inprogress = false;
    $scope.context.error = false;
}
