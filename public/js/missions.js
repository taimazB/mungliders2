function addMission(mission) {
    var data = readGliderData(mission);
    var gjLines = coords2GJline(data);
    var gjPoints = coords2GJpoint(data);
    mapAddLayer(mission, gjLines, gjPoints, '#ffffff');
    map.fitBounds([[d3.min(data.map(d => parseFloat(d.lon))), d3.min(data.map(d => parseFloat(d.lat)))], [d3.max(data.map(d => parseFloat(d.lon))), d3.max(data.map(d => parseFloat(d.lat)))]],
        { padding: 20 })
    $(`#control${mission}`).css("display", "inline-flex");
}


function removeMission(mission) {
    map.removeLayer(`${mission}_line`);
    map.removeLayer(`${mission}_points`);

    map.removeSource(`${mission}_line`);
    map.removeSource(`${mission}_points`);

    $(`#control${mission}`).css("display", "none");
}


function readGliderData(mission) {
    var content = {
        path: `public/missions/${mission}/${mission}.csv`
    };

    var csvData;

    $.ajax({
        url: "/readCSV",
        type: "POST",
        data: content,
        async: false,
        success: function (data, textStatus, jqXHR) {
            csvData = data.data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

    return csvData;
    // var coords = [],
    //     times = [],
    //     descriptions = [],
    //     UVs = [],
    //     WPTs = [];

    // d3.csv("gliders/pearldiver.csv").then(function (data) {
    //     var minLat = 1000, maxLat = -1000;
    //     var minLon = 1000, maxLon = -1000;

    //     data.forEach(function (d) {
    //         coords.push([+d.lon, +d.lat]);
    //         times.push(moment.utc(d.time, "ddd MMM D HH:mm:ss YYYY"));
    //         UVs.push([+d.u, +d.v]);
    //         WPTs.push([+d.wptLon, +d.wptLat]);

    //         // --- Calculate SOG
    //         var speeds = [],
    //             SOG;
    //         try {
    //             for (var i = 1; i <= 3; i++) {
    //                 var distance = turf.distance(
    //                     turf.point(coords[coords.length - i - 1]),
    //                     turf.point(coords[coords.length - i]),
    //                     { units: 'meters' }
    //                 );
    //                 var deltaTime = times[times.length - i].diff(times[times.length - i - 1], 'seconds');
    //                 speeds.push(distance / deltaTime);
    //             }
    //             SOG = Math.round(1000 * speeds.reduce((a, b) => a + b, 0) / speeds.length) / 1000;
    //         } catch { SOG = null; }

    //         // --- Calculate D2W
    //         var D2W = turf.distance(turf.point([+d.lon, +d.lat]), turf.point([+d.wptLon, +d.wptLat]), { units: 'kilometers' });

    //         // --- Calculate UVspeed
    //         var UVspeed = Math.sqrt(d.u ** 2 + d.v ** 2)

    //         descriptions.push({
    //             time: d.time,
    //             lon: d.lon,
    //             lat: d.lat,
    //             UVspeed: UVspeed,
    //             SOG: SOG,
    //             WPTlon: +d.wptLon,
    //             WPTlat: +d.wptLat,
    //             D2W: D2W,
    //             battery: +d.battery,
    //             profileAvail: false,
    //             log: d.log
    //         });

    //         PD_lastTimeE = d.time;
    //         PD_lastLogE = d.log;
    //         PD_lastBatteryE = +d.battery;
    //         PD_lastSOG = SOG;
    //         PD_lastD2W = D2W;
    //         PD_lastUVspeed = UVspeed;

    //         minLat = +d.lat < minLat ? +d.lat : minLat;
    //         maxLat = +d.lat > maxLat ? +d.lat : maxLat;
    //         minLon = +d.lon < minLon ? +d.lon : minLon;
    //         maxLon = +d.lon > maxLon ? +d.lon : maxLon;
    //     });

    //     PD_lastLonE = coords[coords.length - 1][0];
    //     PD_lastLatE = coords[coords.length - 1][1];
    //     PD_lastUV = UVs[UVs.length - 1];
    //     PD_lastWPT = WPTs[WPTs.length - 1];

    // })
}


// --- Get coordinates array from glider array and convert it to GeoJson line string object
function coords2GJline(data) {
    var gjLine = [];
    for (var i = 0; i < data.length - 1; i++) {
        gjLine.push({
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': [[data[i].lon, data[i].lat], [data[i + 1].lon, data[i + 1].lat]]
            },
            'properties': {
                'line-width': .5 + 5 * Math.exp(10 * ((i / data.length) - 1))
            }
        });
    }
    return gjLine;
}


// --- Get coordinates array from glider array and convert it to GeoJson point object
function coords2GJpoint(data) {
    var gjPoint = [];
    for (var i = 0; i < data.length; i++) {
        gjPoint.push({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [data[i].lon, data[i].lat]
            },
            'properties': {
                // 'i': i,
                // 'time': descriptions[i].time,
                // 'lon': descriptions[i].lon,
                // 'lat': descriptions[i].lat,
                // 'UVspeed': descriptions[i].UVspeed,
                // 'SOG': descriptions[i].SOG,
                // 'WPTlon': descriptions[i].WPTlon,
                // 'WPTlat': descriptions[i].WPTlat,
                // 'D2W': descriptions[i].D2W,
                // 'battery': descriptions[i].battery,
                // 'profileAvail': descriptions[i].profileAvail,
                // 'log': descriptions[i].log,
                'radius': 2 + 5 * Math.exp(10 * ((i / data.length) - 1))
            }
        });
    }
    return gjPoint;
}


function mapAddLayer(name, gjLine, gjPoint, color) {
    map.addLayer({
        'id': name + '_line',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': gjLine
            }
        },
        'paint': {
            'line-width': ['get', 'line-width'],
            'line-color': color
        }
    });


    map.addLayer({
        'id': name + '_points',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': gjPoint
            },
            'generateId': true
        },
        'paint': {
            'circle-radius': [
                'case',
                ['boolean',
                    ['feature-state', 'hover'],
                    false
                ],
                ["+",
                    ['get', 'radius'],
                    7
                ],
                ['get', 'radius']
            ],
            'circle-stroke-color': color,
            'circle-color': color
        }
    })
}


var outClick = true;
function updateColor(mission) {
    var xy = $(`#control${mission}`).offset();
    $("#colorPicker")
        .show()
        .css("top", xy.top - 50)
        .css("left", xy.left + 50)

    // --- Remove last handler
    colorPicker.off('color:change');

    colorPicker.on('color:change', (color, changes) => {
        var color = colorPicker.color.rgbString;
        $(`#color${mission}`).css("background", color);
        map.setPaintProperty(`${mission}_line`, 'line-color', color);
        map.setPaintProperty(`${mission}_points`, 'circle-color', color);
    })
    outClick = false;
}

// --- Hide color picker is clicked outside
$(document).click(function (event) {
    if (outClick) {
        var $target = $(event.target);
        if (!$target.closest('#colorPicker').length && $("#colorPicker").is(":visible")) {
            $('#colorPicker').hide();
        }
    }
    outClick = true;
});