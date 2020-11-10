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
map.scrollZoom.setWheelZoomRate(1);


map.on("load", () => {
    $('.mapboxgl-ctrl-logo').remove();
    $(".mapboxgl-ctrl-bottom-left").prepend(
        `<div id="txtDepth" data-placeholder="Click anywhere for depth" style="width: 100%;color: azure;text-align-last: center;font-size: large;padding-bottom: 10px;"></div>`
    )

    // using var to work around a WebKit bug
    cnvModel = document.getElementById('cnvModel');

    const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
    cnvModel.width = cnvModel.clientWidth;
    cnvModel.height = cnvModel.clientHeight;

    const gl = cnvModel.getContext('webgl', { antialiasing: false });

    wind = window.wind = new WindGL(gl);
    wind.numParticles = 75000;

    var fade = 0.925;
    function frame() {
        if (wind.windData) {
            wind.draw(fade);
        }
        requestAnimationFrame(frame);
    }
    frame();


    // function updateRetina() {
    //     const ratio = meta['retina resolution'] ? pxRatio : 1;
    //     cnvModel.width = cnvModel.clientWidth * ratio;
    //     cnvModel.height = cnvModel.clientHeight * ratio;
    //     wind.resize();
    // }


    map.on("render", () => {
        draw();
    });

    map.on('mousemove', function (e) {
        $("#latTracker").html(num2latlon(e.lngLat.lat, 'lat'));
        $("#lonTracker").html(num2latlon(e.lngLat.lng, 'lon'));

        var rgba = ctx.getImageData(e.point.x, e.point.y, 1, 1).data,
            u = 6 * rgba[0] / 255 - 3,
            v = 6 * rgba[1] / 255 - 3;

        // --- Blue channel is used for NaN (0) values.
        if (rgba[2] == 255) {
            u = 0;
            v = 0;
        }

        $("#speedTracker").html(Math.sqrt(u ** 2 + v ** 2).toFixed(3) + " <sup>m</sup>&frasl;<sub>s</sub>");

        var dir = Math.atan2(v, u) * 180 / Math.PI;
        dir = dir < 0 ? dir + 360 : dir;
        hand1.showValue(360 - dir, 100, am4core.ease.cubicOut); // --- Gauge works clockwise
    });
});





function draw() {
    var bnds = map.getBounds();

    imgGlobal.src = `models/${field.model}/${field.field}/jpg/${field.model}_${field.field}_${field.dateTime.format("YYYYMMDD_HH")}_${zeroPad(field.depth, 4)}.jpg`;
    imgGlobal.onload = () => {
        var top = imgGlobal.naturalHeight * (1 - (lat2y(bnds._ne.lat) + lat2y(80)) / (2 * lat2y(80)));
        var bottom = imgGlobal.naturalHeight * (1 - (lat2y(bnds._sw.lat) + lat2y(80)) / (2 * lat2y(80)));
        var left = imgGlobal.naturalWidth * (bnds._sw.lng + 180) / 360;
        var right = imgGlobal.naturalWidth * (bnds._ne.lng + 180) / 360;
        var imgWidth = right - left;
        var imgHeight = bottom - top;

        // --- Crop image for the visible part of map
        cnvTmp.width = cnvModel.clientWidth;                        // size of new image
        cnvTmp.height = cnvModel.clientHeight;

        // --- Draw part of the first image onto the new canvas
        ctx.drawImage(imgGlobal, left, top, imgWidth, imgHeight, 0, 0, cnvTmp.width, cnvTmp.height);

        // create a new image
        var imgCropped = new Image();

        // set the src from the canvas 
        imgCropped.src = cnvTmp.toDataURL();

        updateWind(imgCropped);
    }

    function updateWind(img) {
        getJSON(`models/${field.model}/${field.field}/json/${field.model}_${field.field}.json`, function (windData) {
            windData.image = img;
            wind.setWind(windData);
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
    }
}
