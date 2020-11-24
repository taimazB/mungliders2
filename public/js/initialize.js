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
        dateTimes: getAvailDateTimes("JPLMUR41", "SST", 1).map(d => moment.utc(d, "YYYYMMDD")),
        dateTime: null
    }
]

var availDates, iDate, availTimes, iTime;
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
        $("#btnsField").append(`<button id="btn${e}" class="ui button">${e}</button>`);
        $(`#btn${e}`).on('click', function () {
            // --- Hide all canvas's to display the appropriate one later
            $('.canvas').css('display', 'none');

            init_btnModels(e);
        })
    });

    btnsActivate();

    // --- Initiale load - choose the first field
    $(`#btn${[...new Set(fields.map(d => d.field))][0]}`).click();
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
    console.log(field.dateTimes)
    if (lastModelDateTime < field.dateTimes[0]) { console.log('belowMin'); lastModelDateTime = field.dateTimes[0] };
    if (lastModelDateTime > field.dateTimes[field.dateTimes.length - 1]) { console.log('aboveMax'); lastModelDateTime = field.dateTimes[field.dateTimes.length - 1] };

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
            console.log('1')
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
    try { draw({ init: true }); } catch { console.log('nope') }

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
    console.log(lastModelDateTime.format("YMMDD_HH"))
    var tmpDate = moment(lastModelDateTime).add(-1, 'days');  // --- To avoid overwriting "lastModelDateTime"
    if (tmpDate > field.dateTimes[0]) {
        lastModelDateTime = tmpDate;
        console.log(lastModelDateTime.format("YMMDD_HH"))
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


colorPalette = palette('tol-rainbow', maxColors)


$(".checkbox")
    .checkbox({
        onChange: () => {
            isAnimation = $("#chkAnimation").checkbox('is checked');
            $('.canvas').css('display', 'none');
            draw({ init: false });
        }
    });


///////////////////////////////////////////----------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- CONTOUR COLORS -----------------------------------------\\
var palette = [[255, 255, 255], [255, 255, 255], [0, 102, 204], [0, 204, 255], [0, 255, 255], [0, 255, 0], [255, 255, 0], [255, 0, 0], [255, 204, 204]];
var paletteStops = [0, 0.5404, 0.5405, 5.4054, 5.6757, 32.4324, 59.4595, 86.4865, 100];


cnvGL = document.getElementById('cnvAnim');
cnvArrow = d3.select('#cnvArrows').node();
cnvSST = d3.select('#cnvSST').node();

ctxGL = cnvGL.getContext('webgl', { antialiasing: false });
ctxArrow = cnvArrow.getContext('2d');
ctxSST = cnvSST.getContext('2d');
