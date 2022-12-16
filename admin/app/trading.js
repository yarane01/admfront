function tradeProxy(scope, rootScope, api) {
    scope.order = {
        lots: 1
    }
    scope.instruments = rootScope.instruments.data;
    scope.order.instrument = rootScope.instruments.getByName("EURUSD");
    scope.order.bs = 'B';
    scope.hint = getHint();

    function getHint() {
        if (scope.order.lots) {
            var result = "You're ";
            result += scope.order.bs == 'B' ? 'buying ' : 'selling ';
            result += scope.order.lots * scope.order.instrument.lotsize;
            result += ' ' + scope.order.instrument.symbol;
            return result;
        }
        else return 'Waiting for input...'
    }

    scope.$watch("order.instrument", function (newValue, oldValue) {
        scope.hint = getHint();
        var name = scope.order.instrument.symbol;
        var symbol = rootScope.symbols[name];
        scope.order.quote = symbol[symbol.last];
    }
    )

    scope.$watch("order.lots", function (newValue, oldValue) {
        scope.hint = getHint();
    }
    )

    scope.$watch("order.bs", function (newValue, oldValue) {
        scope.hint = getHint();
    }
    )

    return {
        createTrade: function (callback) {
            var trade = {
                account: scope.order.accountn,
                price: scope.order.price,
                username: rootScope.portalUser.username,
                side: scope.order.bs,
                quantity: scope.order.lots * scope.order.instrument.lotsize,
                symbol: scope.order.instrument.symbol
            }
            scope.context.inprogress = true;
            api.createTrade(trade, angular.extend(errorHandler(scope),
                {
                    ok: function (response) {
                        scope.context.inprogress = false;
                        callback();
                    }
                }
            ));

        }
    }
}

function orderProxy(scope, rootScope, api) {
    scope.order = {
        lots: 1,
        duration: 'GTC'
    }
    scope.instruments = rootScope.instruments.data;
    scope.order.instrument = rootScope.instruments.getByName("EURUSD");
    scope.order.bs = 'B';
    scope.hint = getHint();

    function getHint() {
        if (scope.order.lots) {
            var result = "You're ";
            result += scope.order.bs == 'B' ? 'buying ' : 'selling ';
            result += scope.order.lots * scope.order.instrument.lotsize;
            result += ' ' + scope.order.instrument.symbol;
            return result;
        }
        else return 'Waiting for input...'
    }

    scope.$watch("order.instrument", function (newValue, oldValue) {
        scope.hint = getHint();
        var name = scope.order.instrument.symbol;
        var symbol = rootScope.symbols[name];
        scope.order.quote = symbol[symbol.last];
    }
    )

    scope.$watch("order.lots", function (newValue, oldValue) {
        scope.hint = getHint();
    }
    )

    scope.$watch("order.bs", function (newValue, oldValue) {
        scope.hint = getHint();
    }
    )

    return {
        createTrade: function (callback) {
            var trade = {
                type: 'Entry',
                accountid: scope.order.account.systemid,
                amount: scope.order.lots * scope.order.instrument.lotsize,
                symbol: scope.order.instrument.symbol,
                duration: scope.order.duration,
                rate: scope.order.rate
            }
            if (scope.order.bs == 'S') trade.amount = -trade.amount;

            scope.context.inprogress = true;
            api.createTrade(trade, angular.extend(errorHandler(scope),
                {
                    ok: function (response) {
                        scope.context.inprogress = false;
                        callback();
                    }
                }
            ));

        }
    }
}

