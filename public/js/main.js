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

map.dragRotate.disable();
map.touchZoomRotate.disable();
// map.touchPitch.disable();

map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
map.scrollZoom.setWheelZoomRate(1);


map.on("load", () => {
    $('.mapboxgl-ctrl-logo').remove();
    $(".mapboxgl-ctrl-bottom-left").prepend(
        `<div id="txtDepth" data-placeholder="Click anywhere for depth" style="width: 100%;color: azure;text-align-last: center;font-size: large;padding-bottom: 10px;"></div>`
    )

    map
        .on("move", clean)
        .on("moveend", draw)

    // --- Initial load
    bathymetryInit();
    draw({ init: false });

    map.on('mousemove', showLatLon);
    $("#btnMouseInfo").click();
});


function draw(init) {
    init == null ? init = { init: false } : init = init;
    bnds = map.getBounds();
    // bnds = { _ne: { lat: 50, lng: -50 }, _sw: { lat: 40, lng: -40 } }

    cancelAnimationFrame(reqAnimID);
    switch (field.field) {
        case "Currents":
            currentInit();
            break;
        case "SST":
        case "SWH":
        case "Seaice":
            init.init ? contourfInit() : contourfMove();
            break;
        default:
            null;
    }

    bathymetryMove();
}


function clean() {
    ctxGL.clear(ctxGL.DEPTH_BUFFER_BIT | ctxGL.COLOR_BUFFER_BIT | ctxGL.STENCIL_BUFFER_BIT)
    ctxArrow.clearRect(0, 0, mapWidth, mapHeight);
    ctxContourf.clearRect(0, 0, mapWidth, mapHeight);
    ctxBathymetry.clearRect(0, 0, mapWidth, mapHeight);
}



function showLatLon(e) {
    $("#latTracker").html(num2latlon(e.lngLat.lat, 'lat'));
    $("#lonTracker").html(num2latlon(e.lngLat.lng, 'lon'));

    // $("#speedTracker").html("");
    // hand1.showValue(0, 100, am4core.ease.cubicOut); // --- Gauge works clockwise    
};