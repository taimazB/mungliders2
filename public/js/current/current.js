function currentInit() {
    // --- Enable dropdowns
    $("#ddTime").removeClass("disabled");
    $("#ddDepth").removeClass("disabled");
    

    imgGlobal.src = `models/${field.model}/${field.field}/jpg/${field.model}_${field.field}_${field.dateTime.format("YYYYMMDD_HH")}_${field.depth.name}.jpg`;
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

        if (isAnimation) {
            var imgCropped = new Image();
            imgCropped.src = cnvTmp.toDataURL();
            animateArrows(imgCropped); console.log('anim')
        }
        else {
            staticArrows(ctxTmp); console.log('static')
        }
    }

    map.on('mousemove', function (e) {
        $("#latTracker").html(num2latlon(e.lngLat.lat, 'lat'));
        $("#lonTracker").html(num2latlon(e.lngLat.lng, 'lon'));

        var rgba = ctxTmp.getImageData(e.point.x, e.point.y, 1, 1).data,
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
}


function animateArrows(img) {
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


function staticArrows(ctx2dData) {
    cnvModel_2d = d3.select('#cnvModel_2d').node();
    var ctx2d = cnvModel_2d.getContext('2d');
    var customBase = document.createElement('custom');
    var custom = d3.select(customBase); // This is your SVG replacement and the parent of all other elements

    var data = [];
    var spacing = 20;
    for (var i = 0; i <= mapWidth; i = i + spacing) {
        for (var j = 0; j <= mapHeight; j = j + spacing) {
            [u, v] = ctx2dData.getImageData(i, j, 1, 1).data;
            u = (u / 255) * (uMax - uMin) + uMin;
            v = -((v / 255) * (vMax - vMin) + vMin);

            data.push({
                x: i,
                y: j,
                u: u,
                v: v,
                speed: Math.sqrt(u ** 2 + v ** 2),
                direction: Math.atan2(v, u)
            })
        }
    }


    function databind() {
        var join = custom.selectAll('custom')
            .data(data);

        allRects = join
            .enter()
            .append('custom')
            .attr('class', 'path')

        join
            .merge(allRects)
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("u", d => d.u)
            .attr("v", d => d.v)
            .attr("speed", d => d.speed)
            .attr("direction", d => d.direction)
            .attr('color', function (d) { return "#" + colorPalette[Math.floor(maxColors * d.speed / 3)]; })

        join
            .exit()
            .remove();
    }


    function draw() {
        // --- Clear the canvas.
        ctx2d.clearRect(0, 0, mapWidth, mapHeight);

        var elements = custom.selectAll('custom.path');
        var fact = 10;
        elements.each(function (d, i) {
            var node = d3.select(this);
            var x = parseFloat(node.attr('x')),
                y = parseFloat(node.attr('y')),
                u = parseFloat(node.attr('u')),
                v = parseFloat(node.attr('v')),
                speed = parseFloat(node.attr('speed')),
                direction = parseFloat(node.attr('direction'));

            ctx2d.beginPath();

            ctx2d.moveTo(x, y);
            ctx2d.lineTo(x + fact * speed * Math.cos(direction + 0.75 * Math.PI), y + fact * speed * Math.sin(direction + 0.75 * Math.PI));
            ctx2d.lineTo(x + fact * u, y + fact * v);
            ctx2d.lineTo(x + fact * speed * Math.cos(direction - 0.75 * Math.PI), y + fact * speed * Math.sin(direction - 0.75 * Math.PI));
            ctx2d.lineTo(x, y);

            ctx2d.fillStyle = node.attr('color');
            ctx2d.fill();
            ctx2d.closePath();
        });
    }

    databind();
    draw();
}