var initLoad = true;
var field, fields;
var wind;
var speed = [], direction = [];
var pngWidth, pngHeight;
var lastModelDateTime;
var imgGlobal = new Image();
var imgBathymetry = new Image();

var R = 6378137;
var mapWidth, mapHeight;
var bnds;

// --- Currents
var isAnimation = true, isMouseInfo = false;

// --- Min & Max
var varMin, varMax, varMinOrg, varMaxOrg, varPalette;
var currentsMinOrg, currentsMaxOrg, currentsMin, currentsMax;
var sstMinOrg, sstMaxOrg, sstMin, sstMax;
var swhMinOrg, swhMaxOrg, swhMin, swhMax;
var seaiceMinOrg, seaiceMaxOrg, seaiceMin, seaiceMax;

var reqAnimID;

var infoWindowWidth = 100, infoWindowHeight = 50;

var bathymetryOpacityValue = 50;

///////////////////////////////////////////------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//----------------------------------------- CANVAS & CONTEXT -----------------------------------------\\
const cnvBathymetry = document.getElementById("cnvBathymetry");
const cnvGL = document.getElementById('cnvAnim');
const cnvArrows = d3.select('#cnvArrows').node();
const cnvContourf = d3.select('#cnvContourf').node();
var cnvTmp = document.createElement("canvas");

const ctxBathymetry = cnvBathymetry.getContext("2d");
const ctxGL = cnvGL.getContext('webgl', { antialiasing: false });
const ctxArrow = cnvArrows.getContext('2d');
const ctxContourf = cnvContourf.getContext('2d');
var ctxTmp = cnvTmp.getContext("2d");
