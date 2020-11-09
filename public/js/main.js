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
    var cnvModel = document.getElementById('cnvModel');

    const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
    cnvModel.width = cnvModel.clientWidth;
    cnvModel.height = cnvModel.clientHeight;
    // console.log(cnvModel.width, cnvModel.height)

    const gl = cnvModel.getContext('webgl', { antialiasing: false });

    wind = window.wind = new WindGL(gl);
    wind.numParticles = 40000;

    function frame() {
        if (wind.windData) {
            wind.draw();
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


    // map.on("idle", () => {
    map.on("render", () => {
        // resetField();
        // console.log('idle')
        draw();
    });


    // map.on('render', () => {
    //     updateWind('black');
    // });


    map.on('mousemove', function (e) {
        var i = Math.round(pngWidth * e.point.x / cnvModel.width) + Math.round(pngHeight * e.point.y / cnvModel.height) * pngWidth;
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





    // function updateWind(name) {
    //     var width = 10, height = 8;
    //     var data = new Uint8Array(width * height * 4);
    //     for (var i = 0; i < width * height; i++) {
    //         data[4*i] = parseInt(255 * Math.random());
    //         data[4*i + 1] = parseInt(255 * Math.random());
    //         data[4*i + 2] = 0
    //         data[4*i + 3] = 255;
    //     }

    //     // getJSON('tmp/' + name + '.json', function (windData) {
    //     getJSON('tmp/tmp.json', function (windData) {
    //         // const windImage = new Image();
    //         // windData.image = windImage;
    //         windData.data = data;
    //         // windImage.src = 'models/RIOPS/UV/png/RIOPS_UV_20201105_21_0000.png'
    //         // windImage.onload = function () {
    //         wind.setWind(windData);
    //         // };
    //     });
    // }



});





function draw() {
    var bnds = map.getBounds();

    // var windImage = new Image();
    // windImage.src = 
    // windImage.src = "models/RIOPS/UV/png/RIOPS_UV_20201105_21_0000.png";
    imgGlobal.src = `models/${field.model}/${field.field}/jpg/${field.model}_${field.field}_${field.time.format("YYYYMMDD_HH")}_${zeroPad(field.depth, 4)}.jpg`;
    // console.log(imgGlobal)
    imgGlobal.onload = () => {
        // windImage.onload = () => {
        // console.log(imgGlobal.src)
        var top = imgGlobal.naturalHeight * (1 - (lat2y(bnds._ne.lat) + lat2y(80)) / (2 * lat2y(80)));
        var bottom = imgGlobal.naturalHeight * (1 - (lat2y(bnds._sw.lat) + lat2y(80)) / (2 * lat2y(80)));
        var left = imgGlobal.naturalWidth * (bnds._sw.lng + 180) / 360;
        var right = imgGlobal.naturalWidth * (bnds._ne.lng + 180) / 360;
        var imgWidth = right - left;
        var imgHeight = bottom - top;
        // console.log(top, bottom, left, right, imgWidth, imgHeight);

        // --- Crop image for the visible part of map
        var cnvTmp = document.createElement("canvas");
        cnvTmp.width = imgWidth;                        // size of new image
        cnvTmp.height = imgHeight;
        var ctx = cnvTmp.getContext("2d");              // get the context

        // --- Draw part of the first image onto the new canvas
        // ctx.drawImage(windImage, top, left, imgWidth, imgHeight);
        ctx.drawImage(imgGlobal, left, top, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);

        // create a new image    
        var imgCropped = new Image();

        // set the src from the canvas 
        imgCropped.src = cnvTmp.toDataURL();
        // console.log(imgCropped.src);

        updateWind(imgCropped);
    }

    function updateWind(img) {
        // console.log(data)
        // var width = 40, height = 30;

        // getJSON('tmp/' + name + '.json', function (windData) {
        getJSON(`models/${field.model}/${field.field}/json/${field.model}_${field.field}.json`, function (windData) {
            // windData.image = windImage;
            // windData.data = data;
            // windData.width = windData.width;
            // windData.height = windData.height;
            // windData.uMax = 3;
            // windData.uMin = -3;
            // windData.vMax = 3;
            // windData.vMin = -3;

            windData.image = img;
            // console.log(imgNew.src)
            // windImage.style = "position: absolute; clip: rect(0, 100px, 200px, 0);";
            // console.log(windImage)
            // windImage.onload = function () {
            // imgNew.onload = function () {
            wind.setWind(windData);
            // };
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


    // dlat = bnds._ne.lat - latMin;

    // var content = {
    //     time: field.time.format("YYYYMMDD_HH"),
    //     depth: field.depth,
    //     model: field.model,
    //     field: field.field,
    //     // lonMin: bnds._sw.lng,
    //     // lonMax: bnds._ne.lng,
    //     // latMin: bnds._sw.lat,
    //     // latMax: bnds._ne.lat
    // };

    // console.log('1')
    // updateWind(null);
    // var img = new Image();
    // img.src = "models/RIOPS/UV/png/RIOPS_UV_20201105_21_0000.png";
    // img.onload = () => {
    //     console.log(img);
    // var imgdd = UPNG.decode(img);        // put ArrayBuffer of the PNG file into UPNG.decode
    // console.log(imgdd)
    // var rgba = UPNG.toRGBA8(img)[0];
    // console.log(rgba)
    // }
    // $.ajax({
    //     url: "/prepareImage",
    //     type: "POST",
    //     data: content,
    //     success: function (data, textStatus, jqXHR) {
    //         console.log('2')
    //         // for (var i = 0; i < 100; i++) { updateWind(data.timestamp) };
    //         console.log(data);
    //         updateWind(new Uint8Array(data.data.data));
    //         // updateWind(new Uint8Array(data))
    //         // speed = data.speed;
    //         // direction = data.direction;
    //         // pngWidth = data.width;
    //         // pngHeight = data.height;
    //         $("#dimmer").css("opacity", "0.0");
    //         $("#dimmer").css("z-index", -1);
    //         console.log('3')
    //     },
    //     error: function (jqXHR, textStatus, errorThrown) {
    //         console.log(errorThrown);
    //     }
    // });
}

    // draw()





// function resetField() {
//     $("#dimmer").css("opacity", "0.8");
//     $("#dimmer").css("z-index", 1000);
//     updateWind('black');
// }


// draw();
// setInterval(()=>updateWind(null),1000);
// updateWind(null);


