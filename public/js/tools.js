function zeroPad(num, numZeros) {
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
    var zeroString = Math.pow(10, zeros).toString().substr(1);
    if (num < 0) {
        zeroString = Math.pow(10, zeros - 1).toString().substr(1);
        zeroString = '-' + zeroString;
    }

    return zeroString + n;
}


function lon2x(lon) {
    return R * lon * Math.PI / 180;
}

function lat2y(lat) {
    return (R * Math.log(Math.sin(Math.PI / 4 + lat * Math.PI / 180 / 2) / Math.cos(Math.PI / 4 + lat * Math.PI / 180 / 2)));
}



function num2latlon(num, latlon) {
    var result;
    if (latlon == 'lat') {
        num >= 0 ? result = num.toFixed(3) + " &deg;N" : result = -num.toFixed(3) + " &deg;S";
    } else if (latlon == 'lon') {
        num >= 0 ? result = num.toFixed(3) + " &deg;E" : result = -num.toFixed(3) + " &deg;W";
    }
    return result;
}



function btnsActivate() {
    $(".ui.button").on('click', function () {
        $(this)
            .addClass('active')
            .siblings()
            .removeClass('active')
    })
}


function getJSON(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('get', url, true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(xhr.response);
        } else {
            throw new Error(xhr.statusText);
        }
    };
    xhr.send();
}


function fieldLongName(shortName) {
    switch (shortName) {
        case "SST": return "Sea Surface Temperature"; break;
        case "SWH": return "Sea Wave Height"; break;
        default: return ""; break;
    }
}



///////////////////////////////////////////---------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- COLOR PALETTE -----------------------------------------\\
function colorPaletteRainbow(c) {
    var colors = [[102, 0, 102], [0, 153, 255], [51, 204, 51], [255, 255, 0], [255, 153, 0], [255, 51, 0], [255, 204, 255]];
    var stops = _.range(colors.length).map(d => d / (colors.length - 1));

    if (c < stops[0]) {
        return colors[0];
    } else if (c < stops[stops.length - 1]) {
        for (var i = 1; i < stops.length; i++) {
            if (c <= stops[i]) {
                var w = (c - stops[i - 1]) / (stops[i] - stops[i - 1]);
                return [(1 - w) * colors[i - 1][0] + w * colors[i][0], (1 - w) * colors[i - 1][1] + w * colors[i][1], (1 - w) * colors[i - 1][2] + w * colors[i][2]];
            }
        }
    } else {
        return colors[colors.length - 1];
    }
}


function colorPaletteBlue(c) {
    var colors = [[0, 153, 255], [255, 255, 255]];
    var stops = _.range(colors.length).map(d => d / (colors.length - 1));

    if (c < stops[0]) {
        return colors[0];
    } else if (c < stops[stops.length - 1]) {
        for (var i = 1; i < stops.length; i++) {
            if (c <= stops[i]) {
                var w = (c - stops[i - 1]) / (stops[i] - stops[i - 1]);
                return [(1 - w) * colors[i - 1][0] + w * colors[i][0], (1 - w) * colors[i - 1][1] + w * colors[i][1], (1 - w) * colors[i - 1][2] + w * colors[i][2]];
            }
        }
    } else {
        return colors[colors.length - 1];
    }
}


function adjustColorbar(varMin, varMax, fnPalette) {
    $("#colorbar").css("background-image",
        `linear-gradient(to right, ${_.range(10).map(i => { return "rgb(" + fnPalette(i / 10) + ")" }).join()}`);
    $("#lbColorbar0").html(varMin.toFixed(1));
    $("#lbColorbar25").html((.75 * varMin + .25 * varMax).toFixed(1));
    $("#lbColorbar50").html((.5 * varMin + .5 * varMax).toFixed(1));
    $("#lbColorbar75").html((.25 * varMin + .75 * varMax).toFixed(1));
    $("#lbColorbar100").html(varMax.toFixed(1));
}


///////////////////////////////////////////----------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- DISTANCE -----------------------------------------\\
var mapDistanceLinearOn = function () {
    // GeoJSON object to hold our measurement features
    var geojson = {
        'type': 'FeatureCollection',
        'features': []
    };

    map.addSource('distanceLinear', {
        'type': 'geojson',
        'data': geojson
    });

    // Add styles to the map
    map.addLayer({
        id: 'distanceLinearCircles',
        type: 'circle',
        source: 'distanceLinear',
        paint: {
            'circle-radius': 5,
            'circle-color': '#ccc'
        },
        filter: ['in', '$type', 'Point']
    });
    map.addLayer({
        id: 'distanceLinearLine',
        type: 'line',
        source: 'distanceLinear',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': '#ccc',
            'line-width': 2.5
        },
        filter: ['in', '$type', 'LineString']
    });

    function mapDistanceLinearClick(e) {
        // --- Check if click is on a point
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['distanceLinearCircles']
        });

        // Remove the linestring from the group
        // So we can redraw it based on the points collection
        if (geojson.features.length > 1) geojson.features.pop();

        // --- Remove all popups
        $('.mapboxgl-popup').remove();

        // If a feature was clicked, remove it from the map
        if (features.length) {
            var id = features[0].properties.id;
            geojson.features = geojson.features.filter(feature => {
                return feature.geometry.type == "Point" && feature.properties.id !== id;
            });
        } else {
            var point = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [e.lngLat.lng, e.lngLat.lat]
                },
                'properties': {
                    'id': String(new Date().getTime())
                }
            };

            geojson.features.push(point);
        }

        var points = geojson.features.filter(feature => feature.geometry.type == "Point");
        if (points.length > 1) {
            var totalDistance = 0;
            for (var i = 0; i < points.length - 1; i++) {
                var lineDistance = turf.distance(points[i].geometry.coordinates, points[i + 1].geometry.coordinates, { units: "kilometers" });
                totalDistance += lineDistance;
                var arc = [];

                // Number of steps to use in the arc and animation, more steps means
                // a smoother arc and animation, but too many steps will result in a
                // low frame rate
                var steps = 500;

                // Draw an arc between the `origin` & `destination` of the two points
                for (var j = 0; j < lineDistance; j += lineDistance / steps) {
                    var segment = turf.along(turf.lineString([points[i].geometry.coordinates, points[i + 1].geometry.coordinates]), j, { units: "kilometers" });
                    arc.push(segment.geometry.coordinates);
                }

                // Used to draw a line between points
                var linestring = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': arc
                    }
                };

                geojson.features.push(linestring);


                // --- Add popup to the point
                var popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                    });
                popup.setLngLat(points[i + 1].geometry.coordinates).setHTML(`<p>${lineDistance.toFixed(1)} km</p><p><strong>${totalDistance.toFixed(1)} km</strong></p>`).addTo(map);
            }
        }

        map.getSource('distanceLinear').setData(geojson);
    };


    function mapDistanceLinearMove(e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['distanceLinearCircles']
        });
        
        map.getCanvas().style.cursor = features.length
            ? 'pointer'
            : 'crosshair';
    }


    map.on('click', mapDistanceLinearClick);
    map.on('mousemove', mapDistanceLinearMove);
}



function mapDistanceLinearOff() {
    map.off('click', map._listeners.click.filter(e => e.name == "mapDistanceLinearClick")[0]);
    map.off('mousemove', map._listeners.mousemove.filter(e => e.name == "mapDistanceLinearMove")[0]);

    map.removeLayer('distanceLinearCircles');
    map.removeLayer('distanceLinearLine');
    map.removeSource('distanceLinear');
    map.getCanvas().style.cursor = 'grab';

    // --- Remove all popups
    $('.mapboxgl-popup').remove();
}
