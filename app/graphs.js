var googleInitilized = false;
var cpuAlertIndicator = undefined;

function googleLoaded() {
    googleInitilized = true;
    cpuAlertIndicator = new CpuAlert();
}

function Chart(chartType, ownerid, options) {
    var data = new google.visualization.DataTable();
    data.addColumn({type: 'string'});
    data.addColumn({type: 'number', pattern: '#.0'});

    var chart;
    switch (chartType) {
        case 'Column':
            chart = new google.visualization.ColumnChart(document.getElementById(ownerid));
            break
        case 'Area':
            chart = new google.visualization.AreaChart(document.getElementById(ownerid));
            break;
    }

    var options = angular.extend(
        {
            maxLength: 50,
            width: "100%",
            height: 100,
            legend: 'none',
            fontSize: 12,
            enableInteractivity: false,
            // animation:{
            //     duration: 1000,
            //     easing: 'in'
            // }
        }, options);

    if (options.initWithZero) {
        for (var i = 0; i < options.maxLength-1; i++) {
            data.addRow([moment().format('HH:mm:ss'), 0]);
        }
    }

    return {
        draw: function () {
            chart.draw(data, options);
        },
        addRow: function (time, value) {
            var count = data.getNumberOfRows();
            if (count >= options.maxLength)
                data.removeRow(0);
            data.addRow([time, value]);
        },
        addRows: function (rows) {
            data.addRows(rows);
        }
    }
}


function Gauges() {

    var data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['CPU', 0],
        ['Memory', 0]
    ]);

    var options = {
        width: 320,
        height: 150,
        redFrom: 90,
        redTo: 100,
        yellowFrom: 75,
        yellowTo: 90,
        minorTicks: 5
    };

    var chart = new google.visualization.Gauge(document.getElementById('gauges'));

    return {
        draw: function () {
            chart.draw(data, options);
        },
        update: function (memory, cpu) {
            data.setValue(1, 1, memory);
            data.setValue(0, 1, cpu);
            chart.draw(data, options);
        }
    }
}


function CpuAlert() {

    var data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Target machine CPU', 0]
    ]);

    var options = {
        width: 400,
        height: 400,
        redFrom: 90,
        redTo: 100,
        yellowFrom: 75,
        yellowTo: 90,
        minorTicks: 5
    };

    var chart = new google.visualization.Gauge(document.getElementById('cpuAlert'));

    return {
        draw: function () {
            chart.draw(data, options);
        },
        update: function (cpu) {
            data.setValue(0, 1, cpu);
            chart.draw(data, options);
        }
    }
}


