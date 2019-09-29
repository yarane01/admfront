angular.module('portal')
    .filter('unsafe', function ($sce) {
        return $sce.trustAsHtml;
    });


angular.module('portal')
    .filter('intNumber', [function () {
        return function (input) {
            return parseInt(input, 10);
        };
    }]);


angular.module('portal')
    .filter('yesNoSign', [function () {
        return function (input) {
            return input ? '<span><i class="fa fa-check text-success"></i></span>' :
                '<span><i class="fa fa-ban text-danger"></i></span>';
        };
    }]);

angular.module('portal')
    .filter('symbol', [function () {
        return function (input, filter) {
            if (filter == "") return input;
            var filtered = [];
            input.forEach(function (item) {
                if (item.symbol.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
                    filtered.push(item);
            })
            return filtered;
        }
    }])

angular.module('portal')
    .filter('toArray', function () {
        return function (obj, addKey) {
            if (!angular.isObject(obj)) return obj;
            if (addKey === false) {
                return Object.keys(obj).map(function (key) {
                    return obj[key];
                });
            } else {
                return Object.keys(obj).map(function (key) {
                    var value = obj[key];
                    console.log(value);
                    return angular.isObject(value) ?
                        Object.defineProperty(value, '$key', {enumerable: false, value: key}) :
                    {$key: key, $value: value};
                });
            }
        };
    });
