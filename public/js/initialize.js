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


function getAvailTimes(model, field, i) {
    var results;
    $.ajax({
        url: "/getAvailTimes",
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
// .sidebar('toggle')


///////////////////////////////////////////-----------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- FIELDS & MODELS -----------------------------------------\\
fields = [
    {
        field: "UV",
        model: "RIOPS",
        depths: [
            { name: "0000-0010", text: "Surface (0-10 m)" },
            { name: "0010-0050", text: "10 - 50 m" },
            { name: "0050-0100", text: "50 - 100 m" },
            { name: "0100-0200", text: "100 - 200 m" },
            { name: "0200-0500", text: "200 - 500 m" },
            { name: "0500-1000", text: "500 m - 1 km" },
            { name: "1000-1500", text: "1 - 1.5 km" },
            { name: "1500-2000", text: "1.5 - 2 km" },
            { name: "2000-20000", text: "Bottom (below 2 km)" }
        ],
        depth: null,
        latestRun: null,
        dateTimes: getAvailTimes("RIOPS", "UV", 2).map(d => moment.utc(d, "YYYYMMDD_HH")),
        dateTime: null
    },
    {
        field: "UV",
        model: "HYCOM",
        depths: [
            { name: "0000-0010", text: "Surface (0-10 m)" },
            { name: "0010-0050", text: "10 - 50 m" },
            { name: "0050-0100", text: "50 - 100 m" },
            { name: "0100-0200", text: "100 - 200 m" },
            { name: "0200-0500", text: "200 - 500 m" },
            { name: "0500-1000", text: "500 m - 1 km" },
            { name: "1000-1500", text: "1 - 1.5 km" },
            { name: "1500-2000", text: "1.5 - 2 km" },
            { name: "2000-20000", text: "Bottom (below 2 km)" }
        ],
        depth: null,
        latestRun: null,
        dateTimes: getAvailTimes("HYCOM", "UV", 2).map(d => moment.utc(d, "YYYYMMDD_HH")),
        dateTime: null
    },
    {
        field: "SST",
        model: "JPLMUR41",
        depths: null,
        depth: null,
        latestRun: null,
        dateTimes: getAvailTimes("JPLMUR41", "SST", 1).map(d => moment.utc(d, "YYYYMMDD")),
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
            switch (field.field) {
                case "UV":
                    $('.canvas').css('display', 'none');
                    if (isAnimation) { $("#cnvModel_gl").css('display', 'block') }
                    else { $("#cnvModel_2d").css('display', 'block') };
                    break;
                case "SST":
                    $('.canvas').css('display', 'none');
                    $("#cnvModel_SST").css('display', 'block');
                    break;
                default:
                    null;
            }
            init_ddModel();
            draw({init:true});
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
            availTimes = _.uniq(fields.filter(d => { return d.field == field.field && d.model == field.model })[0].dateTimes.map(d => d.format("HH"))).sort().map((d, i) => { return { name: d + ":00", value: i } });
            init_ddDate();
            init_ddTime();
            init_ddDepth();
            draw({init:true});
        })

    lastModelDateTime = field.dateTimes[findClosestDateTime(lastModelDateTime, field.dateTimes).index];
    availDates = _.uniq(fields.filter(d => { return d.field == field.field && d.model == field.model })[0].dateTimes.map(d => d.format("MMM D"))).map((d, i) => { return { name: d, value: i } });

    switch (field.field) {
        case "UV":
            availTimes = _.uniq(fields.filter(d => { return d.field == field.field && d.model == field.model })[0].dateTimes.map(d => d.format("HH"))).sort().map((d, i) => { return { name: d + ":00", value: i } });
            init_ddDate();
            init_ddTime();
            init_ddDepth();
            break;
        case "SST":
            init_ddDate();
            break;
        default:
            null
    }
}

function init_ddDate() {
    field.dateTime = lastModelDateTime;
    $('#ddDate')
        .dropdown({
            values: availDates,
        })
        .dropdown('set selected', lastModelDateTime.format("MMM D"))
        .dropdown('setting', 'onChange', (i) => {
            lastModelDateTime = moment(lastModelDateTime).set("month", availDates[i].name.split(" ")[0])
            lastModelDateTime = moment(lastModelDateTime).set("date", parseInt(availDates[i].name.split(" ")[1]))
            field.dateTime = lastModelDateTime;
            draw({init:true});
        })
}

function init_ddTime() {
    field.dateTime = lastModelDateTime;

    $('#ddTime')
        .dropdown({
            values: availTimes
        })
        .dropdown('set selected', lastModelDateTime.format("HH:00"))
        .dropdown('setting', 'onChange', (i) => {
            lastModelDateTime = moment(lastModelDateTime).set("hour", availTimes[i].name.split(":")[0])
            field.dateTime = lastModelDateTime;
            draw({init:true});
        })
}

function init_ddDepth() {
    field.depth = field.depths[0];

    $('#ddDepth').dropdown({
        values: fields.filter(d => { return d.field == field.field && d.model == field.model })[0].depths.map((d, i) => { return { name: d.text, value: i } }),
    })
        .dropdown('set selected', field.depth.text)
        .dropdown('setting', 'onChange', (i) => {
            field.depth = field.depths[i];
            draw({init:true});
        })
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

            if (isAnimation) { $("#cnvModel_gl").css('display', 'block') }
            else { $("#cnvModel_2d").css('display', 'block') };
            // setTimeout(()=>{draw()},5000)
            draw({init:false});
        }
    });



///////////////////////////////////////////----------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- CONTOUR COLORS -----------------------------------------\\
var palette = [[255, 255, 255], [255, 255, 255], [0, 102, 204], [0, 204, 255], [0, 255, 255], [0, 255, 0], [255, 255, 0], [255, 0, 0], [255, 204, 204]];
var paletteStops = [0, 0.5404, 0.5405, 5.4054, 5.6757, 32.4324, 59.4595, 86.4865, 100];



cnvGL = document.getElementById('cnvModel_gl');
cnvArrow = d3.select('#cnvModel_2d').node();
cnvSST = d3.select('#cnvModel_SST').node();

ctxGL = cnvGL.getContext('webgl', { antialiasing: false });
ctxArrow = cnvArrow.getContext('2d');
ctxSST = cnvSST.getContext('2d');
