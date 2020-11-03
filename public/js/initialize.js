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
            console.log('hi')
        // $("#tabModels").css("display", "block");
    }
    // console.log(this)
    // $(this).addClass("active");
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
    .sidebar('toggle')


///////////////////////////////////////////-----------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- FIELDS & MODELS -----------------------------------------\\
fields = [
    {
        field: "UV",
        model: "RIOPS",
        depths: [0, 1, 2, 3, 5, 6, 8, 9, 11, 13, 16, 19, 22, 26, 30, 35, 41, 47, 53, 61, 69, 77, 86, 97, 108, 120, 133, 147, 163, 180, 199, 221, 244, 271, 300, 333, 370, 411, 457, 508, 565, 628, 697, 773, 856, 947, 1045, 1151, 1265, 1387, 1516, 1652, 1795, 1945, 2101, 2262, 2429, 2600, 2776, 2955, 3138, 3324, 3513, 3704, 3897, 4093, 4289, 4488, 4687, 4888, 5089, 5291, 5494, 5698, 5902],
        depth: 0,
        latestRun: null,
        times: getAvailTimes("RIOPS", "UV").map(d => moment(d, "YYYYMMDD_HH")),
        time: getAvailTimes("RIOPS", "UV").map(d => moment(d, "YYYYMMDD_HH"))[0]
    },
    {
        field: "UV",
        model: "HYCOM",
        depths: [0, 2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000],
        depth: 0,
        latestRun: null,
        times: getAvailTimes("HYCOM", "UV").map(d => moment(d, "YYYYMMDD_HH")),
        time: getAvailTimes("HYCOM", "UV").map(d => moment(d, "YYYYMMDD_HH"))[0]
    },
    {
        field: "SST",
        model: "jplMUR41",
        depths: null,
        depth: null,
        latestRun: null,
        times: null,
        time: null
    }
]

field = fields[0];


///////////////////////////////////////////-----------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- DROPDOWNS -----------------------------------------\\
function init_ddField() {
    $('#ddField').dropdown({
        values: [...new Set(fields.map(d => d.field))].map((d, i) => { return { name: d, value: i } }),
    })
        .dropdown('set selected', '0')
        .dropdown('setting', 'onChange', (i, selectedField) => {
            resetField();
            field = fields.filter(d => d.field == selectedField)[0];
            init_ddModel();
            draw();
        })

    init_ddModel();
}

function init_ddModel() {
    $('#ddModel').dropdown({
        values: fields.filter(d => d.field == field.field).map((d, i) => { return { name: d.model, value: i } }),
    })
        .dropdown('set selected', '0')
        .dropdown('setting', 'onChange', (i, selectedModel) => {
            $("#activeModel").html(selectedModel);
            resetField();
            field = fields.filter(d => d.field == field.field && d.model == selectedModel)[0];
            init_ddDepth();
            init_ddTime();
            draw();
        })

    init_ddTime();
    init_ddDepth();
}

function init_ddTime() {
    $('#ddTime').dropdown({
        values: fields.filter(d => { return d.field == field.field && d.model == field.model })[0].times.map((d, i) => { return { name: d.format("MMM D, HH:00"), value: i } }),
    })
        .dropdown('set selected', '0')
        .dropdown('setting', 'onChange', (i, selectedTime) => {
            resetField();
            field.time = field.times[i];
            draw();
        })
}

function init_ddDepth() {
    $('#ddDepth').dropdown({
        values: fields.filter(d => { return d.field == field.field && d.model == field.model })[0].depths.map((d, i) => { return { name: d, value: i } }),
    })
        .dropdown('set selected', '0')
        .dropdown('setting', 'onChange', (i, selectedDepth) => {
            resetField();
            field.depth = selectedDepth;
            draw();
        })
}

init_ddField();


setInterval(() => {
    $("#dateTime").html(moment().utc().format("MMM D, HH:mm") + " UTC");
}, 1000);

//----------------------------------------- DROPDOWNS CHANGE -----------------------------------------\\
// $('#ddField').dropdown('setting', 'onChange', (i, selectedField) => {
//     updateWind("black");
//     field = fields.filter(d => d.field == selectedField)[0];
//     init_ddModel();
//     draw();
// })

// $('#ddModel').dropdown('setting', 'onChange', (i, selectedModel) => {
//     updateWind("black");
//     field = fields.filter(d => d.field == field.field && d.model == selectedModel)[0];
//     init_ddDepth();
//     init_ddTime();
//     draw();
// })

// $('#ddTime').dropdown('setting', 'onChange', (i, selectedTime) => {
//     updateWind("black");
//     field.time = field.times[i];
//     draw();
// })

// $('#ddDepth').dropdown('setting', 'onChange', (i, selectedDepth) => {
//     updateWind("black");
//     field.depth = selectedDepth;
//     draw();
// })
