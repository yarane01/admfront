var calcDataTableHeight = function () {
    //return $(window).height()*3/4;
    return 400;
};

var trancateString = function (s) {
    var result = s;
    if (typeof s == 'string') {
        if (s.length > 20)
            result = s.substr(0, 19) + '...';
    }
    return result;
};


var tableCheckedIcon = function () {
    return '<i class="fa fa-check-square-o"></i>';
};

var tableUncheckedIcon = function () {
    return '<i class="fa fa-square-o"></i>';
};


var highlightRowOK = function (id) {
    $('#' + id + ' td').effect("highlight", {color: "#79EBA8"}, 1500);
};

/*
 operates with items like
 {
 name,
 id,
 selected,
 enabled,
 value
 }
 */

var BulkContext = function () {
    return {
        value: "",
        title: "Bulk change",
        items: [],
        getDisplayText: function (index) {
            return '<del style="color: red">' + this.items[index].value + '</del>';
        },
        getNewValueText: function (index) {
            return '<strong style="color: green">' + this.value + '</strong>';
        },
        createItem: function (data) {
            this.items.push($.extend(
                {
                    name: "",
                    id: 0,
                    value: 0
                },
                data
            ));
        },
        submitItems: function (submitContext) {
            //ProcessSpiner.showSpiner();
            submitContext.start();
            var self = this;
            var submit = function () {
                var sel = self.items.pop();
                if (sel) {
                    var item = submitContext.getItem(sel);
                    item[submitContext.field] = self.value;
                    submitContext.submit(item)
                        .finally(function () {
                                submit();
                            }
                        )
                }
                else //ProcessSpiner.hide();
                    submitContext.finish();
            };
            submit();
        }
    }
};

var EditContext = function () {
    return {
        oldValue: 0,
        newValue: 0,
        id: 0,
        title: ""
    }
};

var BulkFilterContext = function () {
    return {
        value: "",
        filter: "",
        title: "Bulk change",
        items: [],
        filtered: [],
        selectAll: function () {
            this.filtered.forEach(function (i) {
                if (i.enabled)
                    i.selected = true;
            });
            $('#bulk-select-all').blur();
        },
        deselectAll: function () {
            this.filtered.forEach(function (i) {
                i.selected = false;
            });
            $('#bulk-deselect-all').blur();
        },
        invertSelection: function () {
            this.filtered.forEach(function (i) {
                if (i.enabled)
                    i.selected = !i.selected;
            });
            $('#bulk-invert').blur();
        },
        itemChecked: function (index) {
            var item = this.filtered[index];
        },
        valueChanged: function () {

        },
        getDisplayText: function (index) {
            var result = this.filtered[index].value;
            if (this.filtered[index].selected) result = '<del style="color: red">' + result + '</del>';
            else result = '<b>' + result + '</b>';
            return result;
        },
        getNewValueText: function (index) {
            if (this.filtered[index].selected)
                return '<strong style="color: green">' + this.value + '</strong>';
            else return "";
        },
        getSelected: function () {
            var selected = this.items.filter(function (item) {
                return item.selected;
            });
            return selected;
        },
        createItem: function (data) {
            this.items.push($.extend(
                {
                    name: "",
                    id: 0,
                    selected: false,
                    enabled: true,
                    value: 0
                },
                data
            ));
        },
        submitSelected: function (submitContext) {
            /*
             var selected = this.getSelected();
             if (selected.length == 0) return;
             ProcessSpiner.showSpiner();
             var self = this;
             var submit = function () {
             var sel = selected.pop();
             if (sel) {
             var item = submitContext.getItem(sel);
             item[submitContext.field] = self.value;
             submitContext.submit(item)
             .finally(function () {
             submit();
             }
             )
             }
             else ProcessSpiner.hide();
             }
             submit();
             */
        }
    }
};

var tableSelectAll = function (table, $scope) {
    var rows = $('tr', table);
    $scope.selected = [];
    rows.each(function () {
            var id = $(this).attr('id');
            if (id) {
                if ($(this).hasClass('disabled')) return;
                $scope.selected.push(id);
                $(this).addClass('row-selected');
                //$('td:eq(0)', this).html(tableCheckedIcon());
            }
        }
    )
};

var tableUnselectAll = function (table, $scope) {
    var rows = $('tr', table);
    $scope.selected = [];
    rows.each(function () {
            var id = $(this).attr('id');
            if (id) {
                if ($(this).hasClass('disabled')) return;
                $(this).removeClass('row-selected');
                //$('td:eq(0)', this).html(tableUncheckedIcon());
            }
        }
    )
};

var tableInvertSelection = function (table, $scope) {
    var rows = $('tr', table);
    $scope.selected = [];
    rows.each(function () {
            var id = $(this).attr('id');
            if (id) {
                if ($(this).hasClass('disabled')) return;
                if ($(this).hasClass('row-selected')) {
                    $(this).removeClass('row-selected');
                    //$('td:eq(0)', this).html(tableUncheckedIcon());
                }
                else {
                    $scope.selected.push(id);
                    $(this).addClass('row-selected');
                    //$('td:eq(0)', this).html(tableCheckedIcon());
                }
            }
        }
    )
};


var addRow = function (response, data, after) {
    var item = response.data.payload[0];
    data.push(item);
    after();
    item = data[data.length - 1];
    $('#table').DataTable().row.add(item).draw();
    $('#' + item.systemid)[0].scrollIntoView();
    //highlightRowOK(item.systemid);
};


function openInNewTab(url) {
    //$("<a>").attr("href", encodeURI(url)).attr("target", "_blank")[0].click();
    window.open(encodeURI(url), '_blank');
}

(function ($) {
    $.fn.actionList = function (options) {
        options = $.extend({
            title: "Actions",
            actions: [],
            access: [],
            itemCheck: []
        }, options);

        var menu = $('<div>', {
            //class: "dropdown navbar-right"
            class: "dropdown dropdown-hover actions"
            //style: "display: inline"
        });

        var button = $('<button>', {
            class: "btn btn-default btn-actions dropdown-toggle table-actions",
            type: "button",
            'data-toggle': "dropdown",
            // text: options.title + " "
        });
        var span = $('<span>', {class: 'caret'});
        span.appendTo(button);
        button.appendTo(menu);

        var ul = $('<ul>', {
            class: 'dropdown-menu'
        }).appendTo(menu);
        if (options.style) ul.css(options.style);

        function createMenu(items, ul) {
            items.forEach(function (item) {
                if (item.type == "divider") {
                    var li = $('<li>');
                    li.addClass('divider');
                    li.appendTo(ul);
                }
                else if (item.type == "submenu") {
                    if (item.itemCheck && (!item.itemCheck())) return;
                    var li = $('<li>', {class: "dropdown-submenu"});

                    if (item.class) li.addClass(item.class);
                    var a = $('<a>', {
                        href: "Javascript:;",
                        text: item.title,
                        class: 'link'
                    }).appendTo(li);
                    li.appendTo(ul);
                    var subul = $('<ul>', {
                        class: 'dropdown-menu'
                    }).appendTo(li);
                    createMenu(item.items, subul);
                    if (item.style) subul.css(item.style);
                }
                else {
                    var li = $('<li>');
                    var a = $('<a>', {
                        href: "Javascript:;",
                        text: item.title,
                        class: item.class ? item.class : 'link'
                    });
                    // var enabled = item.access ? item.access() : true;
                    var enabled = true;
                    if (item.access) {
                        if (typeof item.access === 'function')
                            enabled = item.access();
                        else if (typeof item.access === 'boolean')
                            enabled = item.access;
                        else if (typeof item.access === 'string')
                            enabled = item.access == "true";
                    }
                    if (item.itemCheck)
                        enabled = enabled && item.itemCheck(options.id);
                    if (enabled) {
                        a.attr('data-action', item.action);
                        a.attr('data-id', options.id);
                        if (options.handler)
                            a.attr('onclick', options.handler);
                        else a.attr('onclick', 'actionClick(this)');
                        a.appendTo(li);
                        li.appendTo(ul);

                    }
                }
            })
        }

        createMenu(options.items, ul)
        var div = $('<div>');
        menu.appendTo(div);
        //return menu;
        return div;

    };
})(jQuery);


$.fn.exists = function () {
    return this.length !== 0;
};


function selectRow(tableselector, id) {
    $(tableselector + ' tr').each(function () {
            $(this).removeClass('row-selected');
        }
    );
    $('#' + id).addClass('row-selected');
}

function singleSelectionRowClick() {
    if (!$(this).hasClass('disabled')) {
        $('#table tr').each(function () {
                $(this).removeClass('row-selected');
            }
        );
        $(this).addClass('row-selected');
    }
}

function singleSelectionRow(row) {
    if (!$(row).hasClass('disabled')) {
        $('#table tr').each(function () {
                $(this).removeClass('row-selected');
            }
        );
        $(row).addClass('row-selected');
    }
}

function multiSelectionRowClick() {
    if (!$(this).hasClass('disabled')) {
        $(this).toggleClass('row-selected');
    }
}

function getSelectedRows(table) {
    var selected = [];
    $('.row-selected', table).each(function () {
            selected.push($(this).attr('id'));
        }
    )
    return selected;
}

function setTableActionsPosHandler(tableid) {
    $('#' + tableid + ' .table-actions').on("click", function () {
            var dropdown = $('>.dropdown-menu', $(this).parent());
            var listH = dropdown.height() + 20;
            var listW = dropdown.width();

            if ($('#' + tableid + '_wrapper .dataTables_scrollBody').exists()) {
                var wrapper = $('#' + tableid + '_wrapper .dataTables_scrollBody');
                var containerH = wrapper[0].scrollWidth > wrapper[0].clientWidth ? wrapper.height() - 20 : wrapper.height();
                var top = $(this).offset().top - wrapper.offset().top;

                var bottom = top + listH;
                top = bottom > containerH ? containerH - bottom : 0;
                dropdown.css('top', top - 4);
            }
            else {
                dropdown.css('top', -4);
            }
            dropdown.css('left', -listW);
        }
    )
}

function setFocusOnModalWindow(dialogId, controlId) {
    $('#' + dialogId).on('shown.bs.modal', function () {
        $('#' + controlId).focus()
    });
}

function assignFilters(tableselector) {
    var table = $(tableselector).DataTable();
    table.columns().every(function () {
        var that = this;
        var inputs = $('input', this.footer());
        if(this.footer() != null) {
            inputs.on('keyup change', function () {
                if (that.search() !== this.value) {
                    that.search(this.value).draw();
                }
            });
            if (inputs.length > 0)
                if (inputs[0].value != "")
                    this.search(inputs[0].value).draw();
        }
    });
}

function saveState(tableselector, stateObj) {
    var table = $(tableselector).DataTable();
    stateObj.selected = getSelectedRows(tableselector);

    table.columns().every(function () {
        var that = this;
        $('input', this.footer()).each(function () {
            var name = $(this).data('name');
            if (name) stateObj[name] = this.value;
        });
    });
}

function clearState(table, stateObj) {
    table.columns().every(function () {
        var that = this;
        $('input', this.footer()).each(function () {
            if (this.value != '') {
                this.value = '';
                that.search('');
            }
        });
    });
}

function setFilterValue(table, stateObj, index, value, regExpr) {
    var i = 0;
    table.columns().every(function () {
        var that = this;
        $('input', this.footer()).each(function () {
            if (i == index) {
                this.value = value;
                if (regExpr)
                    that.search("^" + value + "$", true, false);
                else
                    that.search(value);
            }
            i++;
        });
    });
}

function restoreState(table, stateObj, select, scroll) {
    if (select) {
        stateObj.selected.forEach(function (id) {
            $('#' + id).addClass('row-selected');
            if (scroll) table.row('#' + id).scrollTo();
        })
    }
    table.columns().every(function () {
        var that = this;
        $('input', this.footer()).each(function () {
            var name = $(this).data('name');
            if (name) {
                var value = stateObj[name];
                if (value && value != '') {
                    this.value = value;
                    //that.search(this.value).draw();
                }
            }
        });
    });

}

function createTableState() {
    return {
        data: undefined,
        selected: [],
        externalFilter: {
            name: undefined,
            applied: false
        }
    }


}

var tableProperties;

function getDefaultTableProperties() {
    return {
        riskmanagement_exposure: {
            sort: [0, 'asc'],
            filter: '',
            columnVisibility: {
                Rate: true,
                Abook: true,
                Bbook: true,
                AplusB: true
            }
        },
        riskmanagement_blotter: {
            sort: [0, 'desc'],
            filter: '',
            columnVisibility: {
                Time: true,
                Amount: true,
                AvgRate: true,
                Trader: true,
                Exposure: true
            }
        },
        riskmanagement_abookusd: {
            sort: [0, 'asc'],
            filter: ''
        },
        riskmanagement_bbookusd: {
            sort: [0, 'asc'],
            filter: ''
        },
        riskmanagement_abookplusbbookusd: {
            sort: [0, 'asc'],
            filter: ''
        },
        riskmanagement_pl: {
            sort: [0, 'asc'],
            filter: '',
            columnVisibility: {
                Bbook: true,
                Abook: true,
                PL: true,
                BbookMonth: true,
                AbookMonth: true,
                PLMonth: true
            }
        },
        riskmanagement_rates: {
            sort: [0, 'asc'],
            filter: '',
            columnVisibility: {
                Instrument: true,
                Time: true,
                Bid: true,
                Ask: true,
                Provider: true
            }
        },

        Columns: {

            units: {
                currency: true,
                stp: true,
                timezone: true,
                marketstatus: false,
                closed: false
            },
            groups: {
                description: true,
                type: true
            },
            users: {
                parent: true,
                firstname: true,
                lastname: true,
                tradingstate: true,
                onlinestatus: true,
                country: true,
                city: true,
                state: true,
                zip: true,
                closed: false,
                locked: false,
                lastlogged: false
            },
            accounts: {
                basecurrency: true,
                balance: true,
                type: true,
                usedmargin: true,
                usablemargin: true,
                opendate: false,
                accountclosed: false
            },
            tradeSubscriptions: {
                tier: true,
                monthlyOpenOrders: true
            },
            instruments: {
                maxpipsupdate: true,
                spread: true,
                tradingperiod: true,
                traderrange: true,
                dealerrange: true,
                marginrequirement: true,
                pipposition: true,
                round: true,
                lotsize: true,
                basebuyshift: false,
                basesellshift: false,
                interestbuy: true,
                interestsell: true,
                exchangeCountryCode: true,
                sector: true,
                exchangeTicker: true
            },
            trades: {
                accountn: true,
                owner: true,
                trader: true,
                symbol: true,
                profitloss: true,
                openrate: true,
                closerate: true,
                openamount: true,
                closeamount: true,
                opendate: true,
                closedate: true,
                openorderid: true,
                openclientorderid: true,
                openbankorderid: true,
                closeorderid: true,
                closeclientorderid: true,
                closebankorderid: true,
                openbank: true,
                closebank: true,
                openbanktradeid: true,
                closebanktradeid: true
            },
            orders: {
                orderid: true,
                accountn: true,
                trader: true,
                symbol: true,
                amount: true,
                type: true,
                mode: true,
                openrate: true,
                opendate: true,
                clientorderid: true,
                bankorderid: true
            },
            livefeed: {
                spread: true,
                quotespersec: true,
                maxbid: true,
                minbid: true,
                maxask: true,
                minask: true,
                trading: true,
                time: true
            },
            stporders: {
                accountId: true,
                vtsOrderId: true,
                price: true,
                bank: true,
                amount: true,
                side: true,
                orderId: true,
                bankTradeId: true,
                counterparty: true,
                orderStatus: true,
                instrument: true,
                filledAmount: true,
                executionPrice: true,
                quoteId: true,
                filledPartially: true,
                transactionReportOrigination: true,
                totallyFilledAmount: true,
                type: true,
                broadcast: true,
                updateTime: true,
                creationTime: true
            }
        }
    }
}

function getStartDefaultDate() {
    return moment(0, 'HH').subtract(7, 'd').format('YYYY-MM-DD HH:mm:ss');
}

function getEndDefaultDate() {
    return moment(24, 'HH').format('YYYY-MM-DD HH:mm:ss')
}

function createDateFilterObject() {
    return {
        useFromFilter: true,
        useToFilter: true,
        fromdate: getStartDefaultDate(),
        todate: getEndDefaultDate(),
        stringFor: function (name) {
            if (this.useFromFilter && this.useToFilter) {
                return name + " between '" + this.fromdate + "' and '" + this.todate + "'";
            }
            else if (this.useFromFilter) {
                return name + " > '" + this.fromdate + "'";
            }
            else if (this.useToFilter) {
                return name + " < '" + this.todate + "'";
            }
            else return '';
        },
        to_dateStringFor: function (name) {
            if (this.useFromFilter && this.useToFilter) {
                return name + " between to_date('" + this.fromdate + "', 'yyyy-mm-dd HH24:MI:SS') and " +
                    "to_date('" + this.todate + "', 'yyyy-mm-dd HH24:MI:SS')";
            }
            else if (this.useFromFilter) {
                return name + " > to_date('" + this.fromdate + "', 'yyyy-mm-dd HH24:MI:SS')";
            }
            else if (this.useToFilter) {
                return name + " < to_date('" + this.todate + "', 'yyyy-mm-dd HH24:MI:SS')";

            }
            else return '';
        },
        queryFor: function (from, to) {
            if (this.useFromFilter && this.useToFilter) {
                return '?' + from + '=' + this.fromdate + '&' + to + '=' + this.todate;
            }
            else if (this.useFromFilter) {
                return '?' + from + '=' + this.fromdate;
            }
            else if (this.useToFilter) {
                return '?' + to + '=' + this.todate;
            }
            else return '';
        }

    }
}

function saveData(filename, data) {
    var blob = new Blob([data], {type: 'text/csv'});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

function isCorrectFilter(filter) {
    var res = (/like '.*'/i.test(filter)) || (/[><=][+-]?\d+/.test(filter));
    // console.log(filter, res);
    return res;
}