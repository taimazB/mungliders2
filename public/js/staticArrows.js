function staticArrows(ctx2dData) {
    console.log(ctx2dData)
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