function contourfInit() {
    // --- Get min & max values ; set color palette
    switch (field.field) {
        case "SST":
            varMin = sstMin; varMax = sstMax;
            varMinOrg = sstMinOrg; varMaxOrg = sstMaxOrg;
            varPalette = colorPaletteRainbow;
            break;
        case "SWH":
            varMin = swhMin; varMax = swhMax;
            varMinOrg = swhMinOrg; varMaxOrg = swhMaxOrg;
            varPalette = colorPaletteRainbow;
            break;
        case "Seaice":
            varMin = seaiceMin; varMax = seaiceMax;
            varMinOrg = seaiceMinOrg; varMaxOrg = seaiceMaxOrg;
            varPalette = colorPaletteBlue;
            break;
        default:
            null;
    }

    $("#cnvContourf").css('display', 'block');

    // bnds = { _ne: { lat: 30, lng: -50 }, _sw: { lat: 20, lng: -40 } }

    imgGlobal.src = `models/${field.model}/${field.field}/jpg/${field.model}_${field.field}_${lastModelDateTime.format("YYYYMMDD_HH")}.jpg`;
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
        
        adjustColorbar(varMin,varMax,varPalette);

        for (var i = 0; i < data.length; i += 4) {
            var rgb = varPalette((data[i] / 255. - (varMin - varMinOrg) / (varMaxOrg - varMinOrg)) * (varMaxOrg - varMinOrg) / (varMax - varMin));
            data[i] = rgb[0]; // red
            data[i + 1] = rgb[1]; // green
            data[i + 2] = rgb[2]; // blue
        }


        // --- Draw part of the first image onto the new canvas
        ctxContourf.putImageData(imageData, 0, 0)
    }
}


function contourfMove() {
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
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        var rgb = varPalette((data[i] / 255. - (varMin - varMinOrg) / (varMaxOrg - varMinOrg)) * (varMaxOrg - varMinOrg) / (varMax - varMin));
        data[i] = rgb[0]; // red
        data[i + 1] = rgb[1]; // green
        data[i + 2] = rgb[2]; // blue
    }

    // --- Draw part of the first image onto the new canvas
    ctxContourf.putImageData(imageData, 0, 0)
}
