/*
 * bae-statistics-chart-generator
 * https://github.com/aarranz/bae-statistics-chart-generator-operator
 *
 * Copyright (c) 2016 CoNWeT Lab., Universidad Politécnica de Madrid
 * Licensed under the Apache2 license.
 */

(function (MP) {

    "use strict";

    var bae_api_endpoint = 'DSUsageManagement/api/usageManagement/v2/usage';

    var unit_measure_mapping = {
        'megabyte': 'Downloads',
        'millisecond': 'Usage',
        'call': 'API calls'
    };

    var parse_query = function parse_query(location) {
	    var params = {};
	    location.search.substr(1).split('&').forEach(function (param) {
	        var parts = param.split('=');
	        params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	    });
	    return params;
    };

    var send_chart_options = function send_chart_options(usage_logs) {
        var series = {}, series_list, last_rated;

        usage_logs.forEach(function (usage_log) {
            var info, timestamp, measureName;

            timestamp = Date.parse(usage_log.date);

            if (usage_log.status == 'Rated') {
                last_rated = timestamp;
            }

            info = {};

            usage_log.usageCharacteristic.forEach(function (entry) {
                info[entry.name] = entry.value;
            });

            measureName = unit_measure_mapping[info.unit];
            if (!(measureName in series)) {
                series[measureName] = {
                    name: measureName,
                    tooltip: {
                        valueSuffix: ' ' + info.unit
                    },
                    data: []
                };
            }
            series[measureName].data.push([timestamp, parseFloat(info.value)]);
        });

        // Sort series
        for (var key in series) {
            series[key].data.sort(function (a, b) {
                // Sort by timestamp (field 0)
                return a[0] - b[0];
            });
        }

        // Convert series into an array
        series_list = Object.keys(series).sort().map(function (key) {return series[key];});

        var title = "Usage data for product " + params.productId;
        var options = {
            title: {
                text: title
            },
            plotOptions: {
                series: {
                    zoneAxis: 'x',
                    zones: [{
                        value: new Date().getTime()
                    }, {
                        dashStyle: 'dot'
                    }]
                }
            },
            xAxis: {
                type: 'datetime',
                ordinal: false
            },
            series: series_list
        };

        if (last_rated) {
            options.xAxis.plotLines = [{
                color: 'red',
                value: last_rated,
                width: 2
            }]
        }

        MP.wiring.pushEvent('chart-options', JSON.stringify(options));
    };

    // Parse bae parameters
    var params = parse_query(window.frameElement.ownerDocument.location);

    MP.http.makeRequest((new URL(bae_api_endpoint, params.server).toString()), {
        method: 'GET',
        requestHeaders: {
	        "Authorization": "Bearer " + params.token
	    },
        parameters: {
            "usageCharacteristic.value": params.productId,
            "status": "Guided,Rated"
        },
        onSuccess: function (response) {
            var usage_logs = JSON.parse(response.responseText);
            send_chart_options(usage_logs);
        }
    });

})(MashupPlatform);
