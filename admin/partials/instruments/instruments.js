var instrumentsControllers = angular.module('instrumentsControllers', [])

instrumentsControllers.controller('InstrumentsCtrl',
    ['$q', '$rootScope', '$scope', '$http', '$route', 'api', '$timeout', 'SubscriptionService',
        function ($q, $rootScope, $scope, $http, $route, api, $timeout, SubscriptionService) {

            $scope.instrument = null
            $rootScope.activePage = "instruments"
            $scope.selected = []
            $scope.context = {
                showHistory: false
            }
            $scope.bulkContext = new BulkContext()

            $scope.getInstrumentsTypesDescription = function () {
                var result = ''
                for (var prop in instrumenttypemap) {
                    result += '<p>' + prop + ': ' + instrumenttypemap[prop] + '</p>'
                }
                return result
            }

            $scope.createTable = function () {
                $scope.tableOptions = {
                    "data": $rootScope.instruments.data,
                    "order": [[1, 'asc']],
                    "dom": "<'row'<'col-sm-6'i>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-5'i>>",
                    "scrollY": calcDataTableHeight(),
                    "scrollX": true,
                    "paging": true,
                    "pageLength": 15,
                    "dom": "<'row'<'col-sm-6'i>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
                    //"scrollCollapse": true,
                    //"scroller": true,
                    "processing": true,
                    "language": {
                        "processing": "Loading..."
                    },
                    //"autoWidth": false,
                    "stateSave": true,
                    "name": "instruments",
                    buttons: [
                        {
                            extend: 'csvHtml5',
                            //text: '<i class="fa fa-file-text-o"></i>',
                            text: "Export to CSV",
                            //titleAttr: 'Export to CSV',
                            title: 'Instruments',
                            exportOptions: {
                                //orthogonal: 'export',
                                columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
                            }
                        }
                    ],
                    stateSaveCallback: function (settings, data) {
                        $rootScope.instruments.state.data = data
                    },
                    stateLoadCallback: function (settings) {
                        if ($rootScope.instruments.state.data)
                            return $rootScope.instruments.state.data
                        else
                            return null
                    },
                    createdRow: function (row, data, dataIndex) {
                        $(row).attr("id", data.instrumentid)
                        if (data.tradingDisabled) {
                            $(row).addClass('trading-disabled')
                            var symbolCell = $('td:nth-child(2)', row)
                            symbolCell.attr("title", "Trading is disabled")
                            symbolCell.tooltip({ placement: "right", container: "#table" })
                        }
                        var tpCell = $('td:nth-child(5)', row)
                        tpCell.attr("title", data.tradingperiod)
                        tpCell.tooltip({ placement: "right", container: "#table" })
                        //$(row).attr("style", "cursor: pointer");
                        //$('td:not(:last)', row).on('click', rowClick);
                        $('td:not(.actions)', row).on('click', cellClick)
                    },
                    initComplete: function () {

                    },
                    "columns": [
                        {
                            "data": "instrumentid",
                            save: false
                        },
                        {
                            "data": "symbol",
                            "class": "font-bold symbol",
                            save: false
                        },
                        {
                            data: "maxpipsupdate",
                            save: true,
                            name: "maxpipsupdate"
                        },
                        {
                            data: "spread",
                            class: "spread",
                            save: true,
                            name: "spread"
                        },
                        {
                            data: "tradingperiod",
                            class: "tradingperiod",
                            save: true,
                            name: "tradingperiod"
                        },
                        {
                            data: "marginrequirement",
                            save: true,
                            name: "marginrequirement"
                        },
                        {
                            "data": "pipposition",
                            save: true,
                            name: "pipposition"
                        },
                        {
                            "data": "round",
                            save: true,
                            name: "round"
                        },
                        {
                            "data": null,
                            save: false,
                            "render": function (data, type, full, meta) {
                                return instrumenttypemap[data.instrumenttype]
                            }
                        },
                        {
                            "data": "lotsize",
                            save: true,
                            name: "lotsize"
                        },
                        {
                            "data": "basebuyshift",
                            save: true,
                            name: "basebuyshift"
                        },
                        {
                            "data": "basesellshift",
                            save: true,
                            name: "basesellshift"
                        },
                        {
                            "data": "interestbuy",
                            save: true,
                            name: "interestbuy"
                        },
                        {
                            "data": "interestsell",
                            save: true,
                            name: "interestsell"
                        },
                        {
                            "data": "comment",
                            save: true,
                            name: "comment"
                        },
                        {
                            "data": "exchangeCountryCode",
                            save: true,
                            name: "exchangeCountryCode"
                        },
                        {
                            "data": "sector",
                            save: true,
                            name: "sector"
                        },
                        {
                            "data": "exchangeTicker",
                            save: true,
                            name: "exchangeTicker"
                        },
                        {
                            "data": "minTier",
                            save: true,
                            name: "minTier"
                        },
                        {
                            "data": "wlRank",
                            save: true,
                            name: "wlRank"
                        },
                        {
                            "data": "threeDaySwap",
                            save: true,
                            name: "threeDaySwap"
                        },
                        {
                            "data": null,
                            "sortable": false,
                            save: false,
                            "class": "actions",
                            "render": function (data, type, full, meta) {
                                var access = $rootScope.access.instruments
                                if (access.Edit()) {
                                    var disableTitle = data.tradingDisabled ? "Enable trading" : "Disable trading"
                                    return $.fn.actionList(
                                        {
                                            id: data.instrumentid,
                                            items: [
                                                {
                                                    title: "Edit",
                                                    action: "Edit",
                                                    access: access.Edit,
                                                    class: 'edit-link text-bold'
                                                },
                                                {
                                                    title: disableTitle,
                                                    action: disableTitle,
                                                    access: access.Edit
                                                },
                                                {
                                                    title: "Delete",
                                                    action: "deleteInstrument",
                                                    access: access.Edit
                                                }
                                            ]
                                        }).html()
                                }
                                else return ""
                            }
                        }
                    ]
                }
            }


            $scope.deleteInstrument = function (id, showProgress) {
                var instrument = $rootScope.instruments.getById(id)
                $scope.context.progressError = false
                $scope.context.progressMessage = "Deleting " + instrument.symbol
                var url = '/instruments/' + instrument.instrumentid
                if (showProgress) $("#progress").modal()
                return api.do('DELETE', url, null, new tradingChangeCallback(showProgress))
            }

            $scope.afterTableCreated = function () {
                var table = $('#table').DataTable()
                assignFilters('#table')
                var colSel = new $.fn.colSel(table, {
                    visObject: tableProperties.Columns,
                    saveFunc: $rootScope.saveTableProperties
                })
                $(colSel).appendTo('#rigth-group')
                $('#page-wrapper').addClass('page-animation')
                setTableActionsPosHandler('table')
                restoreState(table, $rootScope.instruments.state, true)
                $scope.selected = getSelectedRows($('#table'))

                var buttons = $scope.table.buttons().container().find('.btn')
                $('a.export-placeholder').replaceWith(buttons)

                // getRootSettings();
                //$scope.$apply();
            }

            function getRootSettings() {
                var rootUnit = $rootScope.units.getRoot()
                return $http.get(apiurl + '/settings/' + rootUnit.systemid)
                    .then(function (result) {
                        var settings = result.data.payload
                        settings.forEach(function (s) {
                            var name = s.systemsetting.constname
                            if (name == "ALLOWED_INSTRUMENTS") {
                                $rootScope.instruments.allowedInstrumentsSettingId = s.systemsetting.systemsettingid
                                var list = s.settingvalues.settingsbyvalue
                                list.forEach(function (obj) {
                                    var instrument = $rootScope.instruments.getById(obj.subcondition1)
                                    if (instrument) {
                                        instrument.allowedSetting = obj
                                        if (obj.value == "false") {
                                            instrument.tradingDisabled = true
                                        }
                                    }
                                })
                            }
                        })
                    })
            }

            $scope.clearAllFilters = function () {
                $rootScope.instruments.state.externalFilter.applied = false
                $rootScope.instruments.state.externalFilter.name = undefined
                var table = $('#table').DataTable()
                clearState(table, $rootScope.instruments.state)
                table.draw()
            }

            var cellClick = function () {
                var row = $(this).parent()
                if (!row.hasClass('disabled')) {
                    row.toggleClass('row-selected')
                }

                $scope.selected = getSelectedRows($('#table'))
                $scope.$apply()
            }

            window.actionClick = function (link) {
                var action = $(link).data('action')
                var id = $(link).data('id')
                //this.console.log('action clicked '+action)
                switch (action.toUpperCase()) {
                    case 'EDIT':
                        $scope.editDialog(id)
                        break
                    case "ENABLE TRADING":
                        $scope.enableTrading(id, true)
                        break
                    case "DISABLE TRADING":
                        $scope.disableTrading(id, true)
                        break
                    case "DISABLE TRADING":
                        $scope.disableTrading(id, true)
                        break
                    case "DELETEINSTRUMENT":
                        $scope.deleteInstrument(id, true)
                        //this.console.log("delete "+id);
                        break

                }
            }


            function tradingChangeCallback(hideProgress) {
                return {
                    ok: function (response) {
                        if (response.data.status == "OK") {
                            if (hideProgress) {
                                $("#progress").modal('hide').on('hidden.bs.modal',
                                    function () {
                                        $('#table').hide()
                                        $scope.Refresh()
                                    }
                                )
                            }
                        }
                        else {
                            $scope.context.progressError = true
                            $scope.context.progressErrorMessage = response.data.payload[0]
                        }
                    }
                    ,
                    error: function (response) {
                        $scope.context.progressError = true
                        $scope.context.progressErrorMessage = response.data.payload[0]
                    }
                }
            }

            $scope.enableTrading = function (id, showProgress) {
                var instrument = $rootScope.instruments.getById(id)
                $scope.context.progressError = false
                $scope.context.progressMessage = "Enabling " + instrument.symbol
                if (instrument.tradingDisabled) {
                    var rootUnit = $rootScope.units.getRoot()
                    var url = '/hierarchy/' + rootUnit.systemid + '/settings/' +
                        $rootScope.instruments.allowedInstrumentsSettingId +
                        '/conditions/' + instrument.instrumentid
                    if (showProgress) $("#progress").modal()
                    return api.do('DELETE', url, null, new tradingChangeCallback(showProgress))
                }
                else {
                    var result = $q.defer()
                    result.resolve()
                    return result.promise
                }
            }

            $scope.disableTrading = function (id, showProgress) {
                var instrument = $rootScope.instruments.getById(id)
                $scope.context.progressError = false
                $scope.context.progressMessage = "Disabling " + instrument.symbol
                if (!instrument.tradingDisabled) {
                    var rootUnit = $rootScope.units.getRoot()
                    var url = '/hierarchy/' + rootUnit.systemid + '/settings/' +
                        $rootScope.instruments.allowedInstrumentsSettingId +
                        '/conditions/' + instrument.instrumentid
                    var data = {
                        systemsettingid: $rootScope.instruments.allowedInstrumentsSettingId,
                        value: false,
                        maptype: 0,
                        valuetype: 80
                    }
                    if (showProgress) $("#progress").modal()
                    return api.do('POST', url, JSON.stringify(data), new tradingChangeCallback(showProgress))
                }
                else {
                    var result = $q.defer()
                    result.resolve()
                    return result.promise
                }
            }

            function bulkSubmit(func) {
                var items = $scope.selected.reverse()
                $("#progress").modal()
                var submit = function () {
                    var id = items.pop()
                    if (id) {
                        func(id, false)
                            .finally(function () {
                                if (!$scope.context.progressError) {
                                    $('#' + id).removeClass('row-selected')
                                    submit()
                                }
                            }
                            )
                    }
                    else {
                        if (!$scope.context.progressError)
                            $("#progress").modal('hide').on('hidden.bs.modal',
                                function () {
                                    $scope.selected = []
                                    $scope.Refresh()
                                }
                            )
                    }
                }
                submit()
            }

            $scope.disableTradingBulk = function () {
                bulkSubmit($scope.disableTrading)
            }

            $scope.enableTradingBulk = function () {
                bulkSubmit($scope.enableTrading)
            }

            window.editClick = function (link) {
                var id = $(link).data('id')
                $scope.editDialog(id)
            }

            $scope.createDialog = function () {
                $scope.instrument = $rootScope.instruments.getEmpty()
                beforeDialog($scope)
                setFocusOnModalWindow('createInstrument', 'instrument-create')
                $('#createInstrument').modal()
            }

            $scope.editDialog = function (id) {
                $scope.instrument = $.extend({}, $rootScope.instruments.getById(id))
                beforeDialog($scope)
                setFocusOnModalWindow('editInstrument', 'instrument-edit')
                $scope.$apply()
                $('#editInstrument').modal()
            }

            updateInstrument = function (instr) {
                var instrument = $rootScope.instruments.getById(instr.instrumentid)
                $.extend(instrument, instr)
                var tr = $('#table').DataTable().row('#' + instr.instrumentid)
                tr.data(instrument).draw()

            }

            var submitInstrument = function (instrument) {
                var json = JSON.stringify(instrument)
                var q = $q.defer()
                $http.put(apiurl + '/instruments/' + instrument.instrumentid, json)
                    .then(
                        function (response) {
                            if (response.data.status == 'OK') {
                                updateInstrument(instrument)
                                SubscriptionService.refresh(true)
                                var json2 = '{"comment":' + '"' + instrument.comment + '"}'
                                $http.put(adminbackendurl + '/instruments/' + instrument.instrumentid + '/comment', json2)
                                    .then(
                                        function (response) {
                                            if (response.data.status == 'OK') {
                                                updateInstrument(instrument)
                                                SubscriptionService.refresh(true)
                                                q.resolve()
                                            }
                                            else {
                                                //highlightError($('#' + instrument.instrumentid + ' td'));
                                                q.reject(response.data.payload[0])
                                            }
                                        },
                                        function (response) {
                                            //highlightError($('#' + instrument.instrumentid + ' td'));
                                            q.reject('Request failed')
                                        }
                                    )
                            }
                            else {
                                //highlightError($('#' + instrument.instrumentid + ' td'));
                                q.reject(response.data.payload[0])
                            }
                        },
                        function (response) {
                            //highlightError($('#' + instrument.instrumentid + ' td'));
                            q.reject('Request failed')
                        }
                    )
                return q.promise
            }

            $scope.createInstrument = function () {
                $scope.context.inprogress = true
                api.createInstrument($scope.instrument, angular.extend(errorHandler($scope),
                    {
                        ok: function (response) {
                            $scope.context.inprogress = false
                            $("#createInstrument").modal('hide').on('hidden.bs.modal',
                                function () {
                                    $rootScope.instruments.upToDate = false
                                    $rootScope.updateInstruments()
                                        .then(function () {
                                            $route.reload()
                                            SubscriptionService.refresh(true)
                                        }
                                        )
                                }
                            )

                        }
                    }
                ))
            }

            $scope.submitInstrument = function () {
                $scope.context.inprogress = true
                submitInstrument($scope.instrument)
                    .then(
                        function () {
                            //$scope.clearAllFilters();
                            //$rootScope.instruments.state.externalFilter.applied = false;
                            //$rootScope.instruments.state.externalFilter.name = undefined;

                            $scope.context.inprogress = false
                            $('#editInstrument').modal('hide').on('hidden.bs.modal', function () {
                                $rootScope.instruments.upToDate = false
                                $rootScope.updateInstruments()
                                    .then(function () {
                                        $route.reload()
                                        SubscriptionService.refresh(true)
                                    }
                                    )
                            })
                        },
                        function (msg) {
                            $scope.context.inprogress = false
                            $scope.context.errorMessage = msg
                            $scope.context.error = true
                            //ProcessSpiner.error(msg);
                        })
            }

            var bulkSubmitCallback = {
                getItem: function (sel) {
                    return $.extend({}, sel.instrument)
                },
                submit: function (item) {
                    $scope.currentItem = item.symbol
                    return submitInstrument(item)
                },
                start: function () {
                    $scope.context.inprogress = true
                },
                finish: function () {
                    $scope.context.inprogress = false
                    $('#bulkEdit').modal('hide')
                }
            }

            $scope.maxPipsBulkDialog = function () {
                beforeDialog($scope)
                $scope.bulkContext = $rootScope.instruments
                    .createBulkContext($scope.selected, "Change max pips update", "maxpipsupdate")
                $scope.bulkContext.submit = function () {
                    $scope.bulkContext.submitItems(
                        $.extend({ field: "maxpipsupdate" }, bulkSubmitCallback)
                    )
                }
                $('#bulkEdit').modal()
            }

            $scope.spreadBulkDialog = function () {
                beforeDialog($scope)
                $scope.bulkContext = $rootScope.instruments
                    .createBulkContext($scope.selected, "Change spread", "spread")
                $scope.bulkContext.submit = function () {
                    $scope.bulkContext.submitItems(
                        $.extend({ field: "spread" }, bulkSubmitCallback)
                    )
                }
                $('#bulkEdit').modal()
            }

            $scope.tradingPeriodBulkDialog = function () {
                beforeDialog($scope)
                $scope.bulkContext = $rootScope.instruments
                    .createBulkContext($scope.selected, "Change trading period", "tradingperiod")
                $scope.bulkContext.submit = function () {
                    $scope.bulkContext.submitItems(
                        $.extend({ field: "tradingperiod" }, bulkSubmitCallback)
                    )
                }
                $('#bulkEdit').modal()
            }

            $scope.marginBulkDialog = function () {
                beforeDialog($scope)
                $scope.bulkContext = $rootScope.instruments
                    .createBulkContext($scope.selected, "Change margin requirement", "marginrequirement")
                $scope.bulkContext.submit = function () {
                    $scope.bulkContext.submitItems(
                        $.extend({ field: "marginrequirement" }, bulkSubmitCallback)
                    )
                }
                $('#bulkEdit').modal()
            }

            $scope.pipBulkDialog = function () {
                beforeDialog($scope)
                $scope.bulkContext = $rootScope.instruments
                    .createBulkContext($scope.selected, "Change pip position", "pipposition")
                $scope.bulkContext.submit = function () {
                    $scope.bulkContext.submitItems(
                        $.extend({ field: "pipposition" }, bulkSubmitCallback)
                    )
                }
                $('#bulkEdit').modal()
            }

            $scope.roundBulkDialog = function () {
                beforeDialog($scope)
                $scope.bulkContext = $rootScope.instruments
                    .createBulkContext($scope.selected, "Change round", "round")
                $scope.bulkContext.submit = function () {
                    $scope.bulkContext.submitItems(
                        $.extend({ field: "round" }, bulkSubmitCallback)
                    )
                }
                $('#bulkEdit').modal()
            }

            $scope.typeBulkDialog = function () {
                beforeDialog($scope)
                $scope.bulkContext = $rootScope.instruments
                    .createBulkContext($scope.selected, "Change type", "instrumenttype")
                $scope.bulkContext.showTypes = true
                $scope.bulkContext.submit = function () {
                    $scope.bulkContext.submitItems(
                        $.extend({ field: "instrumenttype" }, bulkSubmitCallback)
                    )
                }
                $('#bulkEdit').modal()
            }

            $scope.lotBulkDialog = function () {
                beforeDialog($scope)
                $scope.bulkContext = $rootScope.instruments
                    .createBulkContext($scope.selected, "Change lot size", "lotsize")
                $scope.bulkContext.submit = function () {
                    $scope.bulkContext.submitItems(
                        $.extend({ field: "lotsize" }, bulkSubmitCallback)
                    )
                }
                $('#bulkEdit').modal()
            }

            $scope.selectAll = function () {
                tableSelectAll($('#table'), $scope)
                $('#select-all').blur()
            }

            $scope.unselectAll = function () {
                tableUnselectAll($('#table'), $scope)
                $('#unselect-all').blur()
            }

            $scope.invertSelection = function () {
                tableInvertSelection($('#table'), $scope)
                $('#invert-select').blur()
            }

            $scope.showHistory = function () {
                $scope.context.showHistory = true
                $timeout(function () {
                    $("#settingsHistory").modal().on('hidden.bs.modal',
                        function () {
                            $scope.context.showHistory = false
                            $scope.$apply()
                        }
                    )
                }, 0)
            }

            $scope.Refresh = function () {
                $rootScope.instruments.upToDate = false
                $rootScope.updateInstruments()
                    .then(function () {
                        $route.reload()
                    }
                    )
            }

            $scope.showSubmitInterestsDialog = function () {
                $scope.processing = false
                $scope.errorMessage = null

                $scope.dailyRatesCSVFile = null
                $scope.dailyRatesXLSFile = null
                $scope.configFile = null

                $("#csvfile").val("")
                $("#xlsfile").val("")
                $("#configfile").val("")

                $('#submitInterestsDialog').modal()
            }

            $scope.showBulkInstrumentsDialog = function () {
                $scope.processing = false
                $scope.errorMessage = null

                $scope.instrumentsCSVFile = null
                $scope.configFile = null

                $("#csvfile").val("")
                $("#xlsfile").val("")
                $("#configfile").val("")

                $('#submitInstrumentsDialog').modal()
            }

            $scope.showBulkTradingTimesDialog = function () {
                $scope.processing = false
                $scope.errorMessage = null

                $scope.tradingPeriodsCSVFile = null
                $scope.configFile = null

                $("#csvfile").val("")
                $("#xlsfile").val("")
                $("#configfile").val("")

                $('#updateTradingPeriodsDialog').modal()
            }

            $scope.processSubmitInterestsDialog = function () {
                doSubmitInterests($scope, $http)
            }

            $scope.processSubmitInstrumentsDialog = function () {
                doInsertInstruments($scope, $http)
            }

            $scope.processSubmitTradingPeriodsDialog = function () {
                doUpdateTradePeriods($scope, $http)
            }

            $rootScope.updateInstruments()
                .then(function () {
                    if ($rootScope.access.instruments.Edit()) {
                        getRootSettings()
                            .then(function () {
                                $scope.createTable()
                                $scope.$broadcast('dataloaded')
                                $scope.context.dataloaded = true
                                $timeout(function () {
                                    var table = $('#table').DataTable()
                                    table.columns.adjust().draw()
                                }, 0)
                            })
                    }
                    else {
                        $scope.createTable()
                        $scope.$broadcast('dataloaded')
                        $scope.context.dataloaded = true
                    }
                })

            $scope.$on("$destroy", function () {
                saveState('#table', $rootScope.instruments.state)
            })

        }
    ])

instrumentsControllers.controller('InstrumentsHistoryCtrl',
    ['$q', '$rootScope', '$scope', '$http', '$route', 'api', '$timeout', '$location',
        function ($q, $rootScope, $scope, $http, $route, api, $timeout, $location) {

            /*
             console.log("create InstrumentsHistoryCtrl");

             $scope.$on("$destroy", function () {
             console.log("destroy InstrumentsHistoryCtrl");
             });
             */

            $scope.context = {
                dataerror: false
                //                        dataloaded: false
            }

            createTable = function () {
                var tableOptions = {
                    "data": $scope.data,
                    "dom": "t",
                    "scrollY": 300,//calcDataTableHeight(),
                    "paging": false,
                    "order": [[1, 'asc']],
                    createdRow: function (row, data, dataIndex) {
                        //                                var r = $(row);
                        //                                r.attr("id", data.id);
                    },
                    "columns": [
                        {
                            "data": "instrumentid"
                        },
                        {
                            "data": "symbol",
                            "class": "font-bold"
                        },
                        {
                            "data": "updatedate"
                        },
                        {
                            "data": "updatetype"
                        },
                        {
                            "data": "caller"
                        },
                        {
                            "data": "callerip"
                        }
                    ]
                }
                $('#history-table').DataTable(tableOptions)
                afterTableCreated()
            }

            afterTableCreated = function () {
                var table = $('#history-table').DataTable()
                table.columns().every(function () {
                    var that = this
                    $('input', this.footer()).on('keyup change', function () {
                        if (that.search() !== this.value) {
                            that.search(this.value).draw()
                        }
                    })
                })
            }

            $http.get(apiurl + "/instruments//settinghistory")
                .then(function (result) {
                    if (result.data.status == "OK") {
                        $scope.data = result.data.payload[0]
                        createTable()
                        $scope.context.dataloaded = true

                        $timeout(function () {
                            var table = $('#history-table').DataTable()
                            table.columns.adjust().draw()
                        }, 0)
                    }
                    else {
                        $scope.context.dataloaded = true
                        $scope.context.dataerror = true
                        $scope.context.errorMessage = result.data.payload[0]
                    }
                })

        }
    ])

