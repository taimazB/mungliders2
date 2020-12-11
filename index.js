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

var pass = false;
app.get("/", function (req, res) {
    pass = false;
  res.sendFile(__dirname + "/public/login.html");
});


app.post("/login", function (req, res) {
    const password = "y1jD3r";
    pass = false;
  if (req.body.password == password) {
    pass = true;
    res.send(password);
  } else { res.send(null) }

});

app.get("/map", function (req, res) {
  if (pass) {
    res.sendFile(__dirname + "/public/main.html");
  }
});


app.post("/getAvailDateTimes", function (req, res) {
  var model = req.body.model,
    field = req.body.field,
    i = parseInt(req.body.i);

  res.send([...new Set(fs.readdirSync(`public/models/${model}/${field}/jpg/`).map(d => d.replace(".jpg", "").split("_").slice(2, 2 + i).join("_")))]);
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
