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

var dailyCount = function(dateStr) {
  var max = 10;
  var from = new Date(dateStr);
  from.setHours(0, 0, 0, 0);
  from = from.toISOString();
  var to = new Date(dateStr);
  to.setHours(23, 59, 59, 999);
  to = to.toISOString();
  var cql = 'select count(*) ' +
    'from Case ' +
      //'where plaintiff like \'%张%\' ' +
    'where plaintiff > \'\' ' +
    'and ((initDate <= date(\'' + to + '\') and initDate >= date(\'' + from + '\')) ' +
    'or (updatedAt >= date(\'' + from + '\') and updatedAt <= date(\'' + to + '\')))';
  AV.Query.doCloudQuery(cql, {
    success: function(result) {
      d3.selectAll('rect').data(d3.time.days(lastYear, today)).datum(format).filter(function(d) { return d === dateStr; })
      .attr('class', function() { return 'day ' + color(result.count / max); })
      .select('title')
      .text(function(d) { return d + ': ' + result.count + ' 件案子'; });
    },
    error: function(error) {
      console.dir(error);
    }
  });
};

var begining = new Date('2015-11-12');
angular.forEach(d3.time.days(begining < lastYear ? lastYear : begining, today), function(d) {
  dailyCount(format(d));
});
