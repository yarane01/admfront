angular
    .module('portal')
    .service('SubscriptionService', SubscriptionService);

function SubscriptionService($http, $q, feedproviders) {
    var error = false;
    var errorMessage;
    var loaded = false;

    function deleteNullKeys(obj) {
        for (var key in obj) {
            if (obj[key] == null)
                delete obj[key];
        }
    }

    function deleteEmptyKeys(obj) {
        for (var key in obj) {
            if (obj[key] == "")
                delete obj[key];
        }
    }

    var providers = {
        data: [],

        getByName: function (name) {
            for (var i = 0; i < this.data.length; i++)
                if (this.data[i].name == name)
                    return this.data[i];

            return undefined;
        }
    };

    var subscription = {
        data: [],

        getBySymbol: function (name) {
            for (var i = 0; i < this.data.length; i++)
                if (this.data[i].symbol == name)
                    return this.data[i];

            return undefined;
        }
    };

    var synonyms = {
        data: [],

        getBySymbol: function (name) {
            for (var i = 0; i < this.data.length; i++)
                if (this.data[i].symbol == name)
                    return this.data[i];

            return undefined;
        }
    };

    var priority = {
        data: [],

        getBySymbol: function (name) {
            for (var i = 0; i < this.data.length; i++)
                if (this.data[i].symbol == name)
                    return this.data[i];

            return undefined;
        }
    };

    this.getProviders = function () {
        return providers;
    };

    this.getSubscription = function () {
        return subscription;
    };

    this.getSynonyms = function () {
        return synonyms;
    };

    this.getPriority = function () {
        return priority;
    };

    this.refresh = function (forced) {
        //To not reload already loaded data
        if (loaded && !forced) {
            var deferred = $q.defer();

            deferred.resolve();
            return deferred.promise;
        }

        error = false;
        loaded = false;

        var promises = [];

        promises.push($http.get(stpapiurl + '/instrumentSynonym', {timeout: 30000}));
        promises.push($http.get(stpapiurl + '/configureProviderInstruments', {timeout: 30000}));
        promises.push($http.get(stpapiurl + '/bankPriority', {timeout: 30000}));
        promises.push(feedproviders.refresh());

        return $q.all(promises)
            .then(function (result) {

                var synonymsResp = result[0].data;
                var subscriptionResp = result[1].data;
                var priorityResp = result[2].data;
                providers.data = feedproviders.getProviders();

                if ((synonymsResp.status == 'OK') && (subscriptionResp.status == 'OK')
                    && (priorityResp.status == 'OK')) {

                    synonyms.data = [];
                    subscription.data = [];
                    priority.data = [];

                    synonymsResp.payload.forEach(function (item) {
                        synonyms.data.push(item);
                    });

                    subscriptionResp.payload.forEach(function (item) {
                        subscription.data.push(item);
                    });

                    priorityResp.payload.forEach(function (item) {
                        priority.data.push(item);
                    });

                    //Удаляем из всех списков провайдеров, которые недоступны

                    var provider;

                    subscription.data.forEach(function (instrument) {
                        for (var allowedProvider in instrument.subscribeAllowed) {
                            provider = providers.getByName(allowedProvider);
                            if (!provider)
                                delete instrument.subscribeAllowed[allowedProvider];
                        }
                    });

                    synonyms.data.forEach(function (instrument) {
                        deleteNullKeys(instrument.synonym);
                        for (var allowedProvider in instrument.synonym) {
                            provider = providers.getByName(allowedProvider);
                            if (!provider)
                                delete instrument.synonym[allowedProvider];
                        }
                    });

                    priority.data.forEach(function (instrument) {
                        //for (var allowedProvider in instrument.priority) {
                        for (var allowedProvider = instrument.priority.length - 1; allowedProvider >= 0; allowedProvider--) {
                            provider = providers.getByName(instrument.priority[allowedProvider]);
                            if (!provider)
                                instrument.priority.splice(allowedProvider, 1);
                        }

                        //Надо убедиться, что в списке приоритетов присутствуют приоритеты
                        //для доступных провайдеров, и если их там нет - добавить их туда
                        providers.data.forEach(function (provider) {
                            if (instrument.priority.indexOf(provider.name) == -1) {
                                instrument.priority.push(provider.name);
                            }
                        })
                    });

                    priority.moveLeft = function (item, provider) {
                        var index = item.priority.indexOf(provider.name);

                        if (index >= 0) {
                            var temp = item.priority[index];
                            item.priority[index] = item.priority[index - 1];
                            item.priority[index - 1] = temp;
                        }
                    };

                    priority.moveRight = function (item, provider) {
                        var index = item.priority.indexOf(provider.name);

                        if (index >= 0) {
                            var temp = item.priority[index];
                            item.priority[index] = item.priority[index + 1];
                            item.priority[index + 1] = temp;
                        }
                    };

                    loaded = true;
                }
                else {
                    loaded = true;
                    error = true;
                    errorMessage = 'Error loading data';
                }
            }, function () {
                loaded = true;
                error = true;
                errorMessage = 'Error loading data';
            });
    };

    this.getSynonyms = function () {
        return synonyms;
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

    this.saveSubscription = function () {
        var request = {
            method: 'POST',
            url: stpapiurl + '/configureProviderInstruments',
            data: JSON.stringify(subscription.data)
        };

        return $http(request);
    };

    this.saveSynonyms = function () {
        var data = [];
        synonyms.data.forEach(function (item) {
            deleteEmptyKeys(item.synonym);
            if (Object.keys(item.synonym).length > 0)
                data.push(item);
        });

        var request = {
            method: 'POST',
            url: stpapiurl + '/instrumentSynonym',
            data: JSON.stringify(data)
        };

        return $http(request);
    };

    this.savePriority = function () {
        var data = [];

        priority.data.forEach(function (item) {
            if (Object.keys(item.priority).length > 0)
                data.push(item);
        });

        var request = {
            method: 'POST',
            url: stpapiurl + '/bankPriority',
            data: JSON.stringify(data)
        };

        return $http(request);
    };
}
