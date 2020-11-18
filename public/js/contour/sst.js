function sstInit() {
    // --- Disable unwanted dropdowns
    $("#ddTime").addClass("disabled");
    $("#ddDepth").addClass("disabled");
    

    var bnds = map.getBounds();
    // bnds = { _ne: { lat: 30, lng: -50 }, _sw: { lat: 20, lng: -40 } }

    imgGlobal.src = `models/${field.model}/${field.field}/jpg/${field.model}_${field.field}_${field.dateTime.format("YYYYMMDD")}.jpg`;
    console.log(imgGlobal.src)
    imgGlobal.onload = () => {
        var top = imgGlobal.naturalHeight * (1 - (lat2y(bnds._ne.lat) + lat2y(80)) / (2 * lat2y(80)));
        var bottom = imgGlobal.naturalHeight * (1 - (lat2y(bnds._sw.lat) + lat2y(80)) / (2 * lat2y(80)));
        var left = imgGlobal.naturalWidth * (bnds._sw.lng + 180) / 360;
        var right = imgGlobal.naturalWidth * (bnds._ne.lng + 180) / 360;
        var imgWidth = right - left;
        var imgHeight = bottom - top;

        // --- Crop image for the visible part of map
        cnvTmp.width = mapWidth;                        // size of new image
        cnvTmp.height = mapHeight;

        // --- Draw part of the first image onto the new canvas
        ctxTmp = cnvTmp.getContext("2d");
        ctxTmp.drawImage(imgGlobal, left, top, imgWidth, imgHeight, 0, 0, cnvTmp.width, cnvTmp.height);
        imageData = ctxTmp.getImageData(0, 0, mapWidth, mapHeight);
        const data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var rgb = grey2color(100 * data[i] / 255);
            data[i] = rgb[0]; // red
            data[i + 1] = rgb[1]; // green
            data[i + 2] = rgb[2]; // blue
        }


        // --- Draw part of the first image onto the new canvas
        cnvSST = document.getElementById("cnvModel_SST");
        ctxSST = cnvSST.getContext("2d");
        ctxSST.putImageData(imageData, 0, 0)
    }


    map.on('mousemove', function (e) {
        $("#latTracker").html(num2latlon(e.lngLat.lat, 'lat'));
        $("#lonTracker").html(num2latlon(e.lngLat.lng, 'lon'));

        $("#speedTracker").html("");
        hand1.showValue(0, 100, am4core.ease.cubicOut); // --- Gauge works clockwise    
    });
}


function sstMove() {
    var bnds = map.getBounds();
    // bnds = { _ne: { lat: 30, lng: -50 }, _sw: { lat: 20, lng: -40 } }

    var top = imgGlobal.naturalHeight * (1 - (lat2y(bnds._ne.lat) + lat2y(80)) / (2 * lat2y(80)));
    var bottom = imgGlobal.naturalHeight * (1 - (lat2y(bnds._sw.lat) + lat2y(80)) / (2 * lat2y(80)));
    var left = imgGlobal.naturalWidth * (bnds._sw.lng + 180) / 360;
    var right = imgGlobal.naturalWidth * (bnds._ne.lng + 180) / 360;
    var imgWidth = right - left;
    var imgHeight = bottom - top;

    // --- Crop image for the visible part of map
    cnvTmp.width = mapWidth;                        // size of new image
    cnvTmp.height = mapHeight;

    // --- Draw part of the first image onto the new canvas
    ctxTmp = cnvTmp.getContext("2d");
    ctxTmp.drawImage(imgGlobal, left, top, imgWidth, imgHeight, 0, 0, cnvTmp.width, cnvTmp.height);
    imageData = ctxTmp.getImageData(0, 0, mapWidth, mapHeight);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var rgb = grey2color(100 * data[i] / 255);
        data[i] = rgb[0]; // red
        data[i + 1] = rgb[1]; // green
        data[i + 2] = rgb[2]; // blue
    }

    // --- Draw part of the first image onto the new canvas
    cnvSST = document.getElementById("cnvModel_SST");
    ctxSST = cnvSST.getContext("2d");
    ctxSST.putImageData(imageData, 0, 0)
}


function grey2color(c) {
    for (var i = 1; i < paletteStops.length; i++) {
        if (c < paletteStops[i]) {
            var w = (c - paletteStops[i - 1]) / (paletteStops[i] - paletteStops[i - 1]);
            return [(1 - w) * palette[i - 1][0] + w * palette[i][0], (1 - w) * palette[i - 1][1] + w * palette[i][1], (1 - w) * palette[i - 1][2] + w * palette[i][2]];
        }
    }
}
