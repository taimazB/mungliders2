/**
 * ---------------------------------------
 * This demo was created using amCharts 4.
 * 
 * For more information visit:
 * https://www.amcharts.com/
 * 
 * Documentation is available at:
 * https://www.amcharts.com/docs/v4/
 * ---------------------------------------
 */

// Themes begin
am4core.useTheme(am4themes_dataviz);
am4core.useTheme(am4themes_animated);
// Themes end

// create chart
var chart = am4core.create("directionTracker", am4charts.GaugeChart);
chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

chart.startAngle = 0;
chart.endAngle = 360;

function createAxis(min, max, start, end, color) {
  var axis = chart.xAxes.push(new am4charts.ValueAxis());
  axis.min = min;
  axis.max = max;
  axis.strictMinMax = true;
  axis.renderer.useChartAngles = true;
  axis.renderer.startAngle = start;
  axis.renderer.endAngle = end;
  axis.renderer.minGridDistance = 120;

  axis.renderer.line.strokeOpacity = 1;
  axis.renderer.line.strokeWidth = 2;
  axis.renderer.line.stroke = am4core.color(color);
  
  axis.renderer.labels.template.disabled = true;
  axis.renderer.ticks.template.disabled = true;
  axis.renderer.ticks.template.stroke = am4core.color(color);
  axis.renderer.ticks.template.strokeOpacity = 1;
  axis.renderer.grid.template.disabled = true;
  axis.renderer.ticks.template.length = 20;
  
  return axis;
}

function createHand(axis) {
  var hand = chart.hands.push(new am4charts.ClockHand());
  hand.fill = axis.renderer.line.stroke;
  hand.stroke = axis.renderer.line.stroke;
  hand.axis = axis;
  hand.pin.disabled = true;
  hand.startWidth = 5;
  hand.endWidth = 0;
  hand.radius = am4core.percent(90);
  hand.innerRadius = am4core.percent(40);
  hand.value = 0;
  return hand;
}

var axis1 = createAxis(0, 360, 0, 360, "#EF6F6C");

var hand1 = createHand(axis1);

// setInterval(function() {
//   hand1.showValue(Math.random() * hand1.axis.max, 300, am4core.ease.cubicOut);
// }, 2000);

$("svg[version='1.1']").children("g").children("g").children("g")[1].remove()