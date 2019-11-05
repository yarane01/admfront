angular
    .module('portal')
    .controller('FeedSubscriptionCtrl', FeedSubscriptionCtrl);

function FeedSubscriptionCtrl($scope, $rootScope, SubscriptionService, $q) {

    $rootScope.activePage = "subscription";

    $scope.context = {changed: false};

    $scope.selectAll = function () {
        $scope.context.filtered.forEach(
            function (item) {
                if (item.slaves) //first item for this instrument
                    item.selected = true;
            }
        );
        $('#select-all').blur();
        updateCount();
    };

    $scope.deselectAll = function () {
        $scope.context.filtered.forEach(
            function (item) {
                item.selected = false;
            }
        );
        $('#deselect-all').blur();
        updateCount();
    };

    $scope.invertSelection = function () {
        $scope.context.filtered.forEach(
            function (item) {
                if (item.slaves) //first item for this instrument
                    item.selected = !item.selected;
            }
        );
        $('#invert').blur();
        updateCount();
    };

    $scope.selectByType = function (type) {
        $scope.context.filtered.forEach(
            function (i) {
                if (i.instrument.instrumenttype == type)
                    i.selected = !i.selected;
            }
        );
        $('#button-' + type).blur();
        updateCount();
    };

    $scope.clearFilter = function () {
        $scope.context.filter = "";
    };

    $scope.selectByProvider = function (key) {
        var count = getSelectedCount();
        $scope.context.filtered.forEach(
            function (i) {
                if (i.selected || count == 0) {
                    i.subscribeAllowed[key] = true;
                    $scope.context.changed = true;
                }
            }
        )
    };

    $scope.deselectByProvider = function (key) {
        var count = getSelectedCount();
        $scope.context.filtered.forEach(
            function (i) {
                if (i.selected || count == 0) {
                    i.subscribeAllowed[key] = false;
                    $scope.context.changed = true;
                }
            }
        )
    };

    $scope.itemSelected = function () {
        updateCount();
    };

    $scope.itemChanged = function () {
        $scope.context.changed = true;
    };

    $scope.bulkUpdate = function () {

        var bulkItems = [];

        SubscriptionService.getProviders().data.forEach(function(provider) {
            var item = {
                provider: provider,
                subscribed: false,
                priority: bulkItems.length,

                increasePriority: function() {
                    for(var i = 0; i < $scope.bulkContext.items.length; i++){
                        var curItem = $scope.bulkContext.items[i];
                        if (curItem.priority == this.priority - 1) {
                            curItem.priority++;
                            break;
                        }
                    }

                    this.priority--;
                },
                decreasePriority: function() {
                    for(var i = 0; i < $scope.bulkContext.items.length; i++){
                        var curItem = $scope.bulkContext.items[i];
                        if (curItem.priority == this.priority + 1) {
                            curItem.priority--;
                            break;
                        }
                    }

                    this.priority++;
                }
            };

            bulkItems.push(item);
        });

        var selectedItems = [];

        $scope.bulkContext = {
            items: bulkItems,

            changeSubscription: false,
            changePriority: false
        };

        $('#bulkUpdateDialog').modal();
    };

    $scope.doBulkUpdate = function() {

        $scope.context.data.forEach(function(item){

            if (item.getSelected()) {

                $scope.bulkContext.items.forEach(function (bulkItem) {

                    if ($scope.bulkContext.changeSubscription) {
                        item.subscription.subscribeAllowed[bulkItem.provider.name] = bulkItem.subscribed;
                    }

                    if ($scope.bulkContext.changePriority) {
                        item.priority.priority[bulkItem.priority] = bulkItem.provider.name;
                    }
                });

                if ($scope.bulkContext.changePriority)
                    item.currentPriority = item.priority.priority.indexOf(item.provider.name)

            }
        });

        $('#bulkUpdateDialog').modal('hide');

        $scope.context.changed = true;
    };

    $scope.getSelectedProvidersCount = function() {
        var count = 0;

        $scope.context.providers.data.forEach(function(provider) {
            if (provider.selected)
                count++;
        });

        return count;
    };

    $scope.providerSelected = function () {
        createData();

        createFilteredData($scope.context.filter);

        updateCount();
    };

    $scope.context.mapType = instrumenttypemap;

    $scope.init = function () {
        $scope.context.changed = false;
        $scope.context.dataloaded = false;
        $scope.context.error = false;
        $scope.context.data = [];
        $scope.context.filtered = [];
        $scope.context.filter = '';
        $scope.context.inprogress = false;
        $scope.context.selected = 0;

        SubscriptionService.refresh()
            .then(function(result) {

                $scope.context.providers = SubscriptionService.getProviders();

                $scope.context.providers.data.forEach(function(provider) {
                    provider.selected = true;
                });

                createData();

                createFilteredData('');

                updateCount();

                $scope.context.dataloaded = true;
            },
            function(result) {
                $scope.context.errorMessage = result.errorMessage;
                $scope.context.dataerror = true;
                $scope.context.dataloaded = true;
            });

    };

    function createData() {
        $scope.context.count = 0;
        $scope.context.data = [];

        if (!SubscriptionService.loaded())
            return;

        var subscription = SubscriptionService.getSubscription();
        var synonyms = SubscriptionService.getSynonyms();
        var priority = SubscriptionService.getPriority();

        $rootScope.instruments.data.forEach(function(instrument) {
            var firstItem;

            $scope.context.providers.data.forEach(function(provider) {
                if (provider.selected) {
                    var dataItem = {};

                    dataItem.instrument = instrument;
                    dataItem.provider = provider;
                    dataItem.subscription = subscription.getBySymbol(instrument.symbol);
                    dataItem.synonyms = synonyms.getBySymbol(instrument.symbol);
                    dataItem.priority = priority.getBySymbol(instrument.symbol);

                    dataItem.selected = false;
                    dataItem.currentPriority = dataItem.priority.priority.indexOf(provider.name);

                    dataItem.getSelected = function () {
                        if (this.master)
                            return this.master.selected;
                        else
                            return this.selected;
                    };

                    dataItem.isHighestPriority = function () {
                        return this.priority.priority.indexOf(this.provider.name) == 0;
                    };

                    dataItem.isLowestPriority = function () {
                        return this.priority.priority.indexOf(this.provider.name) == (this.priority.priority.length - 1);
                    };

                    dataItem.increasePriority = function () {

                        SubscriptionService.getPriority().moveLeft(this.priority, this.provider);

                        if (this.master)
                            this.master.processPriority();
                        else
                            this.processPriority();

                        $scope.context.changed = true;
                    };

                    dataItem.decreasePriority = function () {

                        SubscriptionService.getPriority().moveRight(this.priority, this.provider);

                        if (this.master)
                            this.master.processPriority();
                        else
                            this.processPriority();

                        $scope.context.changed = true;
                    };

                    dataItem.setCurrentPriority = function () {
                        this.currentPriority = this.priority.priority.indexOf(this.provider.name);
                    };

                    dataItem.isFirst = function () {
                        return this.slaves !== undefined;
                    };

                    if (!firstItem) {
                        dataItem.span = $scope.context.providers.data.length;
                        firstItem = dataItem;

                        dataItem.slaves = [];

                        dataItem.processPriority = function () {
                            this.setCurrentPriority();

                            this.slaves.forEach(function (slaveItem) {
                                slaveItem.setCurrentPriority();
                            })
                        };

                        $scope.context.count++;
                    }
                    else {
                        dataItem.span = 0;
                        dataItem.master = firstItem;
                        firstItem.slaves.push(dataItem);
                    }

                    $scope.context.data.push(dataItem);
                }
            });

        });
    }

    function createFilteredData(filter) {
        $scope.context.filteredCount = 0;
        $scope.context.filtered = [];

        for (var i = 0; i < $scope.context.data.length; i++) {
            var item = $scope.context.data[i];

            if (item.instrument.symbol.indexOf(filter.toUpperCase()) !== -1) {
                $scope.context.filtered.push(item);
                if (item.slaves)    //first item for this instrument
                    $scope.context.filteredCount++;
            }
        }
    }

    $scope.Refresh = function () {
        $scope.init();
    };

    $scope.$watch('context.filter', function(filter) {
        createFilteredData(filter);
    });

    $scope.save = function () {
        $scope.context.inprogress = true;
        $scope.context.error = false;

        var promises = [];

        promises.push(SubscriptionService.saveSubscription());
        promises.push(SubscriptionService.saveSynonyms());
        promises.push(SubscriptionService.savePriority());

        $q.all(promises)
            .then(
            function() {
                $scope.context.inprogress = false;
                $scope.context.changed = false;
            },
            function () {
                $scope.context.errorMessage = "Error saving data";

                $scope.context.error = true;
                $scope.context.inprogress = false;
            }
        )
    };

    function updateCount() {
        var count = 0;
        $scope.context.data.forEach(
            function (i) {
                if (i.selected && i.span > 0)
                    count++;
            }
        );
        $scope.context.selected = count;
    }

    function getSelectedCount() {
        var count = 0;
        $scope.context.filtered.forEach(
            function (i) {
                if (i.selected) count++;
            }
        );
        return count;
    }

    $scope.init();
}