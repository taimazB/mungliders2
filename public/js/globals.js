var initLoad = true;
var field, fields;
var wind;
var speed = [], direction = [];
var pngWidth, pngHeight;
var lastModelDateTime;
var imgGlobal = new Image();
var cnvTmp = document.createElement("canvas");
var ctxTmp = cnvTmp.getContext("2d");
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

const cnvGL = document.getElementById('cnvAnim');
const cnvArrow = d3.select('#cnvArrows').node();
const cnvContourf = d3.select('#cnvContourf').node();

const ctxGL = cnvGL.getContext('webgl', { antialiasing: false });
const ctxArrow = cnvArrow.getContext('2d');
const ctxContourf = cnvContourf.getContext('2d');

var infoWindowWidth = 100, infoWindowHeight = 50;
