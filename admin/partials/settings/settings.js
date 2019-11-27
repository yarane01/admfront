var settingsControllers = angular.module('settingsControllers', []);

settingsControllers.controller('SettingsCtrl',
    ['$q', '$rootScope', '$scope', '$http', '$route', 'api', '$timeout',
        function ($q, $rootScope, $scope, $http, $route, api, $timeout) {

            $scope.settings = [];
            $scope.context = {
                dataloaded: false,
                error: false,
                filter: ""
            }
            $scope.rawSettings = [];
            $scope.bulkContext = new BulkFilterContext();
            $scope.editContext = new EditContext();
            $scope.context.inprogress = false;
            $scope.context.error = false;

            var pager;

            $scope.accountFirst = function () {
                $scope.accounts = pager.first();
            }

            $scope.accountLast = function () {
                $scope.accounts = pager.last();
            }

            $scope.accountNext = function () {
                $scope.accounts = pager.next();
            }

            $scope.accountPrev = function () {
                $scope.accounts = pager.prev();
            }

            $scope.$watch("context.filter", function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        pager.filter(newValue);
                        $scope.accounts = pager.first();
                    }
                }
            )

            $scope.accountSelected = function (account) {
                $scope.editContext.newValue = account.systemid;
            }

            getItem = function (id) {
                for (var i = 0; i < $scope.settings.length; i++) {
                    var s = $scope.settings[i];
                    if (s.id == id) return s;
                }
                return undefined;
            };

            $scope.editInstrumentSetting = function (parent, instr) {

            };

            $scope.valueEdit = function (dialog, setting) {
                var valueSubmitCallback = {
                    ok: function (response) {
                        $scope.context.inprogress = false;
                        showMainForm();
                        $('#' + dialog).modal('hide').on('hidden.bs.modal',
                            function () {
                                $('#' + dialog).off();
                                $scope.init();
                            })
                    },
                    error: function (response) {
                        $scope.context.inprogress = false;
                        //$scope.context.errorMessage = "Request failed";
                        $scope.context.errorMessage = response.data.payload[0];
                        $scope.context.error = true;
                    }
                };

                //var setting = getItem(id);
                var context = {
                    setting: setting,
                    oldValue: setting.effective.value,
                    newValue: setting.effective.value,
                    submit: function () {
                        if (!context.newValue) return;
                        var data = {
                            systemsettingid: setting.id,
                            value: context.newValue,
                            maptype: setting.mapType,
                            valuetype: context.valueType
                        };
                        var json = JSON.stringify(data);
                        var url, method;
                        var id = $rootScope.settingsInfoStack.id();
                        //var id = setting.nodeid
                        if (setting.isDefault || setting.node.value == "") {
                            url = '/hierarchy/' + id + '/settings';
                            method = 'POST';
                        }
                        else {
                            url = '/hierarchy/' + id + '/settings/' + setting.settingid;
                            method = 'PUT';
                        }
                        $scope.context.inprogress = true;
                        api.do(method, url, json, valueSubmitCallback);
                    }
                };

                if (setting.effective.valuetype)
                    context.valueType = setting.effective.valuetype.toString();
                else
                    context.valueType = Object.keys(setting.valueTypes)[0];

                if (context.valueType == "80")
                    context.newValue = context.oldValue;

                hideMainForm();
                $scope.$apply(function () {
                        $scope.editContext = context;
                        $scope.context.inprogress = false;
                        $scope.context.error = false;
                        $('#' + dialog).modal().on('shown.bs.modal',
                            function () {
                                $('#new-value').focus();
                            }
                        )
                    }
                );
            };

            $scope.instrumentsEdit = function (setting) {
                //var setting = getItem(id);
                var context = new BulkFilterContext();
                context.title = setting.name;
                context.setting = setting;
                context.valueType = Object.keys(setting.valueTypes)[0];
                context.systemsettingid = setting.id;
                var instruments = setting.subItems;
                instruments.forEach(function (e) {
                    context.createItem(
                        {
                            name: e.name,
                            id: e.id,
                            enabled: e.canEdit(),
                            value: e.effective.value,
                            isDefault: e.isDefault,
                            effectiveNodeName: e.getEffectiveNodeName()
                        }
                    );
                });
                context.submit = function () {
                    if (!context.value) return;
                    var selected = context.getSelected();
                    if (selected.length == 0) return;
                    $scope.context.inprogress = true;
                    // collect ids for bulk update
                    var selids = "";
                    for (var i = 0; i < selected.length; i++) {
                        selids += ","+selected[i].id;
                    }
                    selids = selids.substring(1);
                    var submitItem = function () {
                            $scope.currentItem = "";
                            var data = {
                                systemsettingid: setting.id,
                                value: context.value,
                                maptype: setting.mapType,
                                valuetype: context.valueType,
                                conditions: selids
                            };
                            var json = JSON.stringify(data);
                            var id = $rootScope.settingsInfoStack.id();
                            //var id = setting.nodeid
                            var url = '/hierarchy/' + id + '/settings/' +
                                setting.id + '/bulkupdate';
                            api.do('POST', url, json,
                                {
                                    ok: function (response) {
                                        $scope.context.inprogress = false;
                                        showMainForm();
                                        //$route.reload();
                                        $('#instrumentsEdit').modal('hide');
                                        $scope.init();
                                    },
                                    error: function (response) {
                                        $scope.context.inprogress = false;
                                        $scope.context.errorMessage = "Request failed";
                                        $scope.context.errorMessage = response.data.payload[0];
                                        $scope.context.error = true;
                                    }
                                }
                            );
                    };
                    submitItem();
                };

                hideMainForm();
                $scope.$apply(function () {
                        $scope.bulkContext = context;
                        $scope.context.inprogress = false;
                        $scope.context.error = false;
                        $('#instrumentsEdit').modal();
                    }
                );
            };

            $scope.instrumentsDelete = function (setting) {
                //var setting = getItem(id);
                var context = new BulkFilterContext();
                context.title = setting.name;
                context.valueType = Object.keys(setting.valueTypes)[0];
                context.systemsettingid = setting.id;
                var instruments = setting.subItems;
                instruments.forEach(function (e) {
                    context.createItem(
                        {
                            name: e.name,
                            id: e.id,
                            enabled: true,
                            value: e.effective.value,
                            isDefault: e.isDefault,
                            effectiveNodeName: e.getEffectiveNodeName()
                        }
                    );
                });
                context.submit = function () {
                    var selected = context.getSelected();
                    if (selected.length == 0) return;
                    $scope.context.inprogress = true;
                    var ids = selected.map(function (i) {
                            return i.id;
                        }
                    ).join(',');
                    var data = {
                        conditions: ids
                    };
                    var json = JSON.stringify(data);
                    var id = $rootScope.settingsInfoStack.id();
                    var url = '/hierarchy/' + id + '/settings/' +
                        setting.id + '/bulkdelete';
                    api.do('DELETE', url, json,
                        {
                            ok: function (response) {
                                $scope.context.inprogress = false;
                                showMainForm();
                                $('#instrumentsDelete').modal('hide');
                                $scope.init();
                            },
                            error: function (response) {
                                $scope.context.inprogress = false;
                                $scope.context.errorMessage = "Request failed";
                                $scope.context.errorMessage = response.data.payload[0];
                                $scope.context.error = true;
                            }
                        }
                    );
                };

                hideMainForm();
                $scope.$apply(function () {
                        $scope.bulkContext = context;
                        $scope.context.inprogress = false;
                        $scope.context.error = false;
                        $('#instrumentsDelete').modal();
                    }
                );
            };

            var edit = function () {
                var id = $(this).parent().attr('id');
                if (id) {
                    var setting = getItem(id);
                    switch (setting.type) {
                        case 'value':
                            $scope.valueEdit(angular.copy(setting));
                            break;
                        case 'instrument':
                            $scope.instrumentsEdit(angular.copy(setting));
                            break;
                    }
                }
            };

            createTable = function () {
                var tableOptions = {
                    "data": $scope.settings,
                    "dom": "t",
                    "scrollY": calcDataTableHeight(),
                    "paging": false,
                    //"scrollCollapse": true,
                    "order": [[1, 'asc']],
                    createdRow: function (row, data, dataIndex) {
                        var r = $(row);
                        r.attr("id", data.id);
                        var title = data.name + '\n' +
                            data.description +
                            '\nLookup method: ' + data.lookupStr();
                        title += '\nType: ' + data.type;
                        if (!data.canEdit()) {
                            r.addClass('disabled');
                        }
                        if (data.isChanged()) {
                            r.addClass('setting-changed');
                        }
                        $('td:eq(1)', row).attr("title", title);
                    },
                    "columns": [
                        {
                            "data": "id",
                            "width": "5%"
                        },
                        {
                            "data": "name",
                            "width": "25%",
                            "class": "font-bold"
                        },
                        {
                            "data": null,
                            "width": "15%",
                            class: "text-center",
                            render: function (data, type, full, meta) {
                                return data.getValueTypesString();
                            }
                        },
                        {
                            "data": null,
                            "width": "15%",
                            class: "text-center",
                            render: function (data, type, full, meta) {
                                switch (data.type) {
                                    case 'value':
                                        return 'Single';
                                    case 'range':
                                        return 'Range';
                                        break;
                                    case 'compensation':
                                        return 'Compensation';
                                        break;
                                    case 'instrument':
                                        return 'Per instrument';
                                        break;
                                }
                            }
                        },
                        {
                            "data": "effective.value",
                            "width": "8%",
                            class: "text-center"
                        },
//                                {"data": "node.value",
//                                    "width": "10%",
//                                    class: "text-center"},
                        {
                            "data": "defaultValue",
                            "width": "8%",
                            class: "text-center"
                        },
                        //{"data": "effective.nodeName"}
                        {
                            "data": null,
                            "class": "link",
                            "width": "10%",
                            render: function (data, type, full, meta) {
                                return data.getEffectiveNodeLink();
                                //return data.getEffectiveNodeName();
                            }
                        },
                        {
                            "data": null,
                            "name": "clear",
                            //"class": "link",
                            "class": "actions",
                            "width": "10%",
                            "sortable": false,
                            render: function (data, type, full, meta) {
                                var access = $rootScope.access.settings;
                                return $.fn.actionList(
                                    {
                                        id: data.id,
                                        handler: 'settingActionClick(this)',
                                        items: [
                                            {
                                                title: "Edit",
                                                action: "Edit",
                                                access: access.Edit,
                                                class: 'edit-link text-bold'
                                            },
                                            {
                                                title: "Delete",
                                                action: "Delete",
                                                access: access.Delete,
                                                class: 'delete-link'
                                            },
                                            {
                                                title: "Clear",
                                                action: "Clear",
                                                access: access.Clear
                                            }
                                        ]
                                    }).html();
                            }
                        }
                    ]
                };
                $('#settings-table').DataTable(tableOptions);
                afterTableCreated();
            };

            afterTableCreated = function () {
                var table = $('#settings-table').DataTable();
                assignFilters('#settings-table');
                setTableActionsPosHandler('settings-table');
            };

            window.settingActionClick = function (link) {
                var action = $(link).data('action');
                var id = $(link).data('id');
                switch (action.toUpperCase()) {
                    case 'EDIT':
                        if (id) {
                            var setting = getItem(id);
                            switch (setting.type) {
                                case 'value':
                                    if (setting.name == "ACCOUNT_FOR_COMMISSIONS") {
                                        $scope.valueEdit('account-for-commission', angular.copy(setting));
                                        $http.get(apiurl + '/accounts2?filter=type%3D2&n1=1&n2=100')
                                            .then(function (response) {
                                                $scope.accountsList = response.data.payload[0];
                                                pager = new Pager({
                                                    items: $scope.accountsList,
                                                    filterFields: ['accountn', 'systemid']
                                                });
                                                pager.filter('');
                                                $scope.accounts = pager.first();
                                            });
                                    }
                                    else
                                        $scope.valueEdit('valueEdit', angular.copy(setting));
                                    break;
                                case 'instrument':
                                    $scope.instrumentsEdit(angular.copy(setting));
                                    break;
                            }
                        }
                        break;
                    case 'CLEAR':
                        var setting = getItem(id);
                        if (setting) {
                            var nodeid = $rootScope.settingsInfoStack.id();
                            var url = '/settings/' + nodeid + '/' + id;
                            $scope.context.clearingerror = false;
                            $scope.context.clearing = true;
                            api.delete(url, null,
                                {
                                    ok: function (response) {
                                        $scope.context.clearing = false;
                                    },
                                    error: function (response) {
                                        $scope.context.clearing = false;
                                        //$scope.context.errorMessage = "Request failed";
                                        $scope.context.errorMessage = response.data.payload[0];
                                        $scope.context.clearingerror = true;
                                    }
                                }
                            );

                        }
                        break;
                    case 'DELETE':
                        var setting = getItem(id);
                        if (setting) {
                            switch (setting.type) {
                                case 'value':
                                    var nodeid = $rootScope.settingsInfoStack.id();
                                    var url = '/hierarchy/' + nodeid + '/settings/' + setting.settingid;
                                    $scope.context.clearingerror = false;
                                    $scope.context.clearing = true;
                                    api.delete(url, null,
                                        {
                                            ok: function (response) {
                                                $scope.context.clearing = false;
                                                $scope.init();
                                            },
                                            error: function (response) {
                                                $scope.context.clearing = false;
                                                //$scope.context.errorMessage = "Request failed";
                                                $scope.context.errorMessage = response.data.payload[0];
                                                $scope.context.clearingerror = true;
                                            }
                                        }
                                    );
                                    break;
                                case 'instrument':
                                    $scope.instrumentsDelete(angular.copy(setting));
                                    break;
                            }
                        }
                        break;
                }
            };

            var nodeChangedValue = {
                class: {
                    name: 'info',
                    inline: ' class="info"'
                },
                title: {
                    message: 'Changed',
                    inline: ' title="Changed"'
                }
            };

            var nodeDefaultValue = {
                class: {
                    name: 'warning',
                    inline: ' class="warning"'
                },
                title: {
                    message: 'Default',
                    inline: ' title="Default"'
                }
            };

            function hideMainForm() {
                $('#settings.modal').css('opacity', 0.5);
            }

            function showMainForm() {
                $('#settings.modal').css('opacity', 1);
            }

            window.showSettings = function (settingid) {
                var setting = getItem(settingid);
                if (setting) {
                    switch (setting.effective.systemidtype) {
                        case 0:
                            $rootScope.settingsInfoStack
                                .push("unit", setting.effective.nodeId, setting.effective.nodeName);
                            $scope.init();
                            break;
                    }
                }
            };

            window.clearUnderlayingSettings = function (settingid) {
                var setting = getItem(settingid);
                if (setting) {
                    var nodeid = $rootScope.settingsInfoStack.id();
                    var url = '/settings/' + nodeid + '/' + settingid;
                    $scope.context.clearingerror = false;
                    $scope.context.clearing = true;
                    api.delete(url, null,
                        {
                            ok: function (response) {
                                $scope.context.clearing = false;
                            },
                            error: function (response) {
                                $scope.context.clearing = false;
                                //$scope.context.errorMessage = "Request failed";
                                $scope.context.errorMessage = response.data.payload[0];
                                $scope.context.clearingerror = true;
                            }
                        }
                    );

                }
            };

            $scope.goBack = function () {
                $rootScope.settingsInfoStack.pop();
                $scope.init();
            };

            $scope.instrumentsEditClose = function () {
                showMainForm();
            };

            $scope.instrumentsDeleteClose = function () {
                showMainForm();
            };

            $scope.valueEditClose = function () {
                showMainForm();
            };

            $scope.init = function () {
                $scope.context.dataloaded = false;
                $scope.context.dataerror = false;
                var type = $rootScope.settingsInfoStack.type();

                $http.get(apiurl + '/settings/' +
                    $rootScope.settingsInfoStack.id())
                    .then(function (result) {
                            $scope.rawSettings = result.data.payload;
                            try {
                                parseRawSettings($scope, $rootScope);
                                $('#settings-table').DataTable().destroy();
                                createTable();
                                $scope.context.dataloaded = true;
                                $timeout(function () {
                                    var table = $('#settings-table').DataTable();
                                    table.columns.adjust().draw();
                                }, 0);
                            }
                            catch (err) {
                                $scope.context.errorMessage = err.message;
                                $scope.context.dataloaded = true;
                                $scope.context.dataerror = true;
                            }

                        }, function (result) {
                        }
                    );
            }
        }
    ])


function Setting(id, nodeid) {
    return {
        id: id,
        nodeid: nodeid, //id of entity
        name: 'unknown setting',
        description: '',
        mapType: 0,
        lookuptype: 0,
        type: '', //value, instrument, range. compensation
        node: {
            nodeName: '',
            value: '',
            nodeId: 0,
            type: '', //unit, group, account etc.
            rangeStart: '',
            rangeEnd: ''
        },
        effective: {
            value: '',
            nodeId: 0,
            nodeName: '',
            rangeStart: '',
            rangeEnd: ''
        },
        defaultValue: 0,
        isDefault: true,
        canEdit: function () {
            //return (this.effective.nodeId == this.nodeid) || this.isDefault;
            return true;
        },
        lookupStr: function () {
            if (this.lookuptype == 1) return "First Found in Hierarchy";
            if (this.lookuptype == 2) return "Last Found in Hierarchy";
            if (this.lookuptype == 3) return "Collect from All nodes in Hierarchy for extra processing";
            return '';
        },
        getCellStyle: function () {
            if (this.isDefault) return nodeDefaultValue;
            else return nodeChangedValue;
        },
        hasChangedSubitems: function () {
            if (this.subItems) {
                for (var i = 0; i < this.subItems.length; i++) {
                    var s = this.subItems[i];
                    if (!s.isDefault) return true;
                }
            }
            return false;
        },
        getSubitem: function (id) {
            if (this.subItems) {
                for (var i = 0; i < this.subItems.length; i++) {
                    var s = this.subItems[i];
                    if (s.id == id) return s;
                }
            }
            return undefined;
        },
        getEffectiveNodeName: function () {
            if (this.effective.nodeId == 0)return 'default';
            else if (this.effective.nodeId == this.nodeid)return 'this';
            else return this.effective.nodeName;
        },
        getEffectiveNodeLink: function () {
            if (this.subItems) {
                if (this.hasChangedSubitems())
                    return 'changed';
                else
                    return 'default';
            }
            else if (this.effective.nodeId == 0)return 'default';
            else if (this.effective.nodeId == this.nodeid)return 'this';
            else return '<a href="Javascript:;" onclick="showSettings(' +
                    this.id + ')"  title="View settings">' +
                    this.effective.nodeName + '</a>';
        },
        getValueTypesString: function () {
            var result = [];
            if ((this.valueTypes) && (this.valueTypes != null)) {
                var keys = Object.keys(this.valueTypes);
                var self = this;
                keys.forEach(function (k) {
                    result.push(self.valueTypes[k]);
                });
                return result.join();
            }
            else
                return '-';
        },
        isChanged: function () {
            if (this.subItems) {
                if (this.hasChangedSubitems())
                    return true;
                else
                    return false;
            }
            else if (this.effective.nodeId == 0)return false;
            else if (this.effective.nodeId == this.nodeid)return true;
            else return false;
        },

    };
};

function parseRawSettings(scope, rootScope) {
    scope.settings = [];
    scope.rawSettings.forEach(function (s) {
        var system = s.systemsetting;
        var setting = new Setting(system.systemsettingid, s.nodeid);
        setting.name = system.constname;
        if (setting.name == 'WEB_TOOLS_DESCRIPTOR') return;

        setting.valueTypes = valuetypes[system.systemsettingid];
        if (!setting.valueTypes)
            throw {message: "valuetypes undefined for setting " + system.constname};
        setting.singleValueType = Object.keys(setting.valueTypes).length == 1;

        var subItems = [];
        //setting.defaultValue = trancateString(system.defaultvalue);
        setting.defaultValue = system.defaultvalue;
        //setting.defaultValue = system.defaultvalue;
        setting.description = system.description;
        setting.mapType = system.maptype;
        setting.lookuptype = system.lookuptype;
        var values = s.settingvalues;
        var effective = s.effectivevalues;

        switch (setting.mapType) {
            case 0:
                if (system.subcondition1type == 1) {
                    setting.type = 'value';
                    if (values.settingsbyvalue.length == 1) {
                        setting.node.value = values.settingsbyvalue[0].value;
                        setting.node.valuetype = values.settingsbyvalue[0].valuetype;
                        setting.settingid = values.settingsbyvalue[0].settingid;
                        setting.node.nodeName = values.nodename;
                        setting.systemidtype = values.systemidtype;
                        setting.node.nodeId = values.nodeid;
                        setting.isDefault = false;
                    }
                    else setting.node.value = '';

                    if (effective.length == 1) {
                        setting.effective.value = effective[0].settingbyvalue.value;
                        setting.effective.valuetype = effective[0].settingbyvalue.valuetype;
                        setting.settingid = effective[0].settingbyvalue.settingid;
                        setting.effective.nodeName = effective[0].nodename;
                        setting.effective.systemidtype = effective[0].systemidtype;
                        setting.effective.nodeId = effective[0].nodeid;
                        setting.isDefault = false;
                    }
                    else
                        setting.effective.value = setting.defaultValue;
                }
                else {
                    setting.type = 'instrument';
                    var instruments = rootScope.instruments.data;
                    for (var i = 0; i < instruments.length; i++) {
                        var instr = instruments[i];
                        //var subItem = new Setting(instr.instrumentid, setting.id);
                        var subItem = new Setting(instr.instrumentid, setting.nodeid);
                        subItem.parent = setting;
                        subItem.name = instr.symbol;
                        subItem.symbolId = instr.instrumentid;
                        subItem.effective.value = setting.defaultValue;
                        subItems.push(subItem);
                    }
                    setting.subItems = subItems;

                    setting.subItems.forEach(function (sub) {
                        for (var i = 0; i < values.settingsbyvalue.length; i++) {
                            var v = values.settingsbyvalue[i];
                            if (v.subcondition1 == sub.symbolId) {
                                sub.node.value = v.value;
                                break;
                            }
                        }
                        for (var i = 0; i < effective.length; i++) {
                            var v = effective[i];
                            if (v.settingbyvalue.subcondition1 == sub.symbolId) {
                                sub.effective.value = v.settingbyvalue.value;
                                sub.effective.nodeName = v.nodename;
                                sub.effective.nodeId = v.nodeid;
                                sub.isDefault = false;
                                break;
                            }
                        }
                    });
                }
                break;
            case 1:
                setting.type = 'range';
                var rangemap = settingrangemap[system.systemsettingid];
                setting.rangetypes = {};
                rangemap.forEach(function (r) {
                        setting.rangetypes[r] = rangetypemap[r];
                    }
                )
                setting.singleRangeType = Object.keys(setting.rangetypes).length == 1;
                var map = new Map();
                values.ranges.forEach(function (r) {
                    var subItem = new Setting(r.settingid, setting.nodeid);
                    subItem.node.nodeName = values.nodename;
                    subItem.node.id = values.nodeid;
                    subItem.node.value = r.value;
                    subItem.node.valuetype = r.valuetype;
                    subItem.node.settingid = r.settingid;
                    subItem.node.rangetype = r.rangetype;
                    subItem.node.rangeStart = r.rangestart;
                    subItem.node.rangeEnd = r.rangeend;
                    subItem.node.rangeid = r.rangeid;
                    map.set(r.rangeid, subItem);
                });

                effective.forEach(function (e) {
                    var r = e.range;
                    var subItem = map.get(r.rangeid);
                    if (!subItem) {
                        subItem = new Setting(r.settingid, setting.nodeid);
                        map.set(r.rangeid, subItem);
                    }
                    subItem.effective.nodeName = e.nodename;
                    subItem.effective.nodeId = e.nodeid;
                    subItem.effective.value = r.value;
                    subItem.effective.rangeStart = r.rangestart;
                    subItem.effective.rangeEnd = r.rangeend;
                    subItem.isDefault = false;
                });
                map.forEach(function (value, key) {
                    //console.log(key);
                    //if (value.node.value == '')
                    //    value.node.value = 'undefined';
                    subItems.push(value);
                });
                if (subItems.length > 0)
                    setting.subItems = subItems;
                else
                    setting.effective.value = setting.defaultValue;
                break;
            case 2:
                setting.type = 'compensation';
                var map = new Map();
                values.compensations.forEach(function (r) {
                    var subItem = new Setting(r.settingid, setting.nodeid);
                    subItem.node.nodeName = values.nodename;
                    subItem.node.id = values.nodeid;
                    subItem.node.value = r.value;
                    subItem.node.rangeStart = r.rangestart;
                    subItem.node.rangeEnd = r.rangeend;
                    map.set(r.settingid, subItem);
                });

                effective.forEach(function (e) {
                    var r = e.compensation;
                    var subItem = map.get(r.settingid);
                    if (!subItem) {
                        subItem = new Setting(r.settingid, setting.nodeid);
                        map.set(r.settingid, subItem);
                    }
                    subItem.effective.nodeName = e.nodename;
                    subItem.effective.nodeId = e.nodeid;
                    subItem.effective.value = r.value;
                    subItem.effective.rangeStart = r.rangestart;
                    subItem.effective.rangeEnd = r.rangeend;
                    subItem.isDefault = false;
                });
                map.forEach(function (value, key) {
                    console.log(key);
                    if (value.node.value == '')
                        value.node.value = 'undefined';
                    subItems.push(value);
                });
                if (subItems.length > 0)
                    setting.subItems = subItems;
                else
                    setting.effective.value = setting.defaultValue;
                break;
        }

        //if (setting.subItems)//DEBUG!!!!!!!
//                            if ((setting.subItems) || (setting.nodeType == 'value'))//DEBUG!!!!!!!
//                            if (setting.type == 'range')//DEBUG!!!!!!!
//                            if (setting.nodeType == 'value')//DEBUG!!!!!!!
        scope.settings.push(setting);
    });
};