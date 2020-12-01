function bathymetryInit() {
    $("#cnvBathymetry").css('display', 'block');

    // bnds = { _ne: { lat: 30, lng: -50 }, _sw: { lat: 20, lng: -40 } }

    imgBathymetry.src = `topo/bathymetry.jpg`;
    imgBathymetry.onload = () => {
        var top = imgBathymetry.naturalHeight * (1 - (lat2y(bnds._ne.lat) + lat2y(80)) / (2 * lat2y(80)));
        var bottom = imgBathymetry.naturalHeight * (1 - (lat2y(bnds._sw.lat) + lat2y(80)) / (2 * lat2y(80)));
        var left = imgBathymetry.naturalWidth * (bnds._sw.lng + 180) / 360;
        var right = imgBathymetry.naturalWidth * (bnds._ne.lng + 180) / 360;
        var imgWidth = right - left;
        var imgHeight = bottom - top;
        

        // --- Crop image for the visible part of map
        cnvBathymetry.width = mapWidth;                        // size of new image
        cnvBathymetry.height = mapHeight;

        // --- Draw part of the first image onto the new canvas
        ctxBathymetry.drawImage(imgBathymetry, left, top, imgWidth, imgHeight, 0, 0, cnvBathymetry.width, cnvBathymetry.height);
        imageData = ctxBathymetry.getImageData(0, 0, mapWidth, mapHeight);
        const data = imageData.data;
        
        // adjustColorbar(varMin,varMax,varPalette);

        for (var i = 0; i < data.length; i += 4) {
            // var rgb = colorPalette((varMaxOrg - varMinOrg) / (varMax - varMin) * data[i] / 255.-);
            var rgb = colorPaletteBathymetry((data[i] / 255. - (bathymetryMin - bathymetryMinOrg) / (bathymetryMaxOrg - bathymetryMinOrg)) * (bathymetryMaxOrg - bathymetryMinOrg) / (bathymetryMax - bathymetryMin));
            data[i] = rgb[0]; // red
            data[i + 1] = rgb[1]; // green
            data[i + 2] = rgb[2]; // blue
        }


        // --- Draw part of the first image onto the new canvas
        ctxBathymetry.putImageData(imageData, 0, 0)
    }
}

var bathymetryMinOrg = -10000;
var bathymetryMin = bathymetryMinOrg;
var bathymetryMaxOrg = 0;
var bathymetryMax = bathymetryMaxOrg;

function bathymetryMove() {
    // bnds = { _ne: { lat: 30, lng: -50 }, _sw: { lat: 20, lng: -40 } }

    var top = imgBathymetry.naturalHeight * (1 - (lat2y(bnds._ne.lat) + lat2y(80)) / (2 * lat2y(80)));
    var bottom = imgBathymetry.naturalHeight * (1 - (lat2y(bnds._sw.lat) + lat2y(80)) / (2 * lat2y(80)));
    var left = imgBathymetry.naturalWidth * (bnds._sw.lng + 180) / 360;
    var right = imgBathymetry.naturalWidth * (bnds._ne.lng + 180) / 360;
    var imgWidth = right - left;
    var imgHeight = bottom - top;

    // --- Crop image for the visible part of map
    cnvBathymetry.width = mapWidth;                        // size of new image
    cnvBathymetry.height = mapHeight;

    // --- Draw part of the first image onto the new canvas
    ctxBathymetry.drawImage(imgBathymetry, left, top, imgWidth, imgHeight, 0, 0, cnvBathymetry.width, cnvBathymetry.height);
    imageData = ctxBathymetry.getImageData(0, 0, mapWidth, mapHeight);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        var rgb = colorPaletteBathymetry((data[i] / 255. - (bathymetryMin - bathymetryMinOrg) / (bathymetryMaxOrg - bathymetryMinOrg)) * (bathymetryMaxOrg - bathymetryMinOrg) / (bathymetryMax - bathymetryMin));
        data[i] = rgb[0]; // red
        data[i + 1] = rgb[1]; // green
        data[i + 2] = rgb[2]; // blue
    }

    // --- Draw part of the first image onto the new canvas
    ctxBathymetry.putImageData(imageData, 0, 0)
}
