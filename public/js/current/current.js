function currentInit() {
    imgGlobal.src = `models/${field.model}/${field.field}/jpg/${field.model}_${field.field}_${lastModelDateTime.format("YYYYMMDD_HH")}_${field.depth.name}.jpg`;
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
            animateArrows(imgCropped);
        }
        else {
            staticArrows(ctxTmp);
        }
    }
}


function animateArrows(img) {
    wind = window.wind = new WindGL(ctxGL);
    wind.numParticles = 50000;

    var fade = 0.98;
    function frame() {
        if (wind.windData) {
            wind.draw(fade);
        }
        reqAnimID = requestAnimationFrame(frame);
    }

    initLoad ? frame() : null;
    initLoad = false;


    // function updateRetina() {
    //     const ratio = meta['retina resolution'] ? pxRatio : 1;
    //     cnvAnim.width = cnvAnim.clientWidth * ratio;
    //     cnvAnim.height = cnvAnim.clientHeight * ratio;
    //     wind.resize();
    // }


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


function staticArrows(ctxArrowData) {
    var customBase = document.createElement('custom');
    var custom = d3.select(customBase); // This is your SVG replacement and the parent of all other elements

    var data = [];

    // --- Different spacings for different zoom levels
    var spacing;
    switch (map.getZoom()) {
        case 3: spacing = 5; break;
        case 4: spacing = 7; break;
        case 5: spacing = 9; break;
        case 6: spacing = 12; break;
        case 7: spacing = 15; break;
        case 8: spacing = 19; break;
        case 9: spacing = 23; break;
        default: spacing = 10;
    }

    for (var i = 0; i <= mapWidth; i = i + spacing) {
        for (var j = 0; j <= mapHeight; j = j + spacing) {
            [u, v] = ctxArrowData.getImageData(i, j, 1, 1).data;
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
        ctxArrow.clearRect(0, 0, mapWidth, mapHeight);

        var elements = custom.selectAll('custom.path');
        var fact = 3;
        elements.each(function (d, i) {
            var node = d3.select(this);
            var x = parseFloat(node.attr('x')),
                y = parseFloat(node.attr('y')),
                u = parseFloat(node.attr('u')),
                v = parseFloat(node.attr('v')),
                speed = parseFloat(node.attr('speed')),
                direction = parseFloat(node.attr('direction'));

            ctxArrow.beginPath();

            ctxArrow.moveTo(x, y);
            ctxArrow.lineTo(x + fact * speed * Math.cos(direction + 8 / 12 * Math.PI), y + fact * speed * Math.sin(direction + 8 / 12 * Math.PI));
            ctxArrow.lineTo(x + 3 * fact * u, y + 3 * fact * v);
            ctxArrow.lineTo(x + fact * speed * Math.cos(direction - 8 / 12 * Math.PI), y + fact * speed * Math.sin(direction - 8 / 12 * Math.PI));
            ctxArrow.lineTo(x, y);

            ctxArrow.fillStyle = node.attr('color');
            ctxArrow.fill();
            ctxArrow.closePath();
        });
    }

    databind();
    draw();
}
