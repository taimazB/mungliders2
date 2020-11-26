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