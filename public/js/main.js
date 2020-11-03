mapboxgl.accessToken = "pk.eyJ1IjoidGFpbWF6IiwiYSI6ImNrNTlzd2h2dTA3NXgza3J6aHh2cHJlbDkifQ.iY8Kc535hXfTZ4VksOUBWg";

var map = new mapboxgl.Map({
    container: "map",
    maxZoom: 9,
    minZoom: 3,
    zoom: 4,
    center: [-52.71, 47.56],
    maxBounds: [[-179.5, -79.5], [179.5, 79.5]],  // --- png files lat from 80S to 80N.  lon limit for bash file.
    // animate: false,
    // style: 'mapbox://styles/mapbox/dark-v10'
    // style: 'mapbox://styles/mapbox/satellite-v9',
    style: 'mapbox://styles/taimaz/ckg5j52mi2q0y19pe8z3dxly8?fresh=true'
});


map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
// map.addControl(new mapboxgl.ScaleControl());
map.scrollZoom.setWheelZoomRate(1);


map.on("load", () => {
    $('.mapboxgl-ctrl-logo').remove();
    $(".mapboxgl-ctrl-bottom-left").prepend(
        `<div id="txtDepth" data-placeholder="Click anywhere for depth" style="width: 100%;color: azure;text-align-last: center;font-size: large;padding-bottom: 10px;"></div>`
    )

    // using var to work around a WebKit bug
    var canvas = document.getElementById('cnvModel');

    const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const gl = canvas.getContext('webgl', { antialiasing: false });

    wind = window.wind = new WindGL(gl);
    wind.numParticles = 40000;

    function frame() {
        if (wind.windData) {
            wind.draw();
        }
        requestAnimationFrame(frame);
    }
    frame();


    function updateRetina() {
        const ratio = meta['retina resolution'] ? pxRatio : 1;
        canvas.width = canvas.clientWidth * ratio;
        canvas.height = canvas.clientHeight * ratio;
        wind.resize();
    }


    map.on("idle", () => {
        resetField();
        draw();
    });


    map.on('render', () => {
        updateWind('black');
    });


    map.on('mousemove', function (e) {
        var i = Math.round(pngWidth * e.point.x / canvas.width) + Math.round(pngHeight * e.point.y / canvas.height) * pngWidth;
        $("#latTracker").html(num2latlon(e.lngLat.lat, 'lat'));
        $("#lonTracker").html(num2latlon(e.lngLat.lng, 'lon'));

        // if (Math.abs(direction[i]) === 135.0 || Math.abs(direction[i]) === 45.0) {
        // if (Math.abs(speed[i] - 0.016637806616154) < 0.000001) {
        // $("#speedTracker").html("-");
        // $("#directionTracker").html("-");
        // } else {
        $("#speedTracker").html(speed[i].toFixed(3) + " <sup>m</sup>&frasl;<sub>s</sub>");
        // $("#speedTracker").html(speed[i]);
        // $("#directionTracker").html(direction[i].toFixed(1) + " &deg;");
        hand1.showValue(360 - direction[i], 100, am4core.ease.cubicOut); // --- Gause works clockwise
        // }
    });
});


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


function updateWind(name) {
    getJSON('tmp/' + name + '.json', function (windData) {
        const windImage = new Image();
        windData.image = windImage;
        windImage.src = 'tmp/' + name + '.png';
        windImage.onload = function () {
            wind.setWind(windData);
        };
    });
}


function draw() {
    var bnds = map.getBounds();
    latMin = bnds._sw.lat;
    dlat = bnds._ne.lat - latMin;

    var content = {
        time: field.time.format("YYYYMMDD_HH"),
        depth: field.depth,
        model: field.model,
        field: field.field,
        lonMin: bnds._sw.lng,
        lonMax: bnds._ne.lng,
        latMin: bnds._sw.lat,
        latMax: bnds._ne.lat
    };

    $.ajax({
        url: "/prepareImage",
        type: "POST",
        data: content,
        success: function (data, textStatus, jqXHR) {
            for (var i = 0; i < 100; i++) { updateWind(data.timestamp) };
            speed = data.speed;
            direction = data.direction;
            pngWidth = data.width;
            pngHeight = data.height;
            $("#dimmer").css("opacity", "0.0");
            $("#dimmer").css("z-index", -1);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
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


function resetField() {
    $("#dimmer").css("opacity", "0.8");
    $("#dimmer").css("z-index", 1000);
    updateWind('black');
}