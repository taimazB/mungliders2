///////////////////////////////////////////---------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- SLIDERS -----------------------------------------\\
$("#inputWeight").slider({
    tooltip: 'always',
    tooltip_position: 'bottom'
});
$("#inputWeight").on("slide", function (slideEvt) {
    PPweight = slideEvt.value;
    $("#weightValue").text(PPweight);
});
$("#inputWeight").on("change", function (slideEvt) {
    PPweight = slideEvt.value.newValue;
    $("#weightValue").text(PPweight);
});

$(".tabButtons").on("click", (e) => {
    $(".tabButtons").removeClass("active");
    $(".tabContent").css("display", "none");

    switch (e.target.name) {
        case "tabModels":
            $("#tabModels").css("display", "block");
            break;
        case "tabPathPlanning":
            $("#tabPathPlanning").css("display", "block");
            initiatePathPlanning();
            break;
        case "tabMissionsArchieve":
            $("#tabMissionsArchieve").css("display", "block");
            break;
        case "tabSettings":
            $("#tabSettings").css("display", "block");
            break;
        default:
            null;
    }
})

$('.ui .accordion')
    .accordion({
        selector: {
            trigger: '.title .icon'
        }
    })
    ;


function getAvailDateTimes(model, field, i) {
    var results;
    $.ajax({
        url: "/getAvailDateTimes",
        type: "POST",
        async: false,
        data: { model: model, field: field, i: i },
        success: function (data, textStatus, jqXHR) {
            results = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

    return results;
}

///////////////////////////////////////////---------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- SIDEBAR -----------------------------------------\\
$('.ui.sidebar')
    .sidebar('setting', 'dimPage', false)
    .sidebar('setting', 'closable', false)


///////////////////////////////////////////-----------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- FIELDS & MODELS -----------------------------------------\\
fields = [
    {
        field: "Currents",
        model: "HYCOM",
        depths: [
            { name: "0000-0010", text: "Surface (0-10 m)" },
            { name: "0050-20000", text: "Bottom (below 50 m)" },
            { name: "0010-0050", text: "10 - 50 m" },
            { name: "0050-0100", text: "50 - 100 m" },
            { name: "0100-0200", text: "100 - 200 m" },
            { name: "0200-0500", text: "200 - 500 m" },
            { name: "0500-1000", text: "500 m - 1 km" },
            { name: "1000-1500", text: "1 - 1.5 km" },
            { name: "1500-2000", text: "1.5 - 2 km" }
        ],
        depth: null,
        latestRun: null,
        dateTimes: getAvailDateTimes("HYCOM", "Currents", 2).map(d => moment.utc(d, "YYYYMMDD_HH")),
        dateTime: null
    }, {
        field: "Currents",
        model: "RIOPS",
        depths: [
            { name: "0000-0010", text: "Surface (0-10 m)" },
            { name: "0050-20000", text: "Bottom (below 50 m)" },
            { name: "0010-0050", text: "10 - 50 m" },
            { name: "0050-0100", text: "50 - 100 m" },
            { name: "0100-0200", text: "100 - 200 m" },
            { name: "0200-0500", text: "200 - 500 m" },
            { name: "0500-1000", text: "500 m - 1 km" },
            { name: "1000-1500", text: "1 - 1.5 km" },
            { name: "1500-2000", text: "1.5 - 2 km" }
        ],
        depth: null,
        latestRun: null,
        dateTimes: getAvailDateTimes("RIOPS", "Currents", 2).map(d => moment.utc(d, "YYYYMMDD_HH")),
        dateTime: null
    }, {
        field: "SST",
        model: "JPLMUR41",
        depths: null,
        depth: null,
        latestRun: null,
        dateTimes: getAvailDateTimes("JPLMUR41", "SST", 2).map(d => moment.utc(d, "YYYYMMDD_HH")),
        dateTime: null
    }, {
        field: "SWH",
        model: "CMC",
        depths: null,
        depth: null,
        latestRun: null,
        dateTimes: getAvailDateTimes("CMC", "SWH", 2).map(d => moment.utc(d, "YYYYMMDD_HH")),
        dateTime: null
    }
]

field = fields[0];


///////////////////////////////////////////-------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- DATE & TIME -----------------------------------------\\
function findClosestDateTime(time, dateTimes) {
    var index = d3.minIndex(dateTimes.map(d => Math.abs(d.diff(time, 'minute'))));
    return { index: index, dateTime: dateTimes[index] };
}

lastModelDateTime = findClosestDateTime(moment.utc(), field.dateTimes).dateTime;


$("#dateTime").html(moment.utc().format("MMM D, HH:mm") + " UTC");
setInterval(() => {
    $("#dateTime").html(moment().utc().format("MMM D, HH:mm") + " UTC");
}, 60000);


///////////////////////////////////////////---------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- BUTTON GROUPS -----------------------------------------\\
function init_btnFields() {
    $("#btnsField").empty();
    [...new Set(fields.map(d => d.field))].forEach((e, i) => {
        $("#btnsField").append(`<button id="btn${e}" class="ui button" data-content="${fieldLongName(e)}">${e}</button>`);
        $(`#btn${e}`).on('click', function () {
            // --- Hide all canvas's to display the appropriate one later
            $('.canvas').css('display', 'none');

            init_btnModels(e);
            unhideCanvas();
            addSettings(e);
            try { addRemoveMouseInfo(); } catch { null }
        })
    });

    btnsActivate();

    // --- Initiale load - choose the first field
    $(`#btn${field.field}`).click();
}


function init_btnModels(variable) {
    $("#btnsModel").empty();
    fields.filter(d => d.field == variable).forEach((e, i) => {
        $("#btnsModel").append(`<button id="btn${e.model}" class="ui button">${e.model}</button>`);

        $(`#btn${e.model}`).on('click', function () {
            field = fields.filter(d => d.field == variable && d.model == e.model)[0];
            init_ddDepths();
            init_dates();
        })
    });

    btnsActivate();

    // --- Choose the first model
    $(`#btn${fields.filter(d => d.field == variable)[0].model}`).click();
}


function init_dates() {
    if (lastModelDateTime < field.dateTimes[0]) { lastModelDateTime = field.dateTimes[0] };
    if (lastModelDateTime > field.dateTimes[field.dateTimes.length - 1]) { lastModelDateTime = field.dateTimes[field.dateTimes.length - 1] };

    // --- Initialize datepicker
    // --- All this below because of the stupid local/UTC conflict!
    var startYear = field.dateTimes[0].toDate().getUTCFullYear(),
        startMonth = field.dateTimes[0].toDate().getUTCMonth(),
        startDay = field.dateTimes[0].toDate().getUTCDate();
    var endYear = field.dateTimes[field.dateTimes.length - 1].toDate().getUTCFullYear(),
        endMonth = field.dateTimes[field.dateTimes.length - 1].toDate().getUTCMonth(),
        endDay = field.dateTimes[field.dateTimes.length - 1].toDate().getUTCDate();
    var thisYear = lastModelDateTime.toDate().getUTCFullYear(),
        thisMonth = lastModelDateTime.toDate().getUTCMonth(),
        thisDay = lastModelDateTime.toDate().getUTCDate();
    $('.datepicker')
        .datepicker({
            format: "M, dd",
            maxViewMode: 1,
            todayBtn: "linked",
            todayHighlight: true
        })
        .datepicker('setStartDate', new Date(startYear, startMonth, startDay))
        .datepicker('setEndDate', new Date(endYear, endMonth, endDay))
        .on('changeDate', (e) => {
            lastModelDateTime = moment(lastModelDateTime).set("month", e.date.getMonth());
            lastModelDateTime = moment(lastModelDateTime).set("date", e.date.getDate());
            field.dateTime = lastModelDateTime;

            init_times();
        })
        .datepicker('update', new Date(thisYear, thisMonth, thisDay))

    init_times();
}


function init_times() {
    // --- Disable all hours, to be re-enabled next for the ones that exist
    $("#btnsTime").find("button").addClass('disabled');

    var hrClick = null;
    var availTimes = field.dateTimes.filter(d => d.format("YMMDD") == lastModelDateTime.format("YMMDD"));
    availTimes.map(d => {
        lastModelDateTime.format("HH") == d.format("HH") ? hrClick = d.format("HH") : null;
        $(`#hr${d.format("HH")}`).removeClass('disabled')
    });

    if (hrClick) { $(`#hr${hrClick}`).click() }
    else { $(`#hr${availTimes[0].format("HH")}`).click() }
}

$('.btnTime').on("click", (e) => {
    lastModelDateTime = moment(lastModelDateTime).set("hour", $(e.currentTarget).attr("id").slice(2));
    try { draw({ init: true }); } catch { null; }

})


function init_ddDepths() {
    $("#ddDepth").addClass('disabled');

    if (field.depths) {
        $("#ddDepth").removeClass('disabled');
        field.depth = field.depths[0];

        $('#ddDepth').dropdown({
            values: fields.filter(d => { return d.field == field.field && d.model == field.model })[0].depths.map((d, i) => { return { name: d.text, value: i } })
        })
            .dropdown('set selected', field.depth.text)
            .dropdown('setting', 'onChange', (i) => {
                field.depth = field.depths[i];
                draw({ init: true });
            })
    }
}

init_btnFields();


///////////////////////////////////////////---------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- DATE & TIME UP/DOWN -----------------------------------------\\
$("#dayDown").on("click", () => {
    var tmpDate = moment(lastModelDateTime).add(-1, 'days');  // --- To avoid overwriting "lastModelDateTime"
    if (tmpDate > field.dateTimes[0]) {
        lastModelDateTime = tmpDate;
        // --- All this below because of the stupid local/UTC conflict!
        var thisYear = lastModelDateTime.toDate().getUTCFullYear(),
            thisMonth = lastModelDateTime.toDate().getUTCMonth(),
            thisDay = lastModelDateTime.toDate().getUTCDate();
        $('.datepicker')
            .datepicker('setDate', new Date(thisYear, thisMonth, thisDay))
            .datepicker('update', new Date(thisYear, thisMonth, thisDay))
    }
})

$("#dayUp").on("click", () => {
    var tmpDate = moment(lastModelDateTime).add(1, 'days');  // --- To avoid overwriting "lastModelDateTime"
    if (tmpDate <= field.dateTimes[field.dateTimes.length - 1]) {
        lastModelDateTime = tmpDate;
        // --- All this below because of the stupid local/UTC conflict!
        var thisYear = lastModelDateTime.toDate().getUTCFullYear(),
            thisMonth = lastModelDateTime.toDate().getUTCMonth(),
            thisDay = lastModelDateTime.toDate().getUTCDate();
        $('.datepicker')
            .datepicker('setDate', new Date(thisYear, thisMonth, thisDay))
            .datepicker('update', new Date(thisYear, thisMonth, thisDay))
    }
})


///////////////////////////////////////////------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- SET WIDTH/HEIGHT -----------------------------------------\\
mapWidth = parseInt($("#map").css("width"));
mapHeight = parseInt($("#map").css("height"));

$('.canvas').attr("width", mapWidth);
$('.canvas').attr("height", mapHeight);


///////////////////////////////////////////---------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- COLOR PALETTE -----------------------------------------\\
colorPalette = palette('tol-rainbow', maxColors)


///////////////////////////////////////////----------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- CONTOUR COLORS -----------------------------------------\\
var palette = [[255, 255, 255], [255, 255, 255], [0, 102, 204], [0, 204, 255], [0, 255, 255], [0, 255, 0], [255, 255, 0], [255, 0, 0], [255, 204, 204]];
var paletteStops = [0, 0.5404, 0.5405, 5.4054, 5.6757, 32.4324, 59.4595, 86.4865, 100];


///////////////////////////////////////////-----------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- ANIMATION -----------------------------------------\\
function toggleAnimation() {
    isAnimation = !isAnimation;

    if (isAnimation) {
        $("#cnvArrows").css('display', 'none');
        $("#cnvAnim").css('display', 'block');
        $("#btnCurrentsAnimation i").removeClass("play");
        $("#btnCurrentsAnimation i").addClass("pause");
        $("#btnCurrentsAnimation").attr("data-content", "Stop animation");
    } else {
        $("#cnvAnim").css('display', 'none');
        $("#cnvArrows").css('display', 'block');
        $("#btnCurrentsAnimation i").removeClass("pause");
        $("#btnCurrentsAnimation i").addClass("play");
        $("#btnCurrentsAnimation").attr("data-content", "Start animation");
    }

    draw({ init: false })
}

function toggleMouseInfo() {
    isMouseInfo = !isMouseInfo;
    addRemoveMouseInfo();
}


function addRemoveMouseInfo() {
    if (isMouseInfo) {
        $("#infoWindow").css("display", "block");
        $("#infoWindow").width(infoWindowWidth);
        $("#infoWindow").empty();
        switch (field.field) {
            case "Currents":
                $("#infoWindow").append(`<div id="infoSpeed" style="width:100%; height:50%; text-align:center"></div>`);
                $("#infoWindow").append(`<div id="infoDirection" style="width:100%; height:50%; text-align:center"></div>`);
                break;
            case "SST": $("#infoWindow").append(`<div id="infoSST" style="width:100%; height:100%; text-align:center"></div>`); break;
            case "SWH": $("#infoWindow").append(`<div id="infoSWH" style="width:100%; height:100%; text-align:center"></div>`); break;
            default: null;
        }
        map.on("mousemove", showInfo);
        $("#btnMouseInfo").addClass("active");
        $("#btnMouseInfo").attr("data-content", "Hide data on map");
    } else {
        $("#infoWindow").css("display", "none");
        map.off("mousemove", showInfo);
        $("#btnMouseInfo").removeClass("active");
        $("#btnMouseInfo").attr("data-content", "Show data on map");
    }

}


function unhideCanvas() {
    switch (field.field) {
        case "Currents":
            isAnimation ? $("#cnvAnim").css('display', 'block') : $("#cnvArrows").css('display', 'block');
            break;
        case "SST":
        case "SWH":
            $("#cnvContourf").css('display', 'block');
            break;
        default:
            null
    }
}


function addSettings(e) {
    $("#settingsModel").empty();

    switch (e) {
        case "Currents":
            $("#settingsModel").append(`
            <button id="btnMouseInfo" class="ui icon mini circular toggle button ${isMouseInfo ? "active" : null}" data-content="${isMouseInfo ? "Hide data on map" : "Show data on map"}"">
              <i class="mouse pointer icon"></i>
            </button>
            <button id="btnCurrentsAnimation" class="ui icon mini circular button" data-content="${isAnimation ? "Stop animation" : "Start animation"}">
              <i class="${isAnimation ? "pause" : "play"} icon"></i>
            </button>
            `);
            $("#btnMouseInfo").on("click", toggleMouseInfo);
            $("#btnCurrentsAnimation").on("click", toggleAnimation);
            break;

        case "SST":
        case "SWH":
            $("#settingsModel").append(`
            <button id="btnMouseInfo" class="ui icon mini circular toggle button ${isMouseInfo ? "active" : null}" data-content="${isMouseInfo ? "Hide data on map" : "Show data on map"}">
              <i class="mouse pointer icon"></i>
            </button>
            `);
            $("#btnMouseInfo").on("click", toggleMouseInfo);
            break;

        default:
            null;
    }

    $("button").popup();
}

$("button").popup();


function showInfo(e) {
    var rgba = ctxTmp.getImageData(e.point.x, e.point.y, 1, 1).data;

    var x = e.originalEvent.clientX + 10;
    if (e.point.x + infoWindowWidth + 10 > mapWidth) { x -= infoWindowWidth + 10; }
    var y = e.originalEvent.clientY + 10;
    if (e.point.y + infoWindowHeight + 10 > mapHeight) { y -= infoWindowHeight + 10; }
    $("#infoWindow").offset({
        top: y,
        left: x
    })

    switch (field.field) {
        case "Currents":
            u = 6 * rgba[0] / 255 - 3,
                v = 6 * rgba[1] / 255 - 3;

            var speed = Math.sqrt(u ** 2 + v ** 2);
            Math.sqrt(u ** 2 + v ** 2);
            var dir = Math.atan2(v, u) * 180 / Math.PI;
            dir = dir < 0 ? dir + 360 : dir;

            if (speed > 0.017) {
                $("#infoWindow").css("display", "block");
                $("#infoSpeed").html(speed.toFixed(3) + " <sup>m</sup>&frasl;<sub>s</sub>");
                $("#infoDirection").html(dir.toFixed(0) + " &deg;");
            } else {
                $("#infoWindow").css("display", "none");
            }
            break;

        case "SST":
            var temp = rgba[0] / 255. * (tMax - tMin) + tMin;
            if (temp >= -1.8) {
                $("#infoWindow").css("display", "block");
                $("#infoSST").html(temp.toFixed(1) + " &deg;C");
            } else {
                $("#infoWindow").css("display", "none");
            }
            break;

        case "SWH":
            var swh = rgba[0] / 255. * (swhMax - swhMin) + swhMin;
            if (swh > 0.) {
                $("#infoWindow").css("display", "block");
                $("#infoSWH").html(swh.toFixed(1) + " m");
            } else {
                $("#infoWindow").css("display", "none");
            }
            break;

        default:
            null;
    }
}
