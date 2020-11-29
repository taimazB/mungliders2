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
