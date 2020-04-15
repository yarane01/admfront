function formatXml(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    jQuery.each(xml.split('\r\n'), function(index, node) {
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w([^>]*[^\/])?>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
}

var dailyRates = {
    data: [],
    clear: function() { this.data.length = 0; },
    contains: function (name) {
        for (var i = 0; i < this.data.length; i++) {
            var dailyRate = this.data[i];
            if (dailyRate.instrumentName == name)
                return true;
        }
        return false;
    },
    loadFromCSV: function(file, successCallBack, errorCallBack) {
        
        if (!file) {
            successCallBack();
            return;
        }

        var target = this;

        var fileReader = new FileReader();

        fileReader.onloadend = function (event) {
            var fileContent = event.target.result;

            try {
                var allTextLines = fileContent.split(/\r\n|\n/);
                
                for (var i = 0; i < allTextLines.length; i++) {
                    if (i == 0) {
                        continue; // skip first line
                    }
                    var lineData = allTextLines[i].split(',');

                    if (lineData.length < 3) {
                        continue; // skip empty lines
                    }

                    var dailyRate = {};

                    dailyRate.instrumentName = lineData[0]; //.replace(new RegExp('/', 'g'), '');
                    //dailyRate.instrumentName = dailyRate.instrumentName.replace(new RegExp(' ', 'g'), '');

                    dailyRate.offer = parseFloat(lineData[1]);
                    dailyRate.bid = parseFloat(lineData[2]);
                    
                    if (isNaN(dailyRate.bid) || isNaN(dailyRate.offer))
                        continue;

                    target.data.push(dailyRate);
                    
                }

                successCallBack();
            }
            catch(e) {
                errorCallBack('Error parsing file "' + file.name + '": ' + e.message);
            }
        };

        fileReader.onerror = function () {
            errorCallBack('Error reading file "' + file.name + '"');
        };
        
        fileReader.readAsText(file);
        
    },
    loadFromXLS: function(file, successCallBack, errorCallBack) {
        if (!file) {
            successCallBack();
            return;
        }

        var target = this;

        var fileReader = new FileReader();

        fileReader.onloadend = function (event) {
            var fileContent = event.target.result;
            var i;

            try {
                var workbook = XLS.read(fileContent, {type: 'binary'});

                var sheet = workbook.Sheets[workbook.SheetNames[0]];

                var ref = sheet['!ref'];

                if (ref == undefined)
                    throw new Error('"!ref" field not found');

                var range = {min: {r: 0, c: 0}, max: {r: 0, c: 0}};

                range.min = XLSX.utils.decode_cell(ref.split(':')[0]);
                range.max = XLSX.utils.decode_cell(ref.split(':')[1]);

                var address;
                var cell;
                var dailyRate;

                for (i = range.min.r; i < range.max.r; i++) {
                    address = XLSX.utils.encode_cell({r: i, c: 1});
                    cell = sheet[address];

                    if ((cell == undefined) || (cell.v == undefined)) continue;

                    dailyRate = {
                        instrumentName: cell.v.replace(new RegExp(' ', 'g'), '').toUpperCase()
                    };

                    if (target.contains(dailyRate.instrumentName)) continue;

                    address = XLSX.utils.encode_cell({r: i, c: 3});
                    cell = sheet[address];

                    if ((cell == undefined) || (cell.v == undefined)) continue;

                    dailyRate.offer = parseFloat(cell.v);

                    if (isNaN(dailyRate.offer))
                        continue;

                    address = XLSX.utils.encode_cell({r: i, c: 4});
                    cell = sheet[address];

                    if ((cell == undefined) || (cell.v == undefined)) continue;

                    dailyRate.bid = parseFloat(cell.v);

                    if (isNaN(dailyRate.bid))
                        continue;

                    target.data.push(dailyRate);
                }

                successCallBack();
            }
            catch(e) {
                errorCallBack('Error parsing file "' + file.name + '": ' + e.message);
            }
        };

        fileReader.onerror = function () {
            errorCallBack('Error reading file "' + file.name + '"');
        };

        fileReader.readAsBinaryString(file);
    }
};

var instruments = {
    data: [],
    clear: function() { this.data.length = 0; },
    getByName: function(name) {
        for (var i = 0; i < this.data.length; i++) {
            var instrument = this.data[i];
            if (instrument.name == name)
                return instrument;
        }
        return undefined;
    },
    contains: function(name) {
        return (this.getByName(name) != undefined);
        // for (var i = 0; i < this.data.length; i++) {
        //     var instrument = this.data[i];
        //     if (instrument.name == name)
        //         return true;
        // }
        // return false;
    },
    loadFromCSV: function(file, successCallBack, errorCallBack) {
        if (!file) {
            successCallBack();
            return;
        }
        var target = this;

        var fileReader = new FileReader();

        fileReader.onloadend = function (event) {
            var fileContent = event.target.result;

            try {
                var allTextLines = fileContent.split(/\r\n|\n/);

                for (var i = 0; i < allTextLines.length; i++) {

                    var lineData = allTextLines[i].split(',');

                    if (lineData.length < 2)
                        continue;

                    var instrument = {};

                    instrument.name = lineData[0].replace(new RegExp(' ', 'g'), '').toUpperCase();
                    instrument.multiplier = parseFloat(lineData[1].replace(new RegExp(',', 'g'), '.'));

                    if (lineData.length > 2)
                        instrument.internalName = lineData[2].replace(new RegExp(' ', 'g'), '').toUpperCase();
                    else
                        instrument.internalName = instrument.name;

                    if (!target.contains(instrument))
                        target.data.push(instrument);
                }

                successCallBack();
            }
            catch(e) {
                errorCallBack('Error parsing file "' + file.name + '": ' + e.message);
            }
        };

        fileReader.onerror = function () {
            errorCallBack('Error reading file "' + file.name + '"');
        };

        fileReader.readAsText(file);
    }
};

var xmlFile;

function processData(successCallBack, errorCallBack) {
    function formatFloat(value, precision){
        return value.toFixed(precision);
    }

    try {
        xmlFile = document.implementation.createDocument('', 'change-price-preset', null);
        for (var i = 0; i < dailyRates.data.length; i++) {
            var dailyRate = dailyRates.data[i];
            var node = xmlFile.createElement("item");
            node.setAttribute("instrument", dailyRate.instrumentName.replace(/"/g,''));
            node.setAttribute("sell-interest", dailyRate.bid);
            node.setAttribute("buy-interest", dailyRate.offer);
            xmlFile.documentElement.appendChild(node);
        }
        successCallBack();
    }
    catch(e) {
        errorCallBack('Error processing data: ' + e.message);
    }
}

function uploadInterests($http, successCallBack, errorCallBack) {
    var serializer = new XMLSerializer();
    var output = formatXml(serializer.serializeToString(xmlFile));
    
    var req = {
        method: 'PUT',
        url: apiurl + '/updateinterests',
        data: output
    };

    $http(req).
    then(
        function (successResponse) {
            if (successResponse.data.status == 'OK') {
                successCallBack();
            }
            else {
                errorCallBack('Error uploading data: ' + successResponse.data.payload[0]);
            }
        },
        function (errorResponse) {
            var errorMessage = null;

            if (errorResponse.data.payload && (errorResponse.data.payload.length > 0))
                errorMessage = 'Error uploading data: ' + errorResponse.data.payload[0];
            else
                errorMessage = 'Error uploading data';

            errorCallBack(errorMessage);
        }
    )
        .catch(function (response) {
            errorCallBack('Error uploading data');
        });
}

function updateInterests($scope, instruments) {
    var items = xmlFile.documentElement.getElementsByTagName('item');

    for (var i = 0; i < items.length ;i++) {
        var item = items[i];

        var instrument = instruments.getByName(item.getAttribute('instrument'));

        if (instrument) {
            instrument.interestsell = item.getAttribute('sell-interest');
            instrument.interestbuy = item.getAttribute('buy-interest');
        }
    }

    //reload table data
    $scope.table.clear().rows.add(instruments.data).draw(false);
}


function doSubmitInterests($scope, $http) {
    $('#submitInterestsDialog').data('bs.modal').options.backdrop = 'static';

    $scope.processing = true;
    $scope.errorMessage = null;

    var errorCallBack = function(errorMessage) {
        $scope.processing = false;
        $scope.errorMessage = errorMessage;
        $('#submitInterestsDialog').data('bs.modal').options.backdrop = true;
    };

    dailyRates.clear();
    instruments.clear();
    
    dailyRates.loadFromCSV($scope.dailyRatesCSVFile,
        function() {
            dailyRates.loadFromXLS(null,
                function() {
                    instruments.loadFromCSV(null,
                        function() {
                            processData(
                                function(){
                                    uploadInterests($http,
                                        function() {
                                            updateInterests($scope, $scope.$root.instruments);
                                            $scope.processing = false;
                                            dailyRates.clear();
                                            instruments.clear();
                                            $('#submitInterestsDialog').modal('hide');
                                        },
                                        errorCallBack);
                                },
                                errorCallBack);
                        },
                        errorCallBack);
                },
                errorCallBack);
        },
        errorCallBack
    );
}

