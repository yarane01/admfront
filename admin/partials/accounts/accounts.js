var accountsControllers = angular.module('accountsControllers', []);

accountsControllers.controller('AccountsCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal', '$location', '$route', '$log',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal, $location, $route, $log) {

            $scope.account = null;
            $scope.context = {
                createAccount: false,
                editAccount: false,
                createTrade: false
            };

            $scope.createTable = function () {
                $scope.tableOptions = {
                    //"data": $rootScope.accounts.data,
                    "order": [[1, 'asc']],
                    "processing": true,
                    "serverSide": true,
                    "language": {
                        "processing": "Loading..."
                    },
                    //"pageLength": 10,
                    "scrollY": calcDataTableHeight(),
                    // "scrollX": true,
                    "paging": true,
                    "name": "accounts",
                    //"dom": "tipr",
                    "dom": "<'row'<'col-sm-6'i>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    "initComplete": function (settings, json) {
                    },
                    "stateSave": true,
                    stateSaveCallback: function (settings, data) {
                        $rootScope.accounts.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.accounts.state.data)
                            return $rootScope.accounts.state.data;
                        else
                            return null;
                    },
                    "ajax": function (data, callback, settings) {
                        if (needApplyExternalFilter()) return;
                        var orderCol;
                        var index = data.order[0].column;
                        switch (settings.aoColumns[index].name) {
                            case "systemid":
                                orderCol = 'systemid';
                                break;
                            case "accountn":
                                orderCol = 'accountn';
                                break;
                            case "ownername":
                                orderCol = 'ownername';
                                break;
                            case "tradername":
                                orderCol = 'tradername';
                                break;
                            case "parent":
                                orderCol = 'parenthierarchynodename';
                                break;
                            case "basecurrency":
                                orderCol = 'basecurrency';
                                break;
                            case "balance":
                                orderCol = 'balance';
                                break;
                            case "type":
                                orderCol = 'type';
                                break;
                            case "usedmargin":
                                orderCol = 'usedmargin';
                                break;
                            case "usablemargin":
                                orderCol = 'usablemargin';
                                break;
                            case "opendate":
                                orderCol = 'opendate';
                                break;
                            case "accountclosed":
                                orderCol = 'accountclosed';
                                break;
                            case "tradeSubLevel":
                                orderCol = 'tradeSubLevel';
                                break;
                        }

                        var reqFilters = [];
                        for (var i = 0; i < 11; i++) {
                            var search = data.columns[i].search.value;
                            if (search != '') {
                                switch (settings.aoColumns[i].name) {
                                    case "systemid":
                                        reqFilters.push("systemid='" + search + "'");
                                        break;
                                    case "accountn":
                                        if ($rootScope.accounts.state.externalFilter.applied)
                                            reqFilters.push("accountn LIKE '" + search + "'");
                                        else
                                            reqFilters.push("upper(accountn) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "ownername":
                                        reqFilters.push("upper(ownername) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "tradername":
                                        reqFilters.push("upper(tradername) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "parent":
                                        reqFilters.push("upper(PARENTHIERARCHYNODENAME) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "basecurrency":
                                        reqFilters.push("upper(basecurrency) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "balance":
                                        if (isCorrectFilter(search))
                                            reqFilters.push("balance " + search);
                                        break;
                                    case "usedmargin":
                                        reqFilters.push("usedmargin>=" + search);
                                        break;
                                    case "accountclosed":
                                        reqFilters.push("upper(accountclosed) LIKE '" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "type":
                                        if (search.toUpperCase() == 'T')
                                            reqFilters.push("type=0");
                                        else reqFilters.push("type=2");
                                        break;
                                }
                            }
                        }
                        var reqParams = {
                            n1: data.start + 1,
                            n2: data.start + data.length,
                            sortcolumn: orderCol + ' ' + data.order[0].dir
                        };
                        var countFilter = {filter: ''};
                        if (reqFilters.length > 0) {
                            reqParams.filter = reqFilters.join(' AND ');
                            countFilter.filter = reqParams.filter;
                        }

                        $scope.error = false;
                        $q.all([
                            $http.get(apiurl + '/accounts2', {params: reqParams}),
                            $http.get(apiurl + '/accounts2count', {params: countFilter})
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    $rootScope.accounts.data = response[0].data.payload[0];
                                    $rootScope.updateSettingList($rootScope.accounts);
                                    var filtered = response[1].data.payload[0].count;

                                    callback({
                                            "recordsTotal": $rootScope.accounts.total,
                                            "recordsFiltered": filtered,
                                            data: $rootScope.accounts.data
                                        }
                                    );
                                    setTableActionsPosHandler('table');
                                    if ($rootScope.accounts.state.selected.length > 0)
                                        selectRow('#table', $rootScope.accounts.state.selected[0]);
                                }
                                else {
                                    $scope.errorMessage = response[0].data.payload[0];
                                    $scope.error = true;
                                }
                            }, function (response) {
                                $scope.errorMessage = response.data;
                                $scope.error = true;
                            })
                    }

                    ,
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.systemid);
                        //$(row).on('click', singleSelectionRowClick);
                    }
                    ,
                    "columns": [
                        {
                            "data": "systemid",
                            save: false,
                            name: "systemid"
                        },
                        {
                            "data": "accountn",
                            "class": "font-bold",
                            save: false,
                            name: "accountn"
                        },
                        //{"data": "type"},
                        {
                            //"data": "ownername"
                            "data": null,
                            save: false,
                            name: "ownername",
                            "render": function (data, type, full, meta) {
                                return '<a href="Javascript:;" onclick="userClick(\''
                                    + data.ownername + '\')">' + data.ownername + '</a>';
                            }
                        },
                        {
                            //{"data": "tradername"},
                            "data": null,
                            save: false,
                            name: "tradername",
                            "render": function (data, type, full, meta) {
                                return '<a href="Javascript:;" onclick="userClick(\''
                                    + data.tradername + '\')">' + data.tradername + '</a>';
                            }
                        },
                        {
                            //"data": "parenthierarchynodename"
                            "data": null,
                            save: false,
                            name: "parent",
                            "render": function (data, type, full, meta) {
                                return '<a href="Javascript:;" onclick="parentClick(\''
                                    + data.parenthierarchynodename + '\')">' + data.parenthierarchynodename + '</a>';
                            }
                        },
                        {
                            "data": null,
                            save: true,
                            name: "type",
                            "render": function (data, type, full, meta) {
                                return accounttypemap[data.type];
                            }
                        },
                        {
                            "data": "basecurrency",
                            save: true,
                            name: "basecurrency"
                        },
                        {
                            //"data": "balance",
                            "data": null,
                            save: true,
                            name: "balance",
                            "render": function (data, type, full, meta) {
                                return data.balance;
                            }
                        },
                        {
                            //"data": "usedmargin"
                            "data": null,
                            save: true,
                            name: "usedmargin",
                            "render": function (data, type, full, meta) {
                                return data.usedmargin ? data.usedmargin : 0;
                            }
                        },
                        {
                            //"data": "usablemargin"
                            "data": null,
                            save: true,
                            name: "usablemargin",
                            "sortable": false,
                            "render": function (data, type, full, meta) {
                                return data.usablemargin ? data.usablemargin : 0;
                            }
                        },
                        {
                            "data": "opendate",
                            //"class": "opendate",
                            save: true,
                            name: "opendate"
                        },
                        {
                            "data": "accountclosed",
                            save: true,
                            name: "accountclosed"
                        },
                        {
                            "data": "tradeSubLevel",
                            save: true,
                            name: "tradeSubLevel"
                        },
                        {
                            "data": null,
                            "sortable": false,
                            "class": "actions",
                            save: false,
                            name: "",
                            "render": function (data, type, full, meta) {
                                var access = $rootScope.access.accounts;
                                return $.fn.actionList(
                                    {
                                        id: data.systemid,
                                        items: [
                                            {
                                                title: "Edit",
                                                action: "Edit",
                                                access: access.Edit,
                                                class: 'edit-link text-bold'
                                            },
                                            {
                                                title: "Settings",
                                                action: "Settings",
                                                access: access.Settings,
                                                class: 'settings-link'
                                            },
                                            {
                                                type: "divider"
                                            },
                                            {
                                                title: "Change Subscription",
                                                action: "changesubscription",
                                                access: access.Edit,
                                                class: 'edit-link text-bold'
                                            },
                                            {
                                                type: "divider"
                                            },
                                            {
                                                title: "Exposure",
                                                action: "Exposure",
                                                access: access.Exposure
                                            },
                                            {
                                                type: "submenu",
                                                title: "Money",
                                                class: "open-left",
                                                items: [
                                                    {
                                                        title: "Deposit",
                                                        action: "Deposit",
                                                        access: access.Money
                                                    },
                                                    {
                                                        title: "Withdraw",
                                                        action: "Withdraw",
                                                        access: access.Money
                                                    }
                                                    //VDP-231 Hide Adjust menu item from Entities-Accounts-Money menu
                                                    /*,
                                                     {
                                                     title: "Adjust",
                                                     action: "Adjust",
                                                     access: access.Money
                                                     }*/
                                                ]
                                            },
                                            {
                                                type: "submenu",
                                                title: "Reports",
                                                class: "open-left",
                                                items: [
                                                    {
                                                        title: "Account Statement",
                                                        action: "Report",
                                                        access: access.Reports
                                                    },
                                                    {
                                                        title: "Executed Orders Report",
                                                        action: "Executed Orders Report",
                                                        access: access.Reports
                                                    },
                                                    {
                                                        title: "Daily Volume Report",
                                                        action: "Daily Volume Report",
                                                        access: access.Reports
                                                    }
                                                ]
                                            },
                                            {
                                                type: "submenu",
                                                title: "Trading",
                                                class: "open-left",
                                                itemCheck: function () {
                                                    return data.type == 0
                                                },
                                                items: [
                                                    {
                                                        title: "Create trade",
                                                        action: "trade",
                                                        access: access.Money
                                                    },
                                                    {
                                                        title: "Create order",
                                                        action: "order",
                                                        access: access.Money
                                                    }
                                                ]
                                            },
                                            {
                                                title: "Change parent",
                                                action: "Change parent",
                                                access: access.Edit
                                            },
                                            {
                                                title: "History",
                                                action: "History",
                                                access: access.Reports
                                            }
                                        ]
                                    }).html();
                            }
                        }
                    ]
                }
            };

            function needApplyExternalFilter() {
                return ($rootScope.accounts.state.externalFilter.name &&
                (!$rootScope.accounts.state.externalFilter.applied));
            }

            $scope.afterTableCreated = function () {
                var table = $('#table').DataTable();
                assignFilters('#table');
                $('#table tbody').on('click', 'tr', singleSelectionRowClick);
                var colSel = new $.fn.colSel(table, {
                    visObject: tableProperties.Columns,
                    saveFunc: $rootScope.saveTableProperties
                });
                $(colSel).appendTo('#rigth-group');
                $('#page-wrapper').addClass('page-animation');
                if (needApplyExternalFilter()) {
                    $rootScope.accounts.state.externalFilter.applied = true;
                    clearState(table, $rootScope.accounts.state);
                    setFilterValue(table, $rootScope.accounts.state, 1,
                        $rootScope.accounts.state.externalFilter.name, false);
                    //$rootScope.accounts.state.nameFilter = undefined;
                    saveState('#table', $rootScope.accounts.state);
                    table.ajax.reload();
                }
                else
                    restoreState(table, $rootScope.accounts.state, true);
            };

            function getItem(id) {
                return $rootScope.accounts.getById(id);
            }

            $scope.clearExternalFilter = function () {
                $rootScope.accounts.state.externalFilter.applied = false;
                $rootScope.accounts.state.externalFilter.name = undefined;
                $scope.clearAllFilters();
            }

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.accounts.state);
                table.ajax.reload();
            }

            window.userClick = function (name) {
                $rootScope.users.state.externalFilter.name = name;
                $rootScope.users.state.externalFilter.applied = false;
                $scope.$apply(function () {
                    $location.path("/users");
                })
            }

            window.parentClick = function (name) {
                var item = $rootScope.groups.getByName(name);
                if (item) {
                    $rootScope.groups.state.externalFilter.name = name;
                    $rootScope.groups.state.externalFilter.applied = false;
                    $scope.$apply(function () {
                        $location.path("/groups");
                    })
                }
                else {
                    $rootScope.units.state.externalFilter.name = name;
                    $rootScope.units.state.externalFilter.applied = false;
                    $scope.$apply(function () {
                        $location.path("/units");
                    })
                }
            }

            window.actionClick = function (link) {
                var action = $(link).data('action');
                var id = $(link).data('id');
                switch (action.toUpperCase()) {
                    case 'EDIT':
                        $scope.editDialog(id);
                        break;
                    case 'SETTINGS':
                        $scope.goSettings(id);
                        break;
                    case 'EXPOSURE':
                        $scope.exposureDialog(id);
                        break;
                    case 'DEPOSIT':
                        $scope.depositDialog(id);
                        break;
                    case 'WITHDRAW':
                        $scope.withdrawDialog(id);
                        break;
                    case 'ADJUST':
                        $scope.adjustDialog(id);
                        break;
                    case 'CHANGE PARENT':
                        $scope.changeParentDialog(id);
                        break;
                    case 'HISTORY':
                        $scope.historyDialog(id);
                        break;
                    case 'REPORT':
                        $scope.goReports(id);
                        break;
                    case 'EXECUTED ORDERS REPORT':
                        $scope.goExReports(id);
                        break;
                    case "DAILY VOLUME REPORT":
                        $scope.goDailyReports(id);
                        break;
                    case "TRADE":
                        $scope.createTradeDialog(id);
                        break;
                    case "CHANGESUBSCRIPTION":
                        $scope.updateAccountSubscriptionTier(id);
                        break;
                    case "ORDER":
                        $scope.createOrderDialog(id);
                        break;

                }
            };

            function succes(dialog, resetPaging) {
                $scope.context.inprogress = false;
                $('#' + dialog).modal('hide');
                saveState('#table', $rootScope.accounts.state);
                $('#table').DataTable().ajax.reload(null, resetPaging);
            }

            $scope.goReports = function (id) {
                var account = $.extend({}, getItem(id));
                var url;
                // basic authentication in url:
                if (reportsurl.startsWith('https://')) {
                    url = 'https://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(8);
                } else {
                    url = 'http://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(7);
                }
                url = url + '/accountstatement?accountn=' + account.accountn;
                openInNewTab(url);
            };

            $scope.goExReports = function (id) {
                var account = $.extend({}, getItem(id));
                // basic authentication in url:
                var url;
                if (reportsurl.startsWith('https://')) {
                    url = 'https://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(8);
                } else {
                    url = 'http://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(7);
                }
                url = url + '/executedorders?accountn=' + account.accountn;
                openInNewTab(url);
            };

            $scope.goDailyReports = function (id) {
                var account = $.extend({}, getItem(id));
                // basic authentication in url:
                var url;
                if (reportsurl.startsWith('https://')) {
                    url = 'https://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(8);
                } else {
                    url = 'http://'+$rootScope.portalUser.username+':'+$rootScope.portalUser.password+'@'+reportsurl.substring(7);
                }
                url = url + '/dailytradingvolume?accountn=' + account.accountn;
                openInNewTab(url);
            };

            $scope.goSettings = function (id) {
                $rootScope.settingsInfoStack.clear();
                $rootScope.settingsInfoStack.push("account",
                    getItem(id).systemid, getItem(id).accountn);
                $('#settings').modal();
                angular.element($('#settings')).scope().init();
            };

            $scope.exposureDialog = function (id) {
                var item = getItem(id);
                var title = 'account ' + item.accountn;
                $('#exposure').modal();
                api.getExposure(item.systemid, title, 'accounts', $scope);
            };

            $scope.createDialog = function () {
                $scope.account = $rootScope.accounts.getEmpty();
                modal.showCreateAccountDialog($scope, false, true);
            };

            $scope.editDialog = function (id) {
                $scope.account = $.extend({}, getItem(id));
                $scope.account.ownerloginname = $scope.account.ownername;
                $scope.account.traderloginname = $scope.account.tradername;
                //$scope.account.parentsystemid = $scope.account.parenthierarchynodeid;
                delete $scope.account.ownername;
                delete $scope.account.tradername;
                modal.showEditAccountDialog($scope, true);
            };

            $scope.createTradeDialog = function (id) {
                $rootScope.currentaccount = angular.copy(getItem(id));
                $scope.context.createTrade = true;
                $scope.$apply();
                beforeDialog($scope);
                $('#createTrade').modal().on('shown.bs.modal',
                    function () {
                        $('#lots').focus();
                    }
                )
            }

            $scope.createOrderDialog = function (id) {
                $rootScope.currentaccount = angular.copy(getItem(id));
                $scope.context.createOrder = true;
                $scope.$apply();
                beforeDialog($scope);
                $('#createOrder').modal().on('shown.bs.modal',
                    function () {
                        $('#lots').focus();
                    }
                )
            }


            $scope.depositDialog = function (id) {
                beforeDialog($scope);
                var account = $.extend({}, getItem(id));
                $scope.deposit = {
                    accountn: account.accountn,
                    systemid: account.systemid,
                    amount: 1000,
                    balance: account.balance,
                    currency: account.basecurrency,
                    description: ''
                };
                setFocusOnModalWindow('depositAccount', 'account-deposit');
                $scope.$apply();
                $('#depositAccount').modal();
            };

            $scope.depositAccount = function () {
                $scope.context.inprogress = true;
                api.depositAccount($scope.deposit, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            succes('depositAccount', false);
                        }
                    }
                ));
            };

            $scope.withdrawDialog = function (id) {
                beforeDialog($scope);
                var account = $.extend({}, getItem(id));
                var decimals = account.basecurrency == "JPY" ? 0 : 2;

                $scope.withdraw = {
                    accountn: account.accountn,
                    systemid: account.systemid,
                    amount: "",
                    // balance: +floorFigure(account.balance, decimals),
                    balance: account.balance.toFixed(decimals),
                    currency: account.basecurrency,
                    description: ''
                };
                setFocusOnModalWindow('withdrawAccount', 'account-withdraw');
                $scope.$apply();
                $('#withdrawAccount').modal();
                api.withdrawAvailable(account.systemid,
                    {
                        ok: function (response) {
                            // $scope.withdraw.available = +floorFigure(response.data.payload[0], decimals);
                            $scope.withdraw.available = response.data.payload[0].toFixed(decimals);
                        }
                    }
                );
            };

            $scope.withdrawAccount = function () {
                $scope.context.inprogress = true;
                api.withdrawAccount($scope.withdraw, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            succes('withdrawAccount', false);
                        }
                    }
                ));
            };

            $scope.adjustDialog = function (id) {
                beforeDialog($scope);
                var account = $.extend({}, getItem(id));
                $scope.adjust = {
                    accountn: account.accountn,
                    systemid: account.systemid,
                    amount: 1000,
                    balance: account.balance,
                    currency: account.basecurrency,
                    description: ''
                };
                setFocusOnModalWindow('adjustAccount', 'account-adjust');
                $scope.$apply();
                $('#adjustAccount').modal();
            };

            $scope.changeParentDialog = function (id) {
                beforeDialog($scope);
                var account = $.extend({}, getItem(id));
                $scope.updateParent = {
                    accountn: account.accountn,
                    systemid: account.systemid,
                    parents: $rootScope.getAccountParents()
                };
                $scope.$apply();
                $('#changeParent').modal();
            };


            $scope.historyDialog = function (id) {
                $scope.history = {
                    account: $.extend({}, getItem(id)),
                    loading: false,
                    loaded: false,
                    data: null
                }
                $scope.dateFilter = createDateFilterObject();
                $scope.$apply();
                $('#transHistory').modal();
            };

            $scope.getHistory = function () {
                $scope.history.error = false;
                $scope.history.loading = true;
                var requestQuery = encodeURI($scope.dateFilter.queryFor('datefrom', 'dateto'));
                $http.get(apiurl + '/accounts/' + $scope.history.account.systemid
                    + '/debitcredit' + requestQuery)
                    .then(
                        function (result) {
                            $scope.history.data = result.data.payload[0];
                            $scope.history.loading = false;
                            $scope.history.loaded = true;
                        },
                        function (result) {
                            $scope.history.errorMessage = result.data;
                            $scope.history.loading = false;
                            $scope.history.error = true;
                        }
                    )
            }

            $scope.adjustAccount = function () {
                $scope.context.inprogress = true;
                api.adjustAccount($scope.adjust, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            succes('adjustAccount', false);
                        }
                    }
                ));
            };

            $scope.updateAccount = function () {
                $scope.context.inprogress = true;
                api.updateAccount($scope.account, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            succes('editAccount', false);
                        }
                    }
                ));
            };

            $scope.createAccount = function () {
                $scope.context.inprogress = true;
                api.createAccount($scope.account, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            succes('createAccount', true);
                            $rootScope.updateAccountsCount();
                        }
                    }
                ));
            };

            $scope.changeParent = function () {
                $scope.context.inprogress = true;
                api.changeParent($scope.updateParent.systemid,
                    $scope.updateParent.changeParentTo,
                    angular.extend(errorHandler($scope),
                        {
                            ok: function (response) {
                                succes('changeParent', false);
                            }
                        }
                    ));
            };

            $scope.Refresh = function () {
                $('#table').DataTable().ajax.reload();
            }

            $rootScope.activePage = "accounts";
            $rootScope.init().then(function () {
                //$scope.parents = $rootScope.getAccountParents();
                $scope.createTable();
                $scope.$broadcast('dataloaded');
            })

            $scope.exportToCSV = function () {
                function error(res) {
                    if (res.data.status)
                        $scope.errorMessage = res.data.payload[0];
                    else
                        $scope.errorMessage = 'HTTP status ' + res.status;
                    $scope.error = true;
                }

                $scope.error = false;
                $http.get(apiurl + '/accounts2count')
                    .then(
                        function (res) {
                            var count = res.data.payload[0].count;
                            $http.get(apiurl + '/accounts2', {params: {n1: 1, n2: count}})
                                .then(
                                    function (res) {
                                        var csv = json2csv({data: res.data.payload[0]});
                                        saveData("Accounts.csv", csv);
                                    },
                                    function (res) {
                                        error(res)
                                    }
                                )
                        },
                        function (res) {
                            error(res)
                        }
                    )
            }

            $scope.updateAccountSubscriptionTier = function(id) {
                $scope.account = $.extend({}, $rootScope.accounts.getById(id));

                beforeDialog($scope);
                setFocusOnModalWindow('editAccountSubscription', 'accountSubscription-edit');

                $scope.$apply();
                $('#editAccountSubscription').modal();
            };

            $scope.setAccountSubscriptionTier = function() {
                $.ajax(apiurl + '/tradeSubscriptions/account/' + $scope.account.systemid, {
                    data: "{\"tier\":\"" + $scope.account.tradeSubLevel + "\"}",
                    contentType: 'application/json',
                    type: 'PUT'
                }).done(function () {
                    $rootScope.updateTradeSubscriptions().then(function () {
                        $("#editAccountSubscription").modal('hide').on('hidden.bs.modal',
                            function () {
                                $scope.Refresh();
                            }
                        );
                    });
                }).error(function () {
                    alert("Received error while updating account trading subscription.");
                });
            };

            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.accounts.state);
            });

        }
    ])

accountsControllers.controller('OwnerAndTraderCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal', '$log',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal, $log) {

            /*
             $log.log("creating OwnerAndTraderCtrl");
             $scope.$on("$destroy", function () {
             $log.log("destroy OwnerAndTraderCtrl");
             });
             */

            beforeDialog($scope);

            var ownersPager;
            var tradersPager;
            $scope.filters =
                {
                    trader: "",
                    owner: ""
                }

            $scope.ownerSelected = function (item) {
                $scope.account.ownerloginname = item;
                if ($scope.context.createAccount)
                    $scope.account.traderloginname = item;
            }
            $scope.traderSelected = function (item) {
                $scope.account.traderloginname = item;
            }
            $scope.ownerFirst = function () {
                $scope.owners = ownersPager.first();
            }

            $scope.ownerLast = function () {
                $scope.owners = ownersPager.last();
            }

            $scope.ownerNext = function () {
                $scope.owners = ownersPager.next();
            }

            $scope.ownerPrev = function () {
                $scope.owners = ownersPager.prev();
            }

            $scope.traderFirst = function () {
                $scope.traders = tradersPager.first();
            }

            $scope.traderLast = function () {
                $scope.traders = tradersPager.last();
            }

            $scope.traderNext = function () {
                $scope.traders = tradersPager.next();
            }

            $scope.traderPrev = function () {
                $scope.traders = tradersPager.prev();
            }

            $scope.$watch("filters.owner", function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        ownersPager.filter(newValue);
                        $scope.owners = ownersPager.first();
                    }
                }
            )

            $scope.$watch("filters.trader", function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        tradersPager.filter(newValue);
                        $scope.traders = tradersPager.first();
                    }
                }
            )

            $scope.parents = $rootScope.getAccountParents();
            $scope.context.dataloaded = false;
            $rootScope.updateUsersList()
                .then(function () {
                    $scope.users = $rootScope.userslist.data;
                    ownersPager = new Pager({
                        items: $scope.users,
                        filterFields: ['loginname', 'systemid']
                    });
                    tradersPager = new Pager({
                        items: $scope.users,
                        filterFields: ['loginname', 'systemid']
                    });
                    ownersPager.filter('');
                    tradersPager.filter('');
                    $scope.owners = ownersPager.first();
                    $scope.traders = tradersPager.first();
                    $scope.context.dataloaded = true;
                })

        }
    ])

accountsControllers.controller('AccountCreateTradeCtrl',
    ['$rootScope', '$scope', 'api',
        function ($rootScope, $scope, api) {
            var proxy = new tradeProxy($scope, $rootScope, api);
            $scope.order.account = $rootScope.currentaccount;

            function close() {
                $scope.$parent.context.createTrade = false;
                $scope.$parent.$apply();
            }

            $scope.createTrade = function () {
                proxy.createTrade(
                    function () {
                        $("#createTrade").modal('hide').on('hidden.bs.modal', function () {
                            saveState('#table', $rootScope.trades.state);
                            $('#table').DataTable().ajax.reload();
                            close();
                        })
                    })
            }

            $scope.close = function () {
                $("#createTrade").modal('hide').on('hidden.bs.modal', function () {
                    close()
                })
            }
        }
    ])

accountsControllers.controller('AccountCreateOrderCtrl',
    ['$rootScope', '$scope', 'api',
        function ($rootScope, $scope, api) {
            var proxy = new orderProxy($scope, $rootScope, api);
            $scope.order.account = $rootScope.currentaccount;

            function close() {
                $scope.$parent.context.createOrder = false;
                $scope.$parent.$apply();
            }

            $scope.createTrade = function () {
                proxy.createTrade(
                    function () {
                        $("#createOrder").modal('hide').on('hidden.bs.modal', function () {
                            saveState('#table', $rootScope.trades.state);
                            $('#table').DataTable().ajax.reload();
                            close()
                        })
                    })
            }

            $scope.close = function () {
                $("#createOrder").modal('hide').on('hidden.bs.modal', function () {
                    close()
                })
            }

        }
    ])
