var field, fields;
var wind;
var speed = [], direction = [];
var pngWidth, pngHeight;
var lastModelDate;
var imgGlobal = new Image();
var cnvModel_gl, cnvModel_2d;
const cnvTmp = document.createElement("canvas");
var ctxTmp = cnvTmp.getContext("2d");
var R = 6378137;
var mapWidth, mapHeight;

// --- UV
var isAnimation = true;
var uMin = -3., uMax = 3.;
var vMin = -3., vMax = 3.;

var maxColors = 50, colorPalette;
