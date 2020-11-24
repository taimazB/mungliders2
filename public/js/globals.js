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
var uMin = -3., uMax = 3.;
var vMin = -3., vMax = 3.;
var tMin = -2., tMax = 35;

var maxColors = 50, colorPalette;

var palette, paletteStops;

var reqAnimID;

const cnvGL = document.getElementById('cnvAnim');
const cnvArrow = d3.select('#cnvArrows').node();
const cnvSST = d3.select('#cnvSST').node();

const ctxGL = cnvGL.getContext('webgl', { antialiasing: false });
const ctxArrow = cnvArrow.getContext('2d');
const ctxSST = cnvSST.getContext('2d');

var infoWindowWidth = 100, infoWindowHeight = 50;