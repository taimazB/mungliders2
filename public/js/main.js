mapboxgl.accessToken = "pk.eyJ1IjoidGFpbWF6IiwiYSI6ImNrNTlzd2h2dTA3NXgza3J6aHh2cHJlbDkifQ.iY8Kc535hXfTZ4VksOUBWg";

var map = new mapboxgl.Map({
    container: "map",
    maxZoom: 9,
    minZoom: 3,
    zoom: 4,
    center: [-52.71, 47.56],
    maxBounds: [[-179.5, -79.5], [179.5, 79.5]],  // --- jpg files lat from 80S to 80N.  lon limit for bash file.
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
    cnvModel_gl = document.getElementById('cnvModel_gl');

    // const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
    const gl = cnvModel_gl.getContext('webgl', { antialiasing: false });

    wind = window.wind = new WindGL(gl);
    wind.numParticles = 50000;

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
    //     cnvModel_gl.width = cnvModel_gl.clientWidth * ratio;
    //     cnvModel_gl.height = cnvModel_gl.clientHeight * ratio;
    //     wind.resize();
    // }


    map.on("render", () => {
        draw({ init: false });
    });
});





function draw(init) {
    bnds = map.getBounds();
    // bnds = { _ne: { lat: 50, lng: -50 }, _sw: { lat: 40, lng: -40 } }

    switch (field.field) {
        case "UV":
            currentInit();
            break;
        case "SST":
            init.init ? sstInit() : sstMove();
            break;
        default:
            null;
    }
}

// --- Initial load
draw();