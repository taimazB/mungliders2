var express = require("express");
var app = express();
var http = require("http").createServer(app);
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var fs = require("fs");
var { exec } = require('child_process');
const moment = require("moment");
const csv = require('csv-parser')
var _ = require("underscore")
var glob = require("glob")
var fs = require("fs");
const { rgb } = require("d3");
// var sleep = require('sleep');
// const { csvParse } = require("d3");
// var zip = require("express-zip");


// --- To allow large arrays being passed
app.use(bodyParser.json({ limit: '500mb' }))
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 500000 }));

app.use(express.static(__dirname + "/public"));

http.listen(2020, '0.0.0.0', function () {
  console.log("Server is running on port 2020");
});

var pass = "";
app.get("/", function (req, res) {
  pass = "";
  res.sendFile(__dirname + "/public/login.html");
});


app.post("/setPassword", function (req, res) {
  pass = "letIn";
  res.send();
});

app.get("/map", function (req, res) {
  if (pass == "letIn") {
    res.sendFile(__dirname + "/public/main.html");
  }
});



// app.post("/prepareImage", function (req, res) {
//   var now = moment().format('x');
//   var time = req.body.time,
//     depth = req.body.depth,
//     model = req.body.model,
//     field = req.body.field
//   // lonMin = req.body.lonMin,
//   // lonMax = req.body.lonMax,
//   // latMin = req.body.latMin,
//   // latMax = req.body.latMax;

//   // exec(`bash scripts/prepareImage.sh ${time} ${depth} ${model} ${field} ${lonMin} ${lonMax} ${latMin} ${latMax} ${now}`, function (err, stdout, stderr) {
//   //   while (!fs.existsSync(`public/tmp/${now}.json`) || !fs.existsSync(`public/tmp/${now}.png`)) { null };

//   // --- ?.png is created, then ...
//   // --- Convert png data to speed & direction arrays
//   // var speed = [], direction = [];
//   // var uvMin = -3., uvMax = 3.;


//   fs.createReadStream(`public/models/RIOPS/UV/png/RIOPS_UV_20201105_21_0000.png`)
//     .pipe(
//       new PNG({
//         filterType: -1,
//       })
//     )
//     .on("parsed", function () {
//       // var rgba = new Uint8Array(this.width * this.height * 4);
//       // var rgba = [];
//       // console.log(this.data.length)
//       // rgba = this.data.map(d => { return +d });
//       // rgba = [...this.data]
//       // console.log(rgba, rgba.length)
//       // for (var y = 0; y < this.height; y++) {
//       //   for (var x = 0; x < this.width; x++) {
//       //     var i = (this.width * y + x) << 2;
//       // rgba[4 * i] = this.data[i];
//       // rgba[4 * i + 1] = this.data[i + 1];
//       // rgba[4 * i + 2] = 0;
//       // rgba[4 * i + 3] = 0;
//       // rgba.push([this.data[i],this.data[i+1],0,0]);
//       // var u = (this.data[i] / 255) * (uvMax - uvMin) + uvMin + 0.0117647058823529,
//       //   v = (this.data[i + 1] / 255) * (uvMax - uvMin) + uvMin - 0.0117647058823529;
//       // // console.log(u, v, Math.sqrt(u ** 2 + v ** 2))
//       // speed.push(Math.sqrt(u ** 2 + v ** 2));
//       // tmpDir = Math.atan2(v, u) * 180 / Math.PI;
//       // tmpDir = tmpDir >= 0 ? tmpDir : tmpDir + 360;
//       // direction.push(tmpDir);
//       //   }
//       // }

//       // res.send({ timestamp: now, width: this.width, height: this.height, speed: speed, direction: direction });
//       // res.end();
//       // console.log(this.data, this.data[0])
//       // console.log(rgba)
//       // var rgba = new Uint8Array(this.data);
//       // console.log(rgba)
//       res.send({ data: this.data });
//       res.end();
//     })


//   // var rgba = [];
//   // for (var i = 0; i < 1200; i++) {
//   //   rgba.push(parseInt(Math.random()*255));
//   //   rgba.push(parseInt(Math.random()*255));
//   //   rgba.push(0);
//   //   rgba.push(0);
//   // }
//   // res.send({ data: rgba });
//   // res.end();

// });


app.post("/getAvailTimes", function (req, res) {
  var model = req.body.model,
    field = req.body.field;

  res.send([...new Set(fs.readdirSync(`public/models/${model}/${field}/jpg/`).map(d => d.split("_").slice(2, 4).join("_")))])
  res.end();
});


// app.post("/readJPLMUR41SST", function (req, res) {
//   var date = req.body.date,
//     lonMin = 3 * Math.floor(+req.body.lonMin / 3),
//     lonMax = 3 * Math.ceil(+req.body.lonMax / 3),
//     latMin = 3 * Math.floor(+req.body.latMin / 3),
//     latMax = 3 * Math.ceil(+req.body.latMax / 3);

//   promises = []
//   for (var lon = lonMin; lon < lonMax; lon += 3) {
//     for (var lat = latMin; lat < latMax; lat += 3) {
//       try {
//         var fileName = `public/models/jplMUR41/SST/jplMUR41_SST_lon${zeroPad(lon, 4)}${zeroPad(lon + 3, 4)}_lat${zeroPad(lat, 3)}${zeroPad(lat + 3, 3)}.csv`;
//         var filePromise = new Promise(resolve => {
//           tmp = [];
//           fs.createReadStream(fileName)
//             .pipe(csv())
//             .on('data', (data) => { tmp.push(data) })
//             .on('end', () => { resolve(tmp) })
//         })
//         promises.push(filePromise)
//       } catch { null };
//     }
//   }

//   Promise.all(promises).then(results => {
//     // var subsetData = _.sample(results, 10000);
//     // subsetData = results;
//     res.send({ results });
//   })
// });


app.post("/readJPLMUR41SST", function (req, res) {
  var date = req.body.date,
    lonMin = Math.floor(+req.body.lonMin),
    lonMax = Math.ceil(+req.body.lonMax),
    latMin = Math.floor(+req.body.latMin),
    latMax = Math.ceil(+req.body.latMax),
    zoom = +req.body.zoom;

  promises = [];
  // level = "11.0";

  // --- Zoom levels: [4 ,  5,  6,  7,  8,  9]
  // --- reses:       [1 ,  1,  1, .5, .5, .1]
  var reses = [1, 1, 1, .5, .5, .1];
  for (level = -1; level <= 22.7; level += reses[zoom - 4]) {
    files = glob.sync(`public/models/jplMUR41/SST/cnt${level.toFixed(1)}_i*.csv`);
    for (var i = 0; i < files.length; i++) { // --- Needs to be synchronous, so NO forEach
      var filePromise = new Promise(resolve => {
        var tmp = [{ level: level }];
        fs.createReadStream(files[i])
          .pipe(csv())
          .on('data', (data) => { tmp.push(data) })
          .on('end', () => { resolve(tmp) })
      })
      promises.push(filePromise);
    };
  }

  var levels = [];
  Promise.all(promises).then(results => {
    // results.forEach(result=>{
    //   levels.push(result[0]['level']);
    // });
    // levels = [...new Set(levels)];  // --- Filter unique values only
    // console.log(levels);
    res.send({ results });
  })
});


app.post("/readCSV", function (req, res) {
  var path = req.body.path;
  var data = [];

  fs.createReadStream(path)
    .pipe(csv())
    .on('data', (row) => { data.push(row) })
    .on('end', () => {
      res.send({ data });
    });
});


/////////////////////////////////////////////////////////////////////////////////
function zeroPad(num, numZeros) {
  var n = Math.abs(num);
  var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
  var zeroString = Math.pow(10, zeros).toString().substr(1);
  if (num < 0) {
    zeroString = Math.pow(10, zeros - 1).toString().substr(1);
    zeroString = '-' + zeroString;
  }

  return zeroString + n;
}


let sessionDir, id;
app.post("/pathPlanning", urlencodedParser, function (req, res) {
  id = req.body.id; console.log(id);
  let formData = [
    req.body.fromLat,
    req.body.fromLon,
    req.body.toLat,
    req.body.toLon,
    req.body.fModel,
    req.body.hModel,
    req.body.weight,
    req.body.bathymetry,
    req.body.timeStepping
  ];

  sessionDir = "../gnt/sessions/" + id;
  fs.mkdirSync(sessionDir);
  fs.writeFile(sessionDir + "/inputRaw.txt", formData.join(" "), "utf8", function (err) {
    if (err) {
      console.log(
        "Some error occured - file either not saved or corrupted file saved."
      );
    } else {
      exec('bash scripts/pathPlanning.sh ' + id, function (err, stdout, stderr) {
        fs.readFile(sessionDir + "/path_waypoints_smooth.csv", 'utf8', async function read(err, data) {
          if (err || data.length == 0) {
            res.send({ status: false });
          }
          else if (data) {
            res.send({ status: true, data: data.split(/\r?\n/) });
            res.end();
          }
        });
      });
    }
  });
});


app.get('/downloadPathPlanning', function (req, res) {
  files = [{ path: sessionDir + '/path_waypoints_smooth.csv', name: 'path_waypoints_smooth.csv' },
  { path: sessionDir + '/goto_l20.ma', name: 'goto_l20.ma' }];
  res.zip(files, 'pathPlanning.zip');
  // res.download('./outputs/path_waypoints_smooth.csv');
});