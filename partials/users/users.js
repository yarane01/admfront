var usersControllers = angular.module('usersControllers', []);

usersControllers.controller('UsersCtrl',
    ['$q', '$rootScope', '$scope', '$http', 'api', '$timeout', 'modal', '$location', '$route',
        function ($q, $rootScope, $scope, $http, api, $timeout, modal, $location, $route) {

            $scope.context = {
                createUser: false,
                createAccount: false,
                editUser: false
            };

            //region table
            $scope.createTable = function () {
                $scope.tableOptions = {
                    //"dom": "irtip",
                    "dom": "<'row'<'col-sm-6'i>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    "processing": true,
                    "serverSide": true,
                    "language": {
                        "processing": "Loading..."
                    },
                    "order": [[2, 'asc']],
                    //"pageLength": 10,
                    "scrollY": calcDataTableHeight(),
                    "scrollX": true,
                    "paging": true,
                    "stateSave": true,
                    "name": "users",
                    stateSaveCallback: function (settings, data) {
                        $rootScope.users.state.data = data;
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.users.state.data)
                            return $rootScope.users.state.data;
                        else
                            return null;
                    },
                    "initComplete": function (settings, json) {
                    },
                    "ajax": function (data, callback, settings) {
                        if (needApplyExternalFilter()) return;
                        var orderCol;
                        var index = data.order[0].column;
                        switch (settings.aoColumns[index].name) {
                            case "systemid":
                                orderCol = 'SYSTEMID';
                                break;
                            case "loginname":
                                orderCol = 'LOGINNAME';
                                break;
                            case "firstname":
                                orderCol = 'firstname';
                                break;
                            case "lastname":
                                orderCol = 'lastname';
                                break;
                            case "parent":
                                orderCol = 'PARENTHIERARCHYNODENAME';
                                break;
                            case "country":
                                orderCol = 'COUNTRYCODE';
                                break;
                            case "city":
                                orderCol = 'CITY';
                                break;
                            case "state":
                                orderCol = 'STATECODE';
                                break;
                            case "zip":
                                orderCol = 'ZIP';
                                break;
                            case "closed":
                                orderCol = 'CLOSED';
                                break;
                            case "locked":
                                orderCol = 'ISLOCKED';
                                break;
                            case "tradingstate":
                                orderCol = 'TRADINGSTATE';
                                break;
                            case "onlinestatus":
                                orderCol = 'ONLINESTATUS';
                                break;
                        }

                        var reqFilters = [];
                        for (var i = 1; i < 14; i++) {
                            var search = data.columns[i].search.value;
                            if (search != '') {
                                switch (settings.aoColumns[i].name) {
                                    case "systemid":
                                        var id = parseInt(search);
                                        if (id) reqFilters.push("systemid='" + search + "'");
                                        else {
                                            $scope.error = true;
                                            $scope.errorMessage = "ID filter must be an integer";
                                            return;
                                        }
                                        break;
                                    case "loginname":
                                        if ($rootScope.users.state.externalFilter.applied)
                                            reqFilters.push("LOGINNAME LIKE '" + search + "'");
                                        else
                                            reqFilters.push("upper(LOGINNAME) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "firstname":
                                        reqFilters.push("upper(firstname) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "lastname":
                                        reqFilters.push("upper(lastname) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "parent":
                                        reqFilters.push("upper(PARENTHIERARCHYNODENAME) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "country":
                                        reqFilters.push("upper(COUNTRYCODE) LIKE '" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "city":
                                        reqFilters.push("upper(CITY) LIKE '" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "state":
                                        reqFilters.push("upper(STATECODE) LIKE '" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "zip":
                                        reqFilters.push("upper(ZIP) LIKE '" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "closed":
                                        reqFilters.push("upper(CLOSED) LIKE '%" + search.trim().toUpperCase() + "%'");
                                        break;
                                    case "locked":
                                        if (search.toUpperCase() == 'Y')
                                            reqFilters.push("ISLOCKED='true'");
                                        else reqFilters.push("ISLOCKED='false'");
                                        break;
                                    case "tradingstate":
                                        reqFilters.push("upper(TRADINGSTATE)='" + search.toUpperCase() + "'");
                                        break;
                                    case "onlinestatus":
                                        if (search.toUpperCase() == 'Y')
                                            reqFilters.push("ONLINESTATUS=1");
                                        else reqFilters.push("ONLINESTATUS=0");
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
                            $http.get(apiurl + '/users2', {params: reqParams}),
                            $http.get(apiurl + '/users2count', {params: countFilter})
                        ])
                            .then(function (response) {
                                if (response[0].data.status == "OK") {
                                    $rootScope.users.data = response[0].data.payload[0];
                                    $rootScope.updateSettingList($rootScope.users);
                                    var filtered = response[1].data.payload[0].count;
                                    $rootScope.users.fillRoles();

                                    callback({
                                            "recordsTotal": $rootScope.users.total,
                                            "recordsFiltered": filtered,
                                            data: $rootScope.users.data
                                        }
                                    );
                                    setTableActionsPosHandler('table');
                                    if ($rootScope.users.state.selected.length > 0)
                                        selectRow('#table', $rootScope.users.state.selected[0]);
                                }
                                else {
                                    $scope.errorMessage = response[0].data.payload[0];
                                    $scope.error = true;
                                }
                            }, function (response) {
                                $scope.errorMessage = response.data;
                                $scope.error = true;
                            })
                    },
                    //"data": $rootScope.users.data,
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.systemid);
                        if ($rootScope.users.isAdmin(data.systemid))
                            $(row).addClass('row-admin');
                        //$('td', row).addClass('text-warning');
                        //$(row).on('click', singleSelectionRowClick);
                    },
                    "columns": [
                        {
                            "data": null,
                            "defaultContent": '',
                            "sortable": false,
                            "class": "details closed",
                            save: false,
                            name: ""
                        },
                        {
                            "data": "systemid",
                            save: false,
                            name: "systemid"
                        },
                        {
                            "data": "loginname",
                            "class": "font-bold",
                            save: false,
                            name: "loginname"
                        },
                        {
                            "data": "firstname",
                            save: true,
                            name: "firstname"
                        },
                        {
                            "data": "lastname",
                            save: true,
                            name: "lastname"
                        },
                        {
                            //"data": "parenthierarchynodename"
                            "data": null,
                            save: true,
                            name: "parent",
                            "render": function (data, type, full, meta) {
                                return '<a href="Javascript:;" onclick="parentClick(\''
                                    + data.parenthierarchynodename + '\')">' + data.parenthierarchynodename + '</a>';
                            }
                        },
                        {
                            "data": "country",
                            save: true,
                            name: "country"
                        },
                        {
                            "data": "city",
                            save: true,
                            name: "city"
                        },
                        {
                            "data": "state",
                            save: true,
                            name: "state"
                        },
                        {
                            "data": "zip",
                            save: true,
                            name: "zip"
                        },
                        {
                            "data": "closed",
                            save: true,
                            name: "closed"
                        },
                        {
                            "data": "islocked",
                            save: true,
                            name: "locked",
                            "render": function (data, type, full, meta) {
                                return data ? 'Y' : 'N';
                            }
                        },
                        {
                            "data": "tradingstate",
                            save: true,
                            name: "tradingstate"
                        },
                        {
                            "data": "onlinestatus",
                            save: true,
                            name: "onlinestatus",
                            "render": function (data, type, full, meta) {
                                return data == 1 ? 'Y' : 'N';
                            }
                        },
                        {
                            "data": "lastlogged",
                            save: true,
                            name: "lastlogged"
                        },
                        {
                            "data": null,
                            "sortable": false,
                            "class": "actions",
                            save: false,
                            name: "",
                            "render": function (data, type, full, meta) {
                                var access = $rootScope.access.users;
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
                                                title: "Exposure",
                                                action: "Exposure",
                                                access: access.Exposure
                                            },
                                            {
                                                type: "submenu",
                                                title: "Lock/Unlock",
                                                class: "open-left",
                                                items: [
                                                    {
                                                        title: "Lock",
                                                        action: "Lock",
                                                        access: access.LockUnlock
                                                    },
                                                    {
                                                        title: "Unlock",
                                                        action: "Unlock",
                                                        access: access.LockUnlock
                                                    },
                                                ]
                                            },
                                            {
                                                title: "Update password",
                                                action: "Update password",
                                                access: access.Password
                                            },
                                            {
                                                title: "Change parent",
                                                action: "Change parent",
                                                access: access.Password
                                            },
                                            {
                                                title: "Create account",
                                                action: "Create account",
                                                access: access.CreateAccount
                                            },
                                            {
                                                title: "Trader report",
                                                action: "Trader report",
                                                access: access.Reports
                                            }/*,
                                             {
                                             title: "Delete",
                                             action: "Delete",
                                             access: access.Delete,
                                             class: 'delete-link'
                                             }*/
                                        ]
                                    }).html();
                            }
                        }
                    ]
                }
            }

            function needApplyExternalFilter() {
                return ($rootScope.users.state.externalFilter.name &&
                (!$rootScope.users.state.externalFilter.applied));
            }

            formatSubTable = function (data) {

                var subtable = $('<div>');
                var slider = $('<div>', {class: 'table-slider'}).appendTo(subtable);
                var table = $('<table>', {class: 'table-info-table'}).appendTo(slider);

                var row = $('<tr>', {class: 'table-info'}).appendTo(table);
                //row.appendTo(table);
                var col = $('<td>').appendTo(row);
                var dl = $('<dl>', {class: 'dl-horizontal'}).appendTo(col);
                $('<dt>', {text: "ID"}).appendTo(dl);
                $('<dd>', {text: data.systemid}).appendTo(dl);
                /*
                 $('<dt>', {text: "First name"}).appendTo(dl);
                 $('<dd>', {text: data.firstname}).appendTo(dl);
                 $('<dt>', {text: "Last name"}).appendTo(dl);
                 $('<dd>', {text: data.lastname}).appendTo(dl);
                 */
                $('<dt>', {text: "Address"}).appendTo(dl);
                $('<dd>', {text: data.address}).appendTo(dl);
                $('<dt>', {text: "City"}).appendTo(dl);
                $('<dd>', {text: data.city}).appendTo(dl);
                $('<dt>', {text: "State"}).appendTo(dl);
                $('<dd>', {text: data.state}).appendTo(dl);
                $('<dt>', {text: "ZIP"}).appendTo(dl);
                $('<dd>', {text: data.zip}).appendTo(dl);
                $('<dt>', {text: "Country"}).appendTo(dl);
                $('<dd>', {text: data.country}).appendTo(dl);


                col = $('<td>').appendTo(row);
                dl = $('<dl>', {class: 'dl-horizontal'}).appendTo(col);
                $('<dt>', {text: "E-mail"}).appendTo(dl);
                $('<dd>', {text: data.email}).appendTo(dl);
                $('<dt>', {text: "Reset password E-mail"}).appendTo(dl);
                $('<dd>', {text: data.resetpasswordemail}).appendTo(dl);
                $('<dt>', {text: "Day phone"}).appendTo(dl);
                $('<dd>', {text: data.dayphone}).appendTo(dl);
                $('<dt>', {text: "Home phone"}).appendTo(dl);
                $('<dd>', {text: data.homephone}).appendTo(dl);
                $('<dt>', {text: "Roles"}).appendTo(dl);
                for (var i = 0; i < data.roles.length; i++) {
                    $('<dd>', {text: userRolesMap[data.roles[i]]}).appendTo(dl);
                }
                col = $('<td>').appendTo(row);
                dl = $('<dl>', {
                    class: 'dl-horizontal'
                }).appendTo(col);

                function buildList(list, title) {
                    $('<dt>', {text: title}).appendTo(dl);
                    for (var i = 0; i < list.length; i++) {
                        var account = list[i];
                        var dd = $('<dd>').appendTo(dl);
                        $('<a>', {
                            href: "Javascript:;",
                            onclick: "goAccount(\'" + account + "\')",
                            text: account
                        }).appendTo(dd);
                    }
                }

                if (data.traderonaccounts.length > 0)
                    buildList(data.traderonaccounts, "Trader on account(s)");
                if (data.ownerofaccounts.length > 0)
                    buildList(data.ownerofaccounts, "Owner of account(s)")

                return subtable.html();
            }

            $scope.afterTableCreated = function () {
                var table = $('#table').DataTable();
                assignFilters('#table');

                $('#table tbody').on('click', '.actions', function () {
                    var row = $(this).parent();
                    singleSelectionRow(row);
                });

                $('#table tbody').on('click', 'td:not(.actions)', function () {
                    var row = $(this).parent();
                    if ($(row).hasClass('table-info')) return;
                    singleSelectionRow(row);
                    var datarow = table.row(row);
                    var data = datarow.data();
                    var detailsCell = $(row.children('.details'));
                    if (!data) return;
                    if (datarow.child.isShown()) {
                        $('.table-slider', datarow.child()).slideUp(function () {
                            datarow.child.hide();
                            $(row).removeClass('shown');
                            $(detailsCell).toggleClass('opened closed');
                        });
                    }
                    else {
                        datarow.child(formatSubTable(data), 'table-info no-padding').show();
                        $(row).addClass('shown');
                        $('.table-slider', datarow.child()).slideDown();
                        $(detailsCell).toggleClass('opened closed');
                    }

                });
                var colSel = new $.fn.colSel(table, {
                    visObject: tableProperties.Columns,
                    saveFunc: $rootScope.saveTableProperties
                });
                $(colSel).appendTo('#rigth-group');
                $('#page-wrapper').addClass('page-animation');
                if (needApplyExternalFilter()) {
                    $rootScope.users.state.externalFilter.applied = true;
                    clearState(table, $rootScope.users.state);
                    setFilterValue(table, $rootScope.users.state, 1,
                        $rootScope.users.state.externalFilter.name, false);
                    saveState('#table', $rootScope.users.state);
                    table.ajax.reload();
                }
                else
                    restoreState(table, $rootScope.users.state, true);
            };

            $scope.clearExternalFilter = function () {
                $rootScope.users.state.externalFilter.applied = false;
                $rootScope.users.state.externalFilter.name = undefined;
                $scope.clearAllFilters();
            }

            $scope.clearAllFilters = function () {
                var table = $('#table').DataTable();
                clearState(table, $rootScope.users.state);
                table.ajax.reload();
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

            window.goAccount = function (name) {
                $rootScope.accounts.state.externalFilter.name = name;
                $rootScope.accounts.state.externalFilter.applied = false;
                $scope.$apply(function () {
                    $location.path("/accounts");
                })
            };


//endregion

//region actions

            function getAccount(name) {
                $scope.context.inprogress = true;
                $scope.context.error = false;
                api.getAccountByName(name,
                    {
                        ok: function (response) {
                            $scope.context.inprogress = false;
                            $scope.account = response.data.payload[0];
                            $scope.money.systemid = $scope.account.systemid;
                        },
                        error: function (response) {
                            $scope.context.inprogress = false;
                            $scope.context.error = true;
                            $scope.context.errorText = response.data.payload[0];
                        }
                    }
                );
            }

            window.accountInfo = function (name) {
                $scope.account = undefined;
                $scope.money = {amount: 1000, description: ''};
                //$('#money').collapse('hide');
                $('#account-info').modal();
                getAccount(name);
            };

            window.actionClick = function (link) {
                var action = $(link).data('action');
                var id = $(link).data('id');
                //selectRow('#table', id);
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
                    case 'LOCK':
                        $scope.lockDialog(id);
                        break;
                    case 'UNLOCK':
                        $scope.unlockDialog(id);
                        break;
                    case 'UPDATE PASSWORD':
                        $scope.changePasswordDialog(id);
                        break;
                    case 'CHANGE PARENT':
                        $scope.changeParentDialog(id);
                        break;
                    case 'CREATE ACCOUNT':
                        $scope.createAccountDialog(id);
                        break;
                    case 'TRADER REPORT':
                        $scope.goReports(id);
                        break;
                    case 'DELETE':
                        $scope.deleteDialog(id);
                        break;
                }
            };

            var moneyCallback = {
                ok: function (response) {
                    getAccount($scope.account.accountn);
                },
                error: function (response) {
                    $scope.context.inprogress = false;
                    $scope.context.error = true;
                    $scope.context.errorText = response.data.payload[0];
                }
            };

            $scope.depositAccount = function () {
                $scope.context.inprogress = true;
                api.depositAccount($scope.money, moneyCallback);
            };

            $scope.withdrawAccount = function () {
                $scope.context.inprogress = true;
                api.withdrawAccount($scope.money, moneyCallback);
            };

            function getItem(id) {
                return $rootScope.users.getById(id);
            }

            function succes(dialog) {
                $scope.context.inprogress = false;
                $('#' + dialog).modal('hide');
                saveState('#table', $rootScope.users.state);
                $('#table').DataTable().ajax.reload();
            }


            $scope.goReports = function (id) {
                //var url = reportsurl + '/traderreport?StartUnitID=' + id;
                var item = getItem(id);
                var url = reportsurl + '/traderreport?tradern=' + item.loginname;
                openInNewTab(url);
            }

            $scope.goSettings = function (id) {
                var item = getItem(id);
                $rootScope.settingsInfoStack.clear();
                $rootScope.settingsInfoStack.push("user",
                    item.systemid, item.loginname);
                $('#settings').modal();
                angular.element($('#settings')).scope().init();
                //$location.path('/settings');
            };

            $scope.deleteItem = function () {
                $scope.context.inprogress = true;
                api.deleteUser($scope.user.systemid, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            succes('delete');
                            $rootScope.updateUserCount();
                        }
                    }
                ));
            };

            $scope.createUser = function () {
                $scope.context.inprogress = true;
                $scope.user.cleanup();
                api.createUser($scope.user, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            succes('createUser');
                            $rootScope.updateUserCount();
                            $rootScope.userslist.upToDate = false;
                            $rootScope.updateUsersList();
                        }
                    }
                ));
            };

            $scope.updateUser = function () {
                $scope.context.inprogress = true;
                var id = $scope.user.systemid;
                api.updateUser($scope.user, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            succes('editUser');
                        }
                    }
                ));
            };

            $scope.lockUser = function () {
                $scope.context.inprogress = true;
                api.lockUser($scope.lock, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            succes('lockUser');
                        }
                    }
                ));
            };
            $scope.unlockUser = function () {
                $scope.context.inprogress = true;
                api.unlockUser($scope.user.systemid, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            succes('unlockUser');
                        }
                    }
                ));
            };

            $scope.changePassword = function () {
                $scope.context.inprogress = true;
                api.updateUserPassword($scope.updatePassword, angular.extend(errorHandler($scope),
                    {
                        ok: function () {
                            succes('changePassword');
                        }
                    }
                ));
            };

            $scope.createAccount = function () {
                $scope.context.inprogress = true;
                var id = $scope.account.userid;
                api.createAccount($scope.account, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            succes('createAccount');
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
                                succes('changeParent');
                            }
                        }
                    ));
            };

            $scope.Refresh = function () {
                $('#table').DataTable().ajax.reload();
            }


//endregion

//region dialogs
            $scope.deleteDialog = function (id) {
                beforeDialog($scope);
                $scope.user = $.extend({}, getItem(id));
                $scope.delete = {
                    systemid: $scope.user.systemid,
                    title: 'user ' + $scope.user.loginname,
                };
                $scope.$apply();
                $('#delete').modal();
            };

            $scope.lockDialog = function (id) {
                beforeDialog($scope);
                $scope.user = $.extend({}, getItem(id));
                $scope.lock = {
                    systemid: $scope.user.systemid,
                    loginname: $scope.user.loginname,
                    disabletime: "forever",
                    cause: ""
                };
                setFocusOnModalWindow('lockUser', 'user-lock');
                $scope.$apply();
                $('#lockUser').modal();
            };

            $scope.unlockDialog = function (id) {
                beforeDialog($scope);
                $scope.user = $.extend({}, getItem(id));
                $scope.$apply();
                $('#unlockUser').modal();
            };


            $scope.exposureDialog = function (id) {
                var item = getItem(id);
                var title = 'user ' + item.loginname;
                $('#exposure').modal();
                api.getExposure(item.systemid, title, 'users', $scope);
            };

            $scope.editDialog = function (id) {
                $scope.user = $.extend({}, getItem(id));
                modal.showEditUserDialog($scope, true);
            };

            $scope.createDialog = function (user) {
                $scope.user = $rootScope.users.getEmpty();
                modal.showCreateUserDialog($scope);
            };

            $scope.createAccountDialog = function (id) {
                var user = getItem(id);
                $scope.parents = $rootScope.getAccountParents();
                $scope.account = $rootScope.accounts.getEmpty();
                $scope.account.accountn = user.loginname;
                $scope.account.traderloginname = user.loginname;
                $scope.account.ownerloginname = user.loginname;
                $scope.account.userid = user.systemid;
                modal.showCreateAccountDialog($scope, true, false);
                //beforeDialog($scope);
                //modal.showShort('#createAccount', $scope, $scope.context, 'createAccount', '#account-create', true);

            };

            $scope.changePasswordDialog = function (id) {
                beforeDialog($scope);
                $scope.user = $.extend({}, getItem(id));
                $scope.updatePassword = {
                    loginname: $scope.user.loginname,
                    password: "",
                    systemid: $scope.user.systemid
                };
                setFocusOnModalWindow('changePassword', 'user-password');
                $scope.$apply();
                $('#changePassword').modal();
            };


            $scope.changeParentDialog = function (id) {
                beforeDialog($scope);
                $scope.user = $.extend({}, getItem(id));
                $scope.updateParent = {
                    loginname: $scope.user.loginname,
                    systemid: $scope.user.systemid,
                    parents: $rootScope.getUserParents()
                };
                $scope.$apply();
                $('#changeParent').modal();
            };

//endregion

            $rootScope.activePage = "users";

            $rootScope.init()
                .then(function () {
                    $scope.parents = $rootScope.getUserParents();
                    $scope.createTable();
                    $scope.$broadcast('dataloaded');
                    //})
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
                $http.get(apiurl + '/users2count')
                    .then(
                        function (res) {
                            var count = res.data.payload[0].count;
                            $http.get(apiurl + '/users2', {params: {n1: 1, n2: count}})
                                .then(
                                    function (res) {
                                        var csv = json2csv({data: res.data.payload[0]});
                                        saveData("Users.csv", csv);
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


            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.users.state);
            });

        }
    ])

usersControllers.controller('CreateDemoUsersCtrl',
    ['$rootScope', '$scope', '$http', 'api', '$timeout',
        function ($rootScope, $scope, $http, api, $timeout) {

            $scope.currencies = currencies;

            $scope.demoUsers = {
                loginNamePrefix: "test",
                start: 0,
                count: 10,
                deposit: 1000000,
                currency: "USD",
                password: "Coincides to login name"
            }

            function error(response) {
                $scope.demoUsers.inProgress = false;
                $scope.demoUsers.hint = response.data.payload[0];
                if ($scope.demoUsers.hint == '') $scope.demoUsers.hint = "Request failed";
            }

            $scope.currentNumber = 0;

            $scope.createUsers = function () {
                $("#user-progress")
                    .css("width", 0)
                    .attr("aria-valuenow", 0)

                $scope.demoUsers.inProgress = true;
                var progress = 0;
                var step = 100 / $scope.demoUsers.count;
                var count = 0;
                var nameBase = $scope.demoUsers.start;

                function create() {
                    var username = $scope.demoUsers.loginNamePrefix + nameBase++;
                    var user = {
                        loginname: username,
                        istrader: true,
                        ismoneyowner: true,
                        tradingstate: "enabled",
                        firstname: "",
                        lastname: "",
                        address: "",
                        city: "",
                        state: "",
                        zip: "",
                        country: "",
                        password: username,
                        parentsystemid: $scope.parentsystemid
                    }
                    var account = {
                        parentsystemid: $scope.parentsystemid,
                        accountn: user.loginname,
                        ownerloginname: user.loginname,
                        traderloginname: user.loginname,
                        basecurrency: $scope.demoUsers.currency,
                        description: ""
                    }

                    $scope.demoUsers.hint = "Creating user " + user.loginname;
                    api.createUser(user,
                        {
                            ok: function (response) {
                                $scope.demoUsers.hint = "Creating account " + account.accountn;
                                api.createAccount(account,
                                    {
                                        ok: function (response) {
                                            var id = response.data.payload[0].systemid;
                                            var deposit = {
                                                accountn: account.accountn,
                                                systemid: id,
                                                amount: $scope.demoUsers.deposit,
                                                currency: $scope.demoUsers.currency,
                                                description: ''
                                            }
                                            $scope.demoUsers.hint = "Depositing account " + account.accountn;
                                            api.depositAccount(deposit,
                                                {
                                                    ok: function () {
                                                        progress += step;
                                                        var value = Math.round(progress);
                                                        $("#user-progress")
                                                            .css("width", value + "%")
                                                            .attr("aria-valuenow", value)
                                                        count++;
                                                        if (count < $scope.demoUsers.count) {
                                                            create()
                                                        }
                                                        else {
                                                            $scope.demoUsers.hint = "";
                                                            $scope.demoUsers.inProgress = false;
                                                        }
                                                    },
                                                    error: error
                                                }
                                            )
                                        },
                                        error: error
                                    }
                                )
                            },
                            error: error

                        }
                    );
                }

                create()
            }

        }
    ])
