'use strict';

var format = d3.time.format('%Y-%m-%d');

var today = new Date();
var lastYear = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

var color = function(d) {
  var lv = Math.ceil(d/0.25);
  return 'lv' + (lv > 4 ? 4 : lv);
};

var drawCalendar = function() {
  var width = 750,
      height = 140,
      cellSize = 13; // cell size

  var svg = d3.select('.cvph').append('svg')
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
    if (w > 52) {
      break;
    }
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
};

var dailyCount = function(dateStr, $scope) {
  var max = 10;
  var sc = $scope.sc;
  var scPart = '';
  if (sc.state) {
    scPart += 'and state = \'' + sc.state + '\' ';
  }
  if (sc.defendants || sc.searchText) {
    scPart += 'and defendants like \'%' + (sc.defendants ? sc.defendants : sc.searchText) + '%\' ';
  }
  var from = new Date(dateStr);
  from.setHours(0, 0, 0, 0);
  from = from.toISOString();
  var to = new Date(dateStr);
  to.setHours(23, 59, 59, 999);
  to = to.toISOString();
  var cql = 'select count(*) ' +
              'from Case ' +
             'where plaintiff > \'\' ' + scPart +
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

var refreshCalendarView = function($scope) {
  var begining = new Date('2015-11-12');
  angular.forEach(d3.time.days(begining < lastYear ? lastYear : begining, today), function(d) {
    dailyCount(format(d), $scope);
  });
};

var bindGridData = function($scope, result) {
  $scope.gridOptions.data = [];
  angular.forEach(result.results, function (obj) {
    $scope.gridOptions.data.push({
      initDateStr: format(obj.attributes.initDate),
      updateDateStr: format(obj.updatedAt),
      finishDateStr: typeof(obj.attributes.finishDate) !== 'undefined' ? format(obj.attributes.finishDate) : '',
      plaintiff: obj.attributes.plaintiff,
      defendants: obj.attributes.defendants,
      details: obj.attributes.details,
      state: obj.attributes.state
    });
  });
};

var queryWithDateRange = function($scope, callback) {
  var scPart = '',
    sc = $scope.sc;
  if (sc.fromDate) {
    var fromDate = format(sc.fromDate) + 'T00:00:00.000Z';
    scPart += 'and (initDate >= date(\'' + fromDate + '\') or updatedAt >= date(\'' + fromDate + '\')) ';
  }
  if (sc.toDate) {
    var toDate = format(sc.toDate) + 'T23:59:59.999Z';
    scPart += 'and (initDate <= date(\'' + toDate + '\') or updatedAt <= date(\'' + toDate + '\')) ';
  }
  if (sc.state) {
    scPart += 'and state = \'' + sc.state + '\' ';
  }
  if (sc.defendants || sc.searchText) {
    scPart += 'and defendants like \'%' + (sc.defendants ? sc.defendants : sc.searchText) + '%\' ';
  }
  var cql = 'select * ' +
    'from Case ' +
    'where plaintiff > \'\' ' + scPart;
  AV.Query.doCloudQuery(cql, {
    success: function(result) {
      callback($scope, result);
    },
    error: function(error) {
      console.dir(error);
    }
  });
};

var refreshGridData = function($scope) {
  queryWithDateRange($scope, bindGridData);
};

var refreshPie = function($scope, result) {
  var results = result.results,
      len = results.length;
  var pieData = {
    '判决': 0,
    '调解': 0,
    '和解': 0,
    '不予受理': 0,
    '咨询': 0,
    '': 0
  };

  for (var i = 0; i < len; i++) {
    var state = results[i].attributes.state;
    if (typeof(state) !== 'undefined') {
      pieData[state] += 1;
    } else {
      pieData[''] += 1;
    }
  }

  console.log(pieData);

  $scope.charts.pieOption =  {
    tooltip : {
      trigger: 'item',
      formatter: '{b} : {c} ({d}%) <br/>{a}'
    },
    legend: {
      x : 'center',
      y : 'bottom',
      data:['判决', '调解', '和解', '不予受理', '咨询', '无']
    },
    toolbox: {
      show : true,
      feature : {
        restore : {show: true},
        saveAsImage : {show: true}
      }
    },
    calculable : true,
    series : [
      {
        name:'案件总数: ' + result.results.length,
        type:'pie',
        radius : [30, 110],
        center : ['50%', '50%'],
        roseType : 'area',
        selectedMode: 'multiple',
        data:[
          {value:pieData['判决'], name:'判决'},
          {value:pieData['调解'], name:'调解'},
          {value:pieData['和解'], name:'和解'},
          {value:pieData['不予受理'], name:'不予受理'},
          {value:pieData['咨询'], name:'咨询'},
          {value:pieData[''], name:'无'}
        ]
      }
    ]
  };

  $scope.charts.pie.setOption($scope.charts.pieOption);
  $scope.charts.pie.restore();

};

var drawPie = function($scope) {
  queryWithDateRange($scope, refreshPie);
};

var statisCtrl = function($scope, i18nService) {
  i18nService.setCurrentLang('zh-cn');
  $scope.sc = {};

  $scope.charts = {
    pie: echarts.init(document.getElementById('pie-placeholder')),
    pieOption: {}
  };

  drawCalendar();

  drawPie($scope);

  refreshCalendarView($scope);

  $scope.gridOptions = {
    columnDefs: [
      { name: '原告', field: 'plaintiff', width: 150 },
      { name: '被告', field: 'defendants', width: 150 },
      { name: '详细记录', field: 'details' },
      { name: '立案日期', field: 'initDateStr', width: 100 },
      { name: '更新日期', field: 'updateDateStr', width: 100 },
      { name: '结案日期', field: 'finishDateStr', width: 100 },
      { name: '状态', field: 'state', width: 100 }
    ],
    data: [],
    enableGridMenu: true,
    enableSorting: false,
    exporterCsvFilename: 'statistic.csv',
    exporterMenuPdf: false,
    paginationPageSizes: [25, 50, 75, 100],
    paginationPageSize: 25
  };

  var ctrl = this;
  ctrl.query = function() {
    refreshCalendarView($scope);
    drawPie($scope);
    refreshGridData($scope);
  };
  ctrl.reset = function() {
    $scope.sc = {};
    $scope.gridOptions.data = [];
    drawPie($scope);
    refreshCalendarView($scope);
  };
};

var app = angular.module('wa');
app.controller('statisCtrl', statisCtrl);
