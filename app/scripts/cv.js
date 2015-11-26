'use strict';

var width = 750,
  height = 140,
  cellSize = 13; // cell size

var format = d3.time.format('%Y-%m-%d');

var color = function(d) {
  var lv = Math.ceil(d/0.25);
  return 'lv' + (lv > 4 ? 4 : lv);
};

var svg = d3.select('.cv').append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('class', 'cv')
  .append('g')
  .attr('transform', 'translate(' + ((width - cellSize * 53) / 2) + ',' + ((height - cellSize * 7) / 2) + ')');

svg.append('text')
  .attr('transform', 'translate(-14,' + cellSize*1.8 + ')')
  .text('一');

svg.append('text')
  .attr('transform', 'translate(-14,' + cellSize*3.8 + ')')
  .text('三');

svg.append('text')
  .attr('transform', 'translate(-14,' + cellSize*5.8 + ')')
  .text('五');

var today = new Date();
var lastYear = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
var shiftWeeks = 53 - d3.time.weekOfYear(lastYear);

var shiftWeek = function(d) {
  var year = d.getFullYear();
  var thisYear = today.getFullYear();
  var weekOfYear = d3.time.weekOfYear(d);
  if (year < thisYear) {
    weekOfYear = weekOfYear - 53 + shiftWeeks;
  } else {
    weekOfYear += shiftWeeks - 1;
  }
  return weekOfYear;
};

var startYear = lastYear.getFullYear();
var startMonth = lastYear.getDate() === 1 ? lastYear.getMonth() : lastYear.getMonth() + 1;
for (var i = 0; i < 12; i ++) {
  var s = new Date(startYear, startMonth + i, 1);
  var w = shiftWeek(s) + (s.getDay() > 0 ? 1 : 0);
  var m = s.getMonth() + 1;
  var l = m > 9 ? m : '0' + m;
  svg.append('text')
    .attr('transform', 'translate(' + cellSize * w + ', -5)')
    .text(l);
}

var rect = svg.selectAll('.day')
  .data(d3.time.days(lastYear, today))
  .enter().append('rect')
  .attr('class', 'day')
  .attr('width', cellSize)
  .attr('height', cellSize)
  .attr('x', function(d) { return shiftWeek(d) * cellSize; })
  .attr('y', function(d) { return d.getDay() * cellSize; })
  .datum(format);

rect.append('title')
  .text(function(d) { return d; });

var data = {
  '2014-11-30': 13,
  '2014-12-24': 9,
  '2015-11-19': 23,
  '2015-11-20': 20,
  '2015-11-21': 15,
  '2015-11-22': 0,
  '2015-11-23': 2,
  '2015-11-24': 9,
  '2015-11-26': 7
};

rect.filter(function(d) { return d in data; })
  .attr('class', function(d) { return 'day ' + color(data[d] / 20); })
  .select('title')
  .text(function(d) { return d + ': ' + data[d] + ' 件案子'; });
