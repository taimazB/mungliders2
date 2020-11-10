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
        default:
        // $("#tabModels").css("display", "block");
    }
})

$('.ui .accordion')
    .accordion({
        selector: {
            trigger: '.title .icon'
        }
    })
    ;


function getAvailTimes(model, field) {
    var results;
    $.ajax({
        url: "/getAvailTimes",
        type: "POST",
        async: false,
        data: { model: model, field: field },
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
// .sidebar('toggle')


///////////////////////////////////////////-----------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- FIELDS & MODELS -----------------------------------------\\
fields = [
    {
        field: "UV",
        model: "RIOPS",
        depths: [0, 1, 2, 3, 5, 6, 8, 9, 11, 13, 16, 19, 22, 26, 30, 35, 41, 47, 53, 61, 69, 77, 86, 97, 108, 120, 133, 147, 163, 180, 199, 221, 244, 271, 300, 333, 370, 411, 457, 508, 565, 628, 697, 773, 856, 947, 1045, 1151, 1265, 1387, 1516, 1652, 1795, 1945, 2101, 2262, 2429, 2600, 2776, 2955, 3138, 3324, 3513, 3704, 3897, 4093, 4289, 4488, 4687, 4888, 5089, 5291, 5494, 5698, 5902],
        depth: 0,
        latestRun: null,
        dateTimes: getAvailTimes("RIOPS", "UV").map(d => moment.utc(d, "YYYYMMDD_HH")),
        dateTime: null
    },
    {
        field: "UV",
        model: "HYCOM",
        depths: [0, 2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000],
        depth: 0,
        latestRun: null,
        dateTimes: getAvailTimes("HYCOM", "UV").map(d => moment.utc(d, "YYYYMMDD_HH")),
        dateTime: null
    },
    {
        field: "SST",
        model: "jplMUR41",
        depths: null,
        depth: null,
        latestRun: null,
        dateTimes: null,
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

lastModelDateTime = findClosestDateTime(moment().utc(), field.dateTimes).dateTime;

$("#dateTime").html(moment().utc().format("MMM D, HH:mm") + " UTC");
setInterval(() => {
    $("#dateTime").html(moment().utc().format("MMM D, HH:mm") + " UTC");
}, 60000);


///////////////////////////////////////////-----------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- DROPDOWNS -----------------------------------------\\
function init_ddField() {
    $('#ddField').dropdown({
        values: [...new Set(fields.map(d => d.field))].map((d, i) => { return { name: d, value: i } }),
    })
        .dropdown('set selected', '0')
        .dropdown('setting', 'onChange', (i, selectedField) => {
            field = fields.filter(d => d.field == selectedField)[0];
            init_ddModel();
            // draw();
        })

    init_ddModel();
}

function init_ddModel() {
    $('#ddModel')
        .dropdown({
            values: fields.filter(d => d.field == field.field).map((d, i) => { return { name: d.model, value: i } }),
        })
        .dropdown('set selected', '0')
        .dropdown('setting', 'onChange', (i, selectedModel) => {
            $("#activeModel").html(selectedModel);
            field = fields.filter(d => d.field == field.field && d.model == selectedModel)[0];
            lastModelDateTime = field.dateTimes[findClosestDateTime(lastModelDateTime, field.dateTimes).index];
            availDates = _.uniq(fields.filter(d => { return d.field == field.field && d.model == field.model })[0].dateTimes.map(d => d.format("MMM D"))).map((d, i) => { return { name: d, value: i } });
            availTimes = _.uniq(fields.filter(d => { return d.field == field.field && d.model == field.model })[0].dateTimes.map(d => d.format("HH"))).map((d, i) => { return { name: d + ":00", value: i } });
            init_ddDate();
            init_ddTime();
            init_ddDepth();
            draw();
        })

    lastModelDateTime = field.dateTimes[findClosestDateTime(lastModelDateTime, field.dateTimes).index];
    availDates = _.uniq(fields.filter(d => { return d.field == field.field && d.model == field.model })[0].dateTimes.map(d => d.format("MMM D"))).map((d, i) => { return { name: d, value: i } });
    availTimes = _.uniq(fields.filter(d => { return d.field == field.field && d.model == field.model })[0].dateTimes.map(d => d.format("HH"))).map((d, i) => { return { name: d + ":00", value: i } });

    init_ddDate();
    init_ddTime();
    init_ddDepth();
}

function init_ddDate() {
    $('#ddDate')
        .dropdown({
            values: availDates,
        })
        .dropdown('set selected', lastModelDateTime.format("MMM D"))
        .dropdown('setting', 'onChange', (i) => {
            lastModelDateTime = moment(lastModelDateTime).set("month", availDates[i].name.split(" ")[0])
            lastModelDateTime = moment(lastModelDateTime).set("date", parseInt(availDates[i].name.split(" ")[1]))
            field.dateTime = lastModelDateTime;
            draw();
        })

    field.dateTime = lastModelDateTime;
}

function init_ddTime() {
    $('#ddTime')
        .dropdown({
            values: availTimes
        })
        .dropdown('set selected', lastModelDateTime.format("HH:00"))
        .dropdown('setting', 'onChange', (i) => {
            lastModelDateTime = moment(lastModelDateTime).set("hour", availTimes[i].name.split(":")[0])
            field.dateTime = lastModelDateTime;
            draw();
        })

    field.dateTime = lastModelDateTime;
}

function init_ddDepth() {
    $('#ddDepth').dropdown({
        values: fields.filter(d => { return d.field == field.field && d.model == field.model })[0].depths.map((d, i) => { return { name: d, value: i } }),
    })
        .dropdown('set selected', '0')
        .dropdown('setting', 'onChange', (i, selectedDepth) => {
            field.depth = selectedDepth;
            draw();
        })

    field.depth = field.depths[0];
}

init_ddField();



///////////////////////////////////////////---------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- DATE & TIME UP/DOWN -----------------------------------------\\
$("#dayDown").on("click", () => {
    var iDay = parseInt($("#ddDate").dropdown("get value"));
    if (iDay > 0) {
        $("#ddDate").dropdown("set value", iDay - 1).dropdown("set text", availDates[iDay - 1].name);
    }
})

$("#dayUp").on("click", () => {
    var iDay = parseInt($("#ddDate").dropdown("get value"));
    if (iDay < availDates.length - 1) {
        $("#ddDate").dropdown("set value", iDay + 1).dropdown("set text", availDates[iDay + 1].name);
    }
})

$("#timeDown").on("click", () => {
    var iDay = parseInt($("#ddDate").dropdown("get value")),
        iTime = parseInt($("#ddTime").dropdown("get value"));
    if (iTime > 0) {
        $("#ddTime").dropdown("set value", iTime - 1).dropdown("set text", availTimes[iTime - 1].name);
    } else if (iDay > 0) {
        $("#ddTime").dropdown("set value", availTimes.length - 1).dropdown("set text", availTimes[availTimes.length - 1].name);
        $("#dayDown").click();
    }
})

$("#timeUp").on("click", () => {
    var iDay = parseInt($("#ddDate").dropdown("get value")),
        iTime = parseInt($("#ddTime").dropdown("get value"));
    if (iTime == availTimes.length - 1 && iDay < availDates.length - 1) {
        $("#ddTime").dropdown("set value", 0).dropdown("set text", availTimes[0].name);
        $("#dayUp").click();
    } else if (iTime < availTimes.length - 1) {
        $("#ddTime").dropdown("set value", iTime + 1).dropdown("set text", availTimes[iTime + 1].name);
    }
})
