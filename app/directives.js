var FLOAT_REGEXP = /^[+-]?\d+(\.\d+)?$/;
var INTEGER_REGEXP = /^\-?\d+$/;
var PASSWORD = /^[a-zA-Z_\d]+$/;

angular.module('portal')
    .directive('dTable', [
        function () {
            return {
                link: function ($scope, element, attrs) {
                    $scope.context.dataloaded = false;

                    if ($scope.tableOptions) {
                        $scope.table = element.dataTable($scope.tableOptions).DataTable();
                        $scope.context.dataloaded = true;
                        $scope.afterTableCreated();
                    }
                    else {
                        $scope.$on('dataloaded', function () {
                            $scope.table = element.dataTable($scope.tableOptions).DataTable();
                            $scope.context.dataloaded = true;
                            $scope.afterTableCreated();
                        })
                    }
                }
            };
        }])

    .directive('filterBox', [
        function () {
            return {
                restrict: "E",
                template: '<div class="pull-right" role="search" style="width: 15em; margin-left: 10px">' +
                '<div class="input-group">' +
                '<input type="text" ' +
                'id="search-box" ' +
                'class="form-control" ' +
                'placeholder="Filter...">' +
                '<div class="input-group-btn">' +
                '<button id="clear-search" class="btn btn-default">' +
                '<i class="fa fa-close"></i>' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>'
            }
        }])

    .directive('tableActionSingle', [
        function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                template: function (element, attrs) {
                    return '<a href="Javascript:;" ' +
                        //'class="btn btn-warning single-action" ' +
                        'class="single-action" ' +
                        'ng-disabled="selected.length!=1" ng-transclude></a>'
                }
            }
        }])

    .directive('tableLinkSingle', [
        function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                template: function (element, attrs) {
                    return '<a ' +
                        'class="btn btn-primary" ' +
                        'ng-disabled="selected.length!=1" ng-transclude></a>'
                }
            }
        }])


    .directive('tableSearch', [
        function () {
            return {
                restrict: "E",
                replace: true,
                transclude: false,
                template: function (element, attrs) {
                    return '<form class="form-inline">' +
                        '<div class="form-group">' +
                        '<input type="text" class="form-control input-sm" ' +
                        'data-name="' + attrs.name + '" ' +
                        'size="' + attrs.size + '" placeholder="' + attrs.placeholder + '">' +
                        '</div >' +
                        '</div >';
                }
            }
        }])

    .directive('tableSearchHighlighted', [
        function () {
            return {
                restrict: "E",
                replace: false,
                transclude: true,
                template: function (element, attrs) {
                    return '<form class="form-inline">' +
                        '<div class="form-group">' +
                        '<input type="text" class="form-control input-sm input-highlighted" ' +
                        'data-name="' + attrs.name + '" ' +
                        'size="' + attrs.size + '" placeholder="' + attrs.placeholder + '">' +
                        '</div >' + '<ng-transclude></ng-transclude>' +
                        '</div >';
                }
            }
        }])


    .directive('tableAction', [
        function () {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                template: function (element, attrs) {
                    return '<a href="Javascript:;" ' +
                        'class="btn btn-default" ng-transclude></a>'
                }
            }
        }])

    .directive('markErrors', function () {
        return {
            restrict: 'A',
            require: '^form',
            link: function (scope, el, attrs, formCtrl) {
                var inputEl = el[0].querySelector("[name]");
                var inputNgEl = angular.element(inputEl);
                var inputName = inputNgEl.attr('name');
                scope.$watch(
                    function () {
                        return formCtrl[inputName].$invalid
                    },
                    function (newVal, oldVal) {
                        el.toggleClass('has-error', newVal);
                    })
            }
        }
    })

    .directive('float', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$validators.float = function (modelValue, viewValue) {
                    if (ctrl.$isEmpty(viewValue)) {
                        if (attrs.optional == "true") return true;
                        else return false;
                    }
                    else {
                        return !isNaN(viewValue);
                    }
                    /*
                     if (FLOAT_REGEXP.test(viewValue)) {
                     return true;
                     }
                     return false;
                     */
                };
            }
        };
    })

    .directive('integer', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$validators.integer = function (modelValue, viewValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        if (attrs.optional == "true") return true;
                        else return false;
                    }
                    else {
                        return INTEGER_REGEXP.test(viewValue)
                    }

                    /*
                     if (INTEGER_REGEXP.test(viewValue)) {
                     return true;
                     }

                     return false;
                     */
                };
            }
        };
    })

    .directive('password', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$validators.password = function (modelValue, viewValue) {
                    if (PASSWORD.test(viewValue)) {
                        return true;
                    }
                    return false;
                };
            }
        };
    })


    .directive('toggle', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (attrs.toggle == "tooltip") {
                    $(element).tooltip();
                }
                if (attrs.toggle == "popover") {
                    $(element).popover();
                }
            }
        };
    })

    .directive('dateTimePicker', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                var options = {
                    locale: 'en',
                    format: 'YYYY-MM-DD HH:mm:ss'
                    //format: 'YYYY-MM-DD'
                }
                if (attrs.sideBySide) options.sideBySide = attrs.sideBySide == 'true';
                if (attrs.format) options.format = attrs.format;
                //if (attrs.useCurrent) options.useCurrent = attrs.useCurrent == 'true';
                elm.datetimepicker(options).on('dp.change', function (e) {
                    ctrl.$setViewValue(e.date.format(options.format));
                    scope.$apply();
                });
            }
        }
    })

    .directive('dashTreeItem', function ($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, elt, attrs) {
                if (!$rootScope.access.hierarchy.Move()) return;
                elt.draggable({
                    cursor: 'move',
                    containment: '#dash-tree-area',
                    scroll: true,
                    scrollSensitivity: 10,
                    scrollSpeed: 100,
                    appendTo: '#dash-tree-area',
                    disabled: !scope.$parentNode,
                    drag: function (event, ui) {
                        var destination = ui.helper.data('destination');
                        if (destination) {
                        }
                    },
                    helper: function (event) {
                        var helper = $('<div class="dash-helper">' + scope.node.name + '</div>');
                        helper.data('node', scope.node);
                        helper.data('parentNode', scope.$parentNode);
                        return helper;
                    }
                });

                elt.droppable({
                    tolerance: 'pointer',
                    over: function (event, ui) {
//                        elt.css('cursor', 'not-allowed');
                        ui.helper.data('destination', elt);
                        elt.addClass('dash-hover');
                    },
                    out: function (event, ui) {
                        ui.helper.data('destination', null);
                        elt.removeClass('dash-hover');
                    },
                    drop: function (event, ui) {
                        var toNode = scope.node;
                        var fromNode = ui.helper.data('node');
                        elt.removeClass('dash-hover');

                        scope.$parent.$apply(function () {
                            scope.$parent.context.toNode = toNode;
                            scope.$parent.context.fromNode = fromNode;
                            scope.$parent.context.confirmMessage = 'Do you want to move "' + fromNode.name + '" to "' + toNode.name + '"?';
                            $('#confirm').modal();
                        });
                    }
                });

                var dereg = scope.$on('$destroy', function () {
                    try {
                        elet.draggable('destroy');
                    } catch (e) {
                    }
                    dereg();
                    dereg = null;
                });

            }
        };
    })


    .directive('noSign', [
        function () {
            return {
                restrict: "E",
                template: '<span><i class="fa fa-ban text-danger"></i></span>'
            }
        }])

    .directive('yesSign', [
        function () {
            return {
                restrict: "E",
                template: '<span><i class="fa fa-check text-success"></i></span>'
            }
        }])

    .directive('modulesNoSign', [
        function () {
            return {
                restrict: "E",
                replace: true,
                template: function (element, attrs) {
                    /*
                     return '<a href="" data-toggle="popover" data-trigger="hover"' +
                     'data-container="body"' +
                     'data-content="' + attrs.name + ' is stopped"' +
                     'ng-if="' + attrs.if + '"' +
                     '<i class="fa fa-ban text-danger dash-yes-no-sign"></i></a>'
                     */
                    return '<a href="Javascript:;" data-toggle="tooltip"' +
                        'title="' + attrs.name + ' is stopped"' +
                        'data-placement="right"' +
                        'data-container="body"' +
                        'ng-if="' + attrs.if + '"' +
                        '<i class="fa fa-ban text-danger dash-yes-no-sign"></i></a>'
                }
            }
        }])

    .directive('modulesYesSign', [
        function () {
            return {
                restrict: "E",
                replace: true,
                template: function (element, attrs) {
                    /*
                     return '<a href="" data-toggle="popover" data-trigger="hover"' +
                     'data-container="body"' +
                     'data-content="' + attrs.name + ' is running"' +
                     'ng-if="' + attrs.if + '"' +
                     '<i class="fa fa-check text-success dash-yes-no-sign"></i></a>'
                     */
                    return '<a href="Javascript:;" data-toggle="tooltip"' +
                        'title="' + attrs.name + ' is running"' +
                        'data-placement="right"' +
                        'data-container="body"' +
                        'ng-if="' + attrs.if + '"' +
                        '<i class="fa fa-check text-success dash-yes-no-sign"></i></a>'
                }
            }
        }])

    .directive('moduleStartBtn', [
        function () {
            return {
                restrict: "A",
                link: function (scope, elt, attrs) {
                    elt.tooltip({title: "Start module", placement: "auto bottom", container: "body"});
                }
            }
        }])

    .directive('moduleStopBtn', [
        function () {
            return {
                restrict: "A",
                link: function (scope, elt, attrs) {
                    elt.tooltip({title: "Stop module", placement: "auto bottom", container: "body"});
                }
            }
        }])


    .directive('providersSign', [
        function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    ok: "=",
                    name: "=",
                    prefix: "@",
                    postfix: "@"
                },
                // template: '<a href="Javascript:;" ng-bind-html="image | unsafe" data-toggle="popover" data-trigger="hover" data-content="{{name}} {{prefix}} {{text}} {{postfix}}"></a>',
                template: '<a href="Javascript:;" ng-bind-html="image | unsafe" </a>',
                link: function (scope, elt, attrs) {
                    var title;
                    if (scope.ok) {
                        scope.image = '<i class="fa fa-check text-success dash-yes-no-sign"></i>';
                        scope.text = 'is'
                        title = scope.name + " " + scope.prefix + " is " + scope.postfix;
                    }
                    else {
                        scope.image = '<i class="fa fa-ban text-danger dash-yes-no-sign"></i>';
                        scope.text = 'is not'
                        title = scope.name + " " + scope.prefix + " is not " + scope.postfix;
                    }
                    elt.attr("title", title);
                    elt.tooltip({placement: "right", container: "body"});

                }
            }
        }])

    .directive('floatPanel', function () {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                elm.lobiPanel({
                    sortable: true,
                    close: false,
                    editTitle: false,
                    unpin: false,
                    /*
                     unpin: {
                     icon: 'fa fa-arrows'
                     },
                     */
                    minimize: {
                        icon: 'fa fa-chevron-up',
                        icon2: 'fa fa-chevron-down'
                    },
                    expand: {
                        icon: 'fa fa-expand',
                        icon2: 'fa fa-compress'
                    }
                })
                var instance = elm.data('lobiPanel');
                instance.setLoadUrl("_");
                elm.on("beforeLoad.lobiPanel", function (evt, panel) {
                    scope.Refresh(this, panel);
                    scope.$apply();
                })
                elm.on("onFullScreen.lobiPanel", function (evt, panel) {
                    if (scope.Maximize)
                        scope.Maximize(this, panel);
                })
                elm.on("onSmallSize.lobiPanel", function (evt, panel) {
                    if (scope.Minimize)
                        scope.Minimize(this, panel);
                })
            }
        }
    })

    .directive('selector', ['$compile', function ($compile) {
        return {
            //restrict: "A",
            link: function (scope, elt, attrs) {
                var menu = angular.element('<div class="dropdown dropdown-hover" style="display: inline-block"></div>');
                var button = angular.element('<button class="btn btn-info dropdown-toggle" type="button" data-toggle="dropdown">' +
                    attrs.label +
                    '<span class="caret"></span></button>');
                menu.append(button);
                var menuClass = attrs.drop ? "dropdown-menu " + attrs.drop : "dropdown-menu";
                var ul = angular.element('<ul class="' + menuClass + '">');
                var selector = attrs.field;
                Object.keys(scope[selector]).forEach(function (key) {
                    var li = angular.element('<li></li>');
                    var a = angular.element('<a class="selector" href="Javascript:">' + key + '</a>');
                    a.attr("ng-click", selector + "." + key + "=!" + selector + "." + key + "; " + selector + "Changed()");
                    a.attr("ng-class", "{'selector-show': " + selector + "." + key + ",'selector-hide': !" + selector + "." + key + "}")
                    li.append(a);
                    ul.append(li);
                })
                menu.append(ul);
                elt.append($compile(menu)(scope));
            }
        }
    }
    ])


    .directive('dashboard', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                var dashboard = JSON.parse(localStorage.getItem(attrs.storage))
                if ((!dashboard) || (dashboard.ver != "1.1"))
                    dashboard = {
                        ver: "1.3",
                        panels: [[
                            "dashboard-system",
                            "dashboard-modules",
                            "dashboard-feed"
                        ],
                            ["dashboard-hierarchy",
                                "dashboard-feed-providers",
                                "dashboard-online-users",
                                "dashboard-mc-accounts",
                                "dashboard-closeday",
                                "dashboard-account-margins"
                            ]]
                    }
                for (var i = 0; i < dashboard.panels.length; i++) {
                    var p = dashboard.panels[i];
                    p.forEach(function (name) {
                        var panel;
                        var column = elm.children('.column')[i];
                        switch (name) {
                            case "dashboard-system":
                                panel = angular.element('<div ng-show="access.dashboard.System()" ng-include></div>');
                                panel.attr("src", "'partials/dashboard/system.html'");
                                angular.element(column).append($compile(panel)(scope));
                                break;
                            case "dashboard-modules":
                                panel = angular.element('<div ng-show="access.dashboard.Modules()" ng-include></div>');
                                panel.attr("src", "'partials/dashboard/modules.html'");
                                angular.element(column).append($compile(panel)(scope));
                                break;
                            case "dashboard-feed":
                                panel = angular.element('<div ng-show="access.dashboard.Rates()" ng-include></div>');
                                panel.attr("src", "'partials/dashboard/rates.html'");
                                angular.element(column).append($compile(panel)(scope));
                                break;
                            case "dashboard-closeday":
                                panel = angular.element('<div ng-show="access.dashboard.System()" ng-include></div>');
                                panel.attr("src", "'partials/dashboard/closeDay.html'");
                                angular.element(column).append($compile(panel)(scope));
                                break;
                            case "dashboard-hierarchy":
                                panel = angular.element('<div ng-include></div>');
                                panel.attr("src", "'partials/dashboard/tree.html'");
                                angular.element(column).append($compile(panel)(scope));
                                break;
                            case "dashboard-feed-providers":
                                panel = angular.element('<div ng-show="access.dashboard.Feed()" ng-include></div>');
                                panel.attr("src", "'partials/dashboard/feed.html'");
                                angular.element(column).append($compile(panel)(scope));
                                break;
                            case "dashboard-online-users":
                                panel = angular.element('<div ng-show="access.dashboard.OnlineUsers()" ng-include></div>');
                                panel.attr("src", "'partials/dashboard/online.html'");
                                angular.element(column).append($compile(panel)(scope));
                                break;
                            case "dashboard-mc-accounts":
                                panel = angular.element('<div ng-show="access.dashboard.MCAccounts()" ng-include></div>');
                                panel.attr("src", "'partials/dashboard/MCAccounts.html'");
                                angular.element(column).append($compile(panel)(scope));
                                break;
/*
                            case "dashboard-account-margins":
                                panel = angular.element('<div ng-show="access.dashboard.MCAccounts()" ng-include></div>');
                                panel.attr("src", "'partials/dashboard/accountMargins.html'");
                                angular.element(column).append($compile(panel)(scope));
                                break;
*/
                        }
                    })
                }
            }
        }
    }])

    .directive('riskmanagement', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                //var layout = null;
                var layout = JSON.parse(localStorage.getItem('portal.riskmanagementlayout'));

                if (layout) {
                    if ((layout.version == undefined) || (layout.version < 4))
                        layout = null;
                }

                if (!layout)

                    layout = {
                        items: [
                            [
                                ['exposure'],
                                ['blotter'],
                                [
                                    'abookplusbbookusd',
                                    'bbookusd'
                                ]
                            ],
                            [
                                [
                                    'plsummary',
                                    'pl',
                                    'rates'
                                ],
                                ['abookusd']
                            ]
                        ]
                    };

                layout.items.forEach(function (row, rowindex) {
                    var htmlRow = element.children('.row')[rowindex];

                    row.forEach(function (column, columnindex) {
                        var htmlColumn = angular.element(htmlRow).children('.column')[columnindex];

                        column.forEach(function (panelname, panelindex) {
                            var htmlPanel = angular.element('<div></div>');
                            htmlPanel.attr("ng-include", "'partials/riskmanagement/panels/" + panelname + ".html'");
                            angular.element(htmlColumn).append($compile(htmlPanel)(scope));
                        })
                    })
                });
            }
        }
    }])

    .directive("fileSelect", function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs){
                element.bind("change", function(e){
                    var scope = angular.element(e.target).scope().$parent;
                    scope[attrs.file] = e.target.files[0];
                    scope.$apply();
                })
            }
        }
    });

app.directive('sortable', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs, ctrl) {
            elm.addClass('sortable');
            elm.sortable({
                connectWith: '.column',
                items: '.lobipanel-sortable',
                handle: '.panel-heading',
                cursor: 'move',
                placeholder: 'lobipanel-placeholder',
                forcePlaceholderSize: true,
                opacity: 0.7,
                revert: 300,
                update: function (event, ui) {
                }
            });
        }
    }
});

app.directive('slider', function () {
    return {
        restrict: 'A',
        link: function (scope, el, attrs) {
            el.bootstrapSlider(scope.getSliderOptions());
            el.bootstrapSlider().on('slideStop', function (evt) {
                scope.setSliderLevel(evt.value);
            })
        }
    }
});
