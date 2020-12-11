// --- 1234567898765432123456789 --- GLOBAL VARIABLES ---  9876543212345678987654321 --- \\
var PPfrom, PPto,
    PPselectedModel,
    PPweight;


function initiatePathPlanning() {
    if (_.isUndefined(PPfrom)) {
        PPfrom = map.getCenter();
        PPto = { lng: PPfrom.lng + 1., lat: PPfrom.lat + 1. }
    }

    $("#PPfromLat").html(num2latlon(PPfrom.lat, 'lat'));
    $("#PPfromLon").html(num2latlon(PPfrom.lng, 'lon'));
    $("#PPtoLat").html(num2latlon(PPto.lat, 'lat'));
    $("#PPtoLon").html(num2latlon(PPto.lng, 'lon'));

    try {
        markerFrom.remove();
        markerTo.remove();
    }
    catch(err) { null }

    addMarkerFrom(PPfrom);
    addMarkerTo(PPto);

    updateDistance();

    PPweight = 0.8;
    $("#inputWeight").on("slide", function (slideEvt) {
        PPweight = slideEvt.value;
        $("#weightValue").text(PPweight);
    });
    $("#inputWeight").on("change", function (slideEvt) {
        PPweight = slideEvt.value.newValue;
        $("#weightValue").text(PPweight);
    });
}


function downloadGetLatLon() {
    window.location.href = '/downloadPathPlanning'
}


function submitGetLatLon() {
    // event.stopPropagation();
    // loaderDim.className += " active";

    // addOceanCurrentLayer(selectedModel);

    $('#btnSubmit').addClass('loading');

    var content = {
        id: moment().valueOf(),
        fromLat: PPfrom.lat,
        fromLon: PPfrom.lng,
        toLat: PPto.lat,
        toLon: PPto.lng,
        fModel: PPselectedModel.toUpperCase(),
        hModel: PPselectedModel.toUpperCase(),
        weight: PPweight,
        bathymetry: $("#chkbxPPbathymetry").prop('checked') ? "Y" : "N",
        timeStepping: $("#chkbxPPtimeStepping").prop('checked') ? 8 : 1
    };

    $.ajax({
        url: "/pathPlanning",
        type: "POST",
        data: content,
        success: function (data, textStatus, jqXHR) {
            if (data.status) {
                addPP2Map(data.data);
                $("#btnDownload").removeClass('disabled');
            } else {
                $("#errorText").html("Please change the start and/or end point, and try again.")
                $('#errorModal')
                    .modal('show')
            }
            $('#btnSubmit').removeClass('loading');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}


function addMarkerFrom() {
    markerFrom = new mapboxgl.Marker({
        draggable: true,
        color: "#00cc99"
    })
        .setLngLat(PPfrom)
        .addTo(map);

    markerFrom.on("drag", function () {
        var latLon = markerFrom.getLngLat();
        $("#PPfromLon").html(num2latlon(latLon.lng, 'lon'));
        $("#PPfromLat").html(num2latlon(latLon.lat, 'lat'));
        PPfrom = { lng: latLon.lng, lat: latLon.lat };

        updateDistance();
    });
}


function addMarkerTo() {
    markerTo = new mapboxgl.Marker({
        draggable: true,
        color: "#cc6699"
    })
        .setLngLat(PPto)
        .addTo(map);

    markerTo.on("drag", function () {
        var latLon = markerTo.getLngLat();
        $("#PPtoLon").html(num2latlon(latLon.lng, 'lon'));
        $("#PPtoLat").html(num2latlon(latLon.lat, 'lat'));
        PPto = { lng: latLon.lng, lat: latLon.lat };

        updateDistance();
    });
}

function moveMarkerFrom() {
    PPfrom = { lng: inputFromLon.value, lat: inputFromLat.value };
    markerFrom.setLngLat(PPfrom);

    updateDistance();
}


function moveMarkerTo() {
    PPto = { lng: inputToLon.value, lat: inputToLat.value };
    markerTo.setLngLat(PPto);

    updateDistance();
}


function updateDistance() {
    distance = turf.distance(
        turf.point([PPfrom.lng, PPfrom.lat]),
        turf.point([PPto.lng, PPto.lat]),
        { units: 'kilometers' }
    )

    var element = document.getElementById("divDistance")
    element.innerHTML = distance.toFixed(2) + " km"

    if (distance <= 300) {
        element.style['color'] = 'green'
        if (PPselectedModel) {
            $("#btnSubmit").removeClass('disabled');
        }
    } else {
        element.style['color'] = 'red'
        $("#btnSubmit").addClass('disabled');
    }
}


function selectModel(model) {
    PPselectedModel = model;
    switch (PPselectedModel) {
        case "hycom":
            $("#btnHYCOM").addClass('active');
            $("#btnRIOPS").removeClass('active');
            $("#chkbxRIOPS").bootstrapToggle('off');
            $("#chkbxHYCOM").bootstrapToggle('on');
            break;
        case "riops":
            $("#btnRIOPS").addClass('active');
            $("#btnHYCOM").removeClass('active');
            $("#chkbxHYCOM").bootstrapToggle('off');
            $("#chkbxRIOPS").bootstrapToggle('on');
            break;
        default:
            null
    }
    if (distance < 10000) {
        $("#btnSubmit").removeClass('disabled');
    }
    // addOceanCurrentLayer(selectModel);
}


/////////////////////////////////////----------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// --- 1234567898765432123456789 --- ADD TO MAP ---  9876543212345678987654321 --- \\
function addPP2Map(data) {
    try {
        map.removeLayer('PPline');
        map.removeLayer('PPcircles');
        map.removeLayer('PPdistances');
        map.removeSource('PPline');
        map.removeSource('PPcircles');
        map.removeSource('PPdistances');
    } catch(err) { null; }

    var rows = [];
    data.forEach(function (row) {
        if (row) {
            row = row.split(",");
            rows.push([parseFloat(row[1]), parseFloat(row[0])])
        }
    })


    // --- Zoom to the path
    var lonMin = d3.min(rows.map(d => d[0])),
        lonMax = d3.max(rows.map(d => d[0])),
        latMin = d3.min(rows.map(d => d[1])),
        latMax = d3.max(rows.map(d => d[1]));
    var lonDiff = lonMax - lonMin,
        latDiff = latMax - latMin;
    map.fitBounds([[lonMin - .2 * lonDiff, latMin - .2 * latDiff], [lonMax + .2 * lonDiff, latMax + .2 * latDiff]]);


    // ------------------------------------------------------------------------------------
    // --- Path points
    var gj = [];
    for (var i = 0; i < rows.length; i++) {
        gj.push({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': rows[i]
            }
        });
    }

    map.addLayer({
        'id': 'PPcircles',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': gj
            }
        },
        'paint': {
            'circle-color': 'white',
            'circle-opacity': 1.
        }
    });


    // ------------------------------------------------------------------------------------
    // --- Path lines
    gj = [];
    for (var i = 0; i < rows.length - 1; i++) {
        gj.push({
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': [rows[i], rows[i + 1]]
            }
        });
    }

    map.addLayer({
        'id': 'PPline',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': gj
            }
        },
        'paint': {
            'line-color': 'white'
        }
    });


    // ------------------------------------------------------------------------------------
    // --- Path texts
    gj = [];
    for (var i = 0; i < rows.length - 1; i++) {
        var angle = -(Math.atan((rows[i][1] - rows[i + 1][1]) / (rows[i][0] - rows[i + 1][0]))) * 180 / Math.PI,
            center = [0.5 * (rows[i][0] + rows[i + 1][0]), 0.5 * (rows[i][1] + rows[i + 1][1])];

        gj.push({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': center
            },
            'properties': {
                'distance': turf.distance(rows[i], rows[i + 1]).toFixed(1),
                'angle': angle,
                'offset': [1 * Math.cos(Math.atan((rows[i][0] - rows[i + 1][0]) / (rows[i][1] - rows[i + 1][1]))),
                1 * Math.sin(Math.atan((rows[i][0] - rows[i + 1][0]) / (rows[i][1] - rows[i + 1][1])))]
            }
        });
    }

    map.addLayer({
        'id': 'PPdistances',
        'type': 'symbol',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': gj
            }
        },
        'layout': {
            'text-field': ["concat", ["to-string", ["get", "distance"]], " km"],
            'text-font': ["Asap Bold", "Arial Unicode MS Regular"],
            'text-rotate': ["get", "angle"],
            'text-offset': ["get", "offset"],
            'text-size': 18,
            'text-justify': 'auto'
        },
        'paint': {
            'text-color': "rgb(180,180,180)",
            // 'text-halo-color': "rgb(160,20,20)"
        }
    });
}


// function PPdepthProfile() {
//     // $('#PPdepthProfileModal')
//     //     .modal('show');

//     $.ajax({
//         url: "/PPdepthProfile",
//         type: "POST",
//         // data: content,
//         success: function (data, textStatus, jqXHR) {
//             // console.log(id)
//             // document.getElementById("PPdepthProfileDimmer").className = document.getElementById("PPdepthProfileDimmer").className.replace(/\b active\b/g, "");
//             new depthProfileOn(data);
//         },
//         error: function (jqXHR, textStatus, errorThrown) {
//             console.log(errorThrown);
//         }
//     });


//     var depthProfileOn = function () {
//         $("#depthProfile").css('visibility', 'visible');
//         map.getCanvas().style.cursor = 'crosshair';

//         // GeoJSON object to hold our measurement features
//         geojson = {
//             'type': 'FeatureCollection',
//             'features': []
//         };

//         // --- To store the line feature
//         var lines = {
//             'type': 'Feature',
//             'geometry': {
//                 'type': 'LineString',
//                 'coordinates': []
//             },
//             'properties': {
//                 'id': ''
//             }
//         };
//         geojson.features.push(lines);


//         map.addSource('points', {
//             'type': 'geojson',
//             'data': geojson
//         });

//         map.addLayer({
//             id: 'circles',
//             type: 'circle',
//             source: 'points',
//             paint: {
//                 'circle-radius': 5,
//                 'circle-color': '#ccc'
//             },
//             filter: ["in", "$type", "Point"]
//         });

//         map.addLayer({
//             id: 'lines',
//             type: 'line',
//             source: 'points',
//             layout: {
//                 'line-cap': 'round',
//                 'line-join': 'round'
//             },
//             paint: {
//                 'line-color': '#ccc',
//                 'line-width': 2.5,
//                 'line-dasharray': [2, 1]
//             },
//             filter: ["in", "$type", "LineString"]
//         });


//         // --- Point for tracking
//         map.addSource('pointTrack', {
//             'type': 'geojson',
//             'data': {
//                 'type': 'FeatureCollection',
//                 'features': []
//             }
//         });

//         map.addLayer({
//             id: 'circleTrack',
//             type: 'circle',
//             source: 'pointTrack',
//             paint: {
//                 'circle-radius': 5,
//                 'circle-color': 'pink'
//             },
//             filter: ["in", "$type", "Point"]
//         });


//         function addRemovePoints(e) {
//             var chkClickedLayers = map.queryRenderedFeatures(e.point, {
//                 layers: ['circles']
//             });

//             // --- Clicked on map -> add a point
//             if (chkClickedLayers.length == 0) {
//                 var point = {
//                     'type': 'Feature',
//                     'geometry': {
//                         'type': 'Point',
//                         'coordinates': [e.lngLat.lng, e.lngLat.lat]
//                     },
//                     'properties': {
//                         'id': String(new Date().getTime())
//                     }
//                 };

//                 geojson.features.push(point);

//                 // --- Clicked on "points" -> remove the point
//             } else if (chkClickedLayers[0].layer.id == "circles") {
//                 geojson.features.forEach(feature => {
//                     if (feature.properties.id == chkClickedLayers[0].properties.id) {
//                         geojson.features = geojson.features.filter(function (point) {
//                             return point.properties.id !== feature.properties.id;
//                         });
//                     }
//                 });
//             }

//             // --- First feature is always the LineString, so need at least 3 features in the geojson
//             if (geojson.features.length <= 2) {
//                 lines.geometry.coordinates = [];
//             }
//             else if (geojson.features.length > 2) {
//                 // --- Calculate line path considering the Earth's curvature
//                 var arc = [];
//                 for (var i = 1; i < geojson.features.length - 1; i++) {
//                     var startPoint = geojson.features[i].geometry.coordinates,
//                         endPoint = geojson.features[i + 1].geometry.coordinates;
//                     var lineDistance = turf.distance(startPoint, endPoint);
//                     // --- Walk 1 km steps
//                     for (var j = 0; j < lineDistance; j += 1) {
//                         var segment = turf.along(turf.lineString([startPoint, endPoint]), j);
//                         arc.push(segment.geometry.coordinates);
//                     }
//                 }
//                 lines.geometry.coordinates = arc;
//                 geojson.features[0] = lines;
//             }

//             map.getSource('points').setData(geojson);
//         }


//         function modifyPoint(e) {
//             // Prevent the default map drag behavior.
//             e.preventDefault();
//             map.getCanvas().style.cursor = 'grab';

//             var chkClickedLayers = map.queryRenderedFeatures(e.point, {
//                 layers: ['circles']
//             });

//             // --- Find index of the selected point
//             var index;
//             geojson.features.forEach(function (element, i) {
//                 if (element.properties.id == chkClickedLayers[0].properties.id) {
//                     index = i;
//                 }
//             });


//             function movePoint(e) {
//                 map.getCanvas().style.cursor = 'grabbing';
//                 geojson.features[index].geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
//                 if (geojson.features.length <= 2) {
//                     lines.geometry.coordinates = [];
//                 }
//                 else if (geojson.features.length > 2) {
//                     // --- Calculate line path considering the Earth's curvature
//                     var arc = [];
//                     for (var i = 1; i < geojson.features.length - 1; i++) {
//                         var startPoint = geojson.features[i].geometry.coordinates,
//                             endPoint = geojson.features[i + 1].geometry.coordinates;
//                         var lineDistance = turf.distance(startPoint, endPoint);
//                         // --- Walk 1 km steps
//                         for (var j = 0; j < lineDistance; j += 1) {
//                             var segment = turf.along(turf.lineString([startPoint, endPoint]), j);
//                             arc.push(segment.geometry.coordinates);
//                         }
//                     }
//                     lines.geometry.coordinates = arc;
//                     geojson.features[0] = lines;
//                 }

//                 map.getSource('points').setData(geojson);
//             }


//             map.on('mousemove', movePoint);
//             map.once('mouseup', function () {
//                 map.off('mousemove', movePoint);
//                 map.getCanvas().style.cursor = '';
//             });
//         }


//         map.on('click', addRemovePoints);
//         map.on('mouseenter', 'circles', function () { map.getCanvas().style.cursor = 'move' })
//         map.on('mouseleave', 'circles', function () { map.getCanvas().style.cursor = 'crosshair' })
//         map.on('mousedown', 'circles', modifyPoint);


//         ////////////////////////////////////-------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//         // --- 1234567898765432123456789 --- CREATE EMPTY DEPTH PLOT ---  9876543212345678987654321 --- \\
//         // d3.select("#depthProfilePlot").selectAll("*").remove();
//         var width = $("#depthProfilePlot").width(),
//             height = $("#depthProfilePlot").height(),
//             padding = 25;

//         var mainsvg = d3.select("#depthProfilePlot").append('svg')
//         mainsvg
//             .attr('width', width)
//             .attr('height', height)


//         // --- g for plotting
//         mainsvg.append("g")
//             .attr('class', 'plot')
//             .append('path')


//         // --- g for mouse tracking line
//         var mouseTrackG = mainsvg.append("g")
//             .attr('class', 'mouseTrack')
//         mouseTrackG
//             .append('rect')
//         mouseTrackG
//             .append('path')
//             .attr('class', 'vertical')
//         mouseTrackG
//             .append('path')
//             .attr('class', 'horizontal')

//         // --- x axis
//         mainsvg.append("g")
//             .attr("class", "x axis")
//             .attr("transform", "translate(0," + padding + ")")
//             .attr("color", "#808080");

//         // --- y axis
//         mainsvg.append("g")
//             .attr("class", "y axis")
//             .attr("transform", `translate(${width - 3 * padding}, 0)`)
//             .attr("color", "#808080");

//         // --- y axis label
//         mainsvg.append("text")
//             .attr("text-anchor", "middle")
//             .attr("x", -height / 2)
//             .attr("y", width - .5 * padding)
//             .attr("transform", "rotate(-90)")
//             .attr("fill", "#808080")
//             .attr("font-weight", "bold")
//             .attr("font-size", "1rem")
//             .text("Depth (m)")
//     }


//     function depthProfilePlot() {
//         $("#btnDepthProfile").addClass('loading disabled');

//         // --- features[0] contains all the coordinates for the LineString
//         var points = geojson.features[0].geometry.coordinates;

//         $.ajax({
//             url: "/depthProfile",
//             type: "POST",
//             data: { points },
//             success: function (id, textStatus, jqXHR) {
//                 $("#btnDepthProfile").removeClass('loading disabled');
//                 plotDepth(id.id);
//             },
//             error: function (jqXHR, textStatus, errorThrown) {
//                 console.log(errorThrown);
//             }
//         });

//         function plotDepth(id) {
//             ////////////////////////////////////-------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//             // --- 1234567898765432123456789 --- UPDATE DEPTH PLOT ---  9876543212345678987654321 --- \\
//             var width = $("#depthProfilePlot").width(),
//                 height = $("#depthProfilePlot").height(),
//                 padding = 25;

//             var mainsvg = d3.select("#depthProfilePlot").selectAll('svg');

//             d3.csv(`depthProfiles/depthProfile_${id}.csv`).then((data) => {
//                 // d3.csv(`depthProfiles/depthProfile_1594230868.csv`).then((data) => {
//                 var min = d3.min(data.map((d) => { return parseInt(d['depth']); })),
//                     max = d3.max(data.map((d) => { return parseInt(d['depth']); }));

//                 // --- Update x-axis
//                 xScale = d3.scaleLinear()
//                     .domain([0, data.length])
//                     .range([padding, width - 3 * padding])

//                 xScaleReverse = d3.scaleLinear()
//                     .domain([padding, width - 3 * padding])
//                     .range([0, data.length])
//                 // .nice();

//                 xAxis = d3.axisTop().scale(xScale).ticks(0);

//                 // --- Update y-axis
//                 yScale = d3.scaleLinear()
//                     .domain([max, min])
//                     .range([padding, height - padding])
//                 // .nice();

//                 yAxis = d3.axisRight().scale(yScale).ticks(5);



//                 mainsvg.selectAll("g.x.axis")
//                     .transition()
//                     .duration(100)
//                     .attr("transform", "translate(0," + yScale(0) + ")")
//                     .call(xAxis);
//                 mainsvg.selectAll("g.y.axis")
//                     .transition()
//                     .duration(100)
//                     .call(yAxis);


//                 var lineFunction = d3.line()
//                     .x(function (d, i) { return xScale(i); })
//                     .y(function (d) { return yScale(d['depth']); })

//                 mainsvg.selectAll('g.plot').selectAll('path')
//                     .transition()
//                     .attr('d', lineFunction(data))
//                     .attr('stroke', 'black')
//                     .attr('stroke-width', 2)
//                     .attr('fill', 'none')

//                 mainsvg.select('g.mouseTrack').select('rect')
//                     .attr("x", xScale(0))
//                     .attr("y", yScale(max))
//                     .attr("width", xScale(data.length) - xScale(0))
//                     .attr("height", yScale(min) - yScale(max))
//                     .attr('opacity', 0)
//                     .on("mousemove", mouseTrack)


//                 // --- Track mouse
//                 function mouseTrack() {
//                     var x = d3.mouse(this)[0];
//                     var depth = data[parseInt(xScaleReverse(x))]['depth'],
//                         lat = data[parseInt(xScaleReverse(x))]['lat'],
//                         lon = data[parseInt(xScaleReverse(x))]['lon'];

//                     mainsvg.select('g.mouseTrack').select('path.vertical')
//                         .attr('d', d3.line()([[x, padding], [x, height - padding]]))
//                         .attr('stroke', 'grey')
//                         .attr('stroke-width', 1)
//                         .attr('fill', 'none')

//                     mainsvg.select('g.mouseTrack').select('path.horizontal')
//                         .attr('d', d3.line()([[padding, yScale(depth)], [width - 3 * padding, yScale(depth)]]))
//                         .attr('stroke', 'grey')
//                         .attr('stroke-width', 1)
//                         .attr('fill', 'none')


//                     // --- Track on map
//                     var pointTrack = {
//                         'type': 'FeatureCollection',
//                         'features': [{
//                             'type': 'Feature',
//                             'geometry': {
//                                 'type': 'Point',
//                                 'coordinates': [lon, lat]
//                             }
//                         }]
//                     };
//                     map.getSource('pointTrack').setData(pointTrack);
//                 }
//             });
//         }
//     };


//     function depthProfileReset() {
//         var mainsvg = d3.select("#depthProfilePlot").selectAll('svg');
//         mainsvg.select('g.plot').select('path').attr('d', '');
//         mainsvg.select('g.mouseTrack').select('path.vertical').attr('d', null);
//         mainsvg.select('g.mouseTrack').select('path.horizontal').attr('d', null);
//         mainsvg.select('g.mouseTrack').select('rect').on("mousemove", null);

//         geojson = {
//             'type': 'FeatureCollection',
//             'features': []
//         };
//         var lines = {
//             'type': 'Feature',
//             'geometry': {
//                 'type': 'LineString',
//                 'coordinates': []
//             },
//             'properties': {
//                 'id': ''
//             }
//         };
//         geojson.features.push(lines);
//         map.getSource('points').setData(geojson);
//         map.getSource('pointTrack').setData({
//             'type': 'FeatureCollection',
//             'features': []
//         });
//     }


//     var depthProfileOff = function () {
//         $("#depthProfile").css('visibility', 'hidden');
//         map.getCanvas().style.cursor = '';

//         map.removeLayer('circles');
//         map.removeLayer('lines');
//         map.removeLayer('circleTrack');
//         map.removeSource('points');
//         map.removeSource('pointTrack');

//         map.off('click');
//         d3.select("#depthProfilePlot").select('svg').remove();
//     }
// }



// function PP3D() {
//     $("#PP3Diframe").prop('src', '');
//     $("#PP3DmodalDimmer").addClass('active');
//     $('#PP3Dmodal')
//         .modal('show')

//     $.ajax({
//         url: "/PP3D",
//         type: "POST",
//         success: function (id, textStatus, jqXHR) {
//             // document.getElementById("PP3DmodalDimmer").className = document.getElementById("PP3DmodalDimmer").className.replace(/\b active\b/g, "");
//             $("#PP3DmodalDimmer").removeClass('active');
//             $("#PP3Diframe").prop('src', `3D/${id}.html`);
//         },
//         error: function (jqXHR, textStatus, errorThrown) {
//             console.log(errorThrown);
//         }
//     });
// }
