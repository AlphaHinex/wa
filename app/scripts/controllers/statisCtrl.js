'use strict';

var format = d3.time.format('%Y-%m-%d');

var oneDayUnit = 24 * 60 * 60 * 1000;
var today = new Date();
var lastYear = new Date(today.getTime() - 365 * oneDayUnit);

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
  var max = 30;
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
                'or (updatedAt >= date(\'' + from + '\') and updatedAt <= date(\'' + to + '\'))) ' +
             'limit 1000';
  AV.Query.doCloudQuery(cql, {
    success: function(result) {
      var rects = d3.selectAll('rect').data(d3.time.days(lastYear, today)).datum(format).filter(function(d) { return d === dateStr; })
        .attr('class', function() { return 'day ' + color(result.count / max); });
      rects.select('title').text(function(d) { return d + ': ' + result.count + ' 件案子'; });
      rects.on('mouseover', function(d) {
        document.getElementById('dayCountMsg').innerHTML = d + ':' + result.count + ' 件案子';
      });
    },
    error: function(error) {
      console.dir(error);
    }
  });
};

var refreshCalendarView = function($scope) {
  var begining = new Date('2015-10-14');
  angular.forEach(d3.time.days(begining < lastYear ? lastYear : begining, today), function(d) {
    dailyCount(format(d), $scope);
  });
};

var doQuery = function($scope, conditions, allStates, callbacks) {
  var cql = 'select * ' +
              'from Case ' +
             'where plaintiff > \'\' ' + conditions + ' ' +
          'order by updatedAt desc ' +
             'limit 1000';
  AV.Query.doCloudQuery(cql, {
    success: function(result) {
      angular.forEach(callbacks, function (callback) {
        callback($scope, result, allStates);
      });
    },
    error: function(error) {
      console.dir(error);
    }
  });
};

var queryWithDateRange = function($scope, allStates, callbacks) {
  var sc = $scope.sc, scPart = '', fromDate, toDate;
  if (sc.fromDate && sc.toDate) {
    fromDate = format(sc.fromDate) + 'T00:00:00.000Z';
    toDate = format(sc.toDate) + 'T23:59:59.999Z';
    var initDateCond = '(initDate >= date(\'' + fromDate + '\') and initDate <= date(\'' + toDate + '\'))';
    var updatedAtCond = '(updatedAt >= date(\'' + fromDate + '\') and updatedAt <= date(\'' + toDate + '\'))';
    scPart += 'and (' + initDateCond + ' or ' + updatedAtCond + ') ';
  } else if (sc.fromDate) {
    fromDate = format(sc.fromDate) + 'T00:00:00.000Z';
    scPart += 'and (initDate >= date(\'' + fromDate + '\') or updatedAt >= date(\'' + fromDate + '\')) ';
  } else if (sc.toDate) {
    toDate = format(sc.toDate) + 'T23:59:59.999Z';
    scPart += 'and (initDate <= date(\'' + toDate + '\') or updatedAt <= date(\'' + toDate + '\')) ';
  }
  if (sc.state) {
    scPart += 'and state = \'' + sc.state + '\' ';
  }
  if (sc.defendants || sc.searchText) {
    scPart += 'and defendants like \'%' + (sc.defendants ? sc.defendants : sc.searchText) + '%\' ';
  }

  doQuery($scope, scPart, allStates, callbacks);
};

var refreshPie = function($scope, result, allStates) {
  var results = result.results,
      len = results.length,
      pieData = {};

  angular.forEach(allStates, function(state) {
    pieData[state] = 0;
  });

  for (var i = 0; i < len; i++) {
    var state = results[i].attributes.state;
    if (typeof(state) !== 'undefined') {
      pieData[state] += 1;
    }
  }

  $scope.charts.pieOption =  {
    tooltip : {
      trigger: 'item',
      formatter: '{b} : {c} ({d}%) <br/>{a}'
    },
    legend: {
      data: allStates
    },
    toolbox: {
      show : true,
      orient: 'vertical',
      y: 'center',
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
        data:[]
      }
    ]
  };

  angular.forEach(allStates, function(state) {
    $scope.charts.pieOption.series[0].data.push({value: pieData[state], name: state});
  });

  $scope.charts.pie.setOption($scope.charts.pieOption);
  $scope.charts.pie.restore();
};

var bindGridData = function($scope, result) {
  $scope.gridOptions.data = [];
  $scope.total = 0;
  angular.forEach(result.results, function (obj) {
    $scope.gridOptions.data.push({
      initDateStr: format(obj.attributes.initDate),
      updateDateStr: format(obj.updatedAt),
      finishDateStr: typeof(obj.attributes.finishDate) !== 'undefined' ? format(obj.attributes.finishDate) : '',
      plaintiff: obj.attributes.plaintiff,
      defendants: obj.attributes.defendants,
      details: obj.attributes.details,
      state: obj.attributes.state,
      tel: obj.attributes.tel,
      amount: obj.attributes.amount
    });
    var step = parseFloat(obj.attributes.amount);
    $scope.total += isNaN(step) ? 0 : step;
  });
  $scope.total = $scope.total.toFixed(2);
};

var renderByDateRangeQuery = function($scope, allStates) {
  queryWithDateRange($scope, allStates, [refreshPie, bindGridData]);
};

var queryWithLastHalfYear = function($scope, allStates, callbacks) {
  $scope.charts.barOption = {
    tooltip : {
      trigger: 'axis',
      formatter: function(params) {
        var sum = 0;
        for (var i = 0; i < params.length; i++) {
          sum += params[i].data;
        }
        var label = params[0].name;
        label += '<br/>总数:' + sum;
        angular.forEach(params, function(p) {
          label += '<br/>' + p.seriesName + ':' + p.data;
        });
        return label;
      }
    },
    legend: {
      data: allStates
    },
    toolbox: {
      show : true,
      orient: 'vertical',
      x: 'left',
      y: 'center',
      feature : {
        restore : {show: true},
        saveAsImage : {show: true}
      }
    },
    calculable : true,
    xAxis : [{
      splitLine: {show: false},
      data : []
    }],
    yAxis: [{
      type: 'value'
    }],
    series : []
  };

  angular.forEach(allStates, function(state) {
    $scope.charts.barOption.series.push({
      name: state,
      type: 'bar',
      stack: 'sum',
      data: [0, 0, 0, 0, 0, 0]
    });
  });

  var lastHalfYear = d3.time.months(lastYear, today).slice(6, 12);
  var f = d3.time.format('%Y-%m');
  angular.forEach(lastHalfYear, function(m) {
    $scope.charts.barOption.xAxis[0].data.push(f(m));
    var fromDate = format(m) + 'T00:00:00.000Z';
    var toDate = format(new Date(m.getFullYear(), m.getMonth()+1, 1)) + 'T00:00:00.000Z';
    var initDateCond = '(initDate >= date(\'' + fromDate + '\') and initDate < date(\'' + toDate + '\'))';
    var updatedAtCond = '(updatedAt >= date(\'' + fromDate + '\') and updatedAt < date(\'' + toDate + '\'))';
    var conditions = 'and (' + initDateCond + ' or ' + updatedAtCond + ') ';

    doQuery($scope, conditions, allStates, callbacks);
  });
};

var refreshBar = function($scope, result, allStates) {
  var results = result.results,
      len = results.length,
      barData = {};

  if (len === 0) {
    return;
  }

  angular.forEach(allStates, function(state) {
    barData[state] = 0;
  });

  var guessMonth, monthCollector = {};
  for (var i = 0; i < len; i++) {
    var state = results[i].attributes.state;
    var initMonth = results[i].attributes.initDate.getMonth();
    var updateMonth = results[i].updatedAt.getMonth();
    if (initMonth === updateMonth) {
      guessMonth = updateMonth;
    } else {
      if (monthCollector[initMonth]) {
        monthCollector[initMonth] += 1;
      } else {
        monthCollector[initMonth] = 0;
      }
      if (monthCollector[updateMonth]) {
        monthCollector[updateMonth] += 1;
      } else {
        monthCollector[updateMonth] = 0;
      }
    }
    if (typeof(state) !== 'undefined') {
      barData[state] += 1;
    }
  }
  if (!guessMonth) {
    var properties = [];
    for (var p in monthCollector) {
      properties.push(p);
    }
    guessMonth = monthCollector[properties[0]] >= monthCollector[properties[1]] ? properties[0] : properties[1];
  }

  var idx = $scope.computeIdx(today, guessMonth);

  for (var j = 0; j < allStates.length; j++) {
    $scope.charts.barOption.series[j].data[idx] = barData[allStates[j]];
  }

  $scope.charts.bar.setOption($scope.charts.barOption);
  $scope.charts.bar.restore();
};

var renderBarChart = function($scope, allStates) {
  queryWithLastHalfYear($scope, allStates, [refreshBar]);
};

var statisCtrl = function($scope, i18nService, allStates, barService) {
  i18nService.setCurrentLang('zh-cn');
  $scope.sc = {};
  $scope.total = 0;

  $scope.computeIdx = barService.computeIdx;

  $scope.charts = {
    bar: echarts.init(document.getElementById('bar-placeholder')),
    barOption: {},
    pie: echarts.init(document.getElementById('pie-placeholder')),
    pieOption: {}
  };

  drawCalendar();
  refreshCalendarView($scope);
  renderByDateRangeQuery($scope, allStates);
  renderBarChart($scope, allStates);

  $scope.gridOptions = {
    columnDefs: [
      { name: '原告', field: 'plaintiff', width: 100 },
      { name: '原告电话', field: 'tel', width: 150 },
      { name: '被告', field: 'defendants', width: 150 },
      { name: '诉讼标的', field: 'amount', width: 150, aggregationType: function() { return '合计:' + $scope.total; } },
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
    paginationPageSize: 25,
    showColumnFooter: true
  };

  var ctrl = this;
  ctrl.query = function() {
    refreshCalendarView($scope);
    renderByDateRangeQuery($scope, allStates);
  };
  ctrl.reset = function() {
    $scope.sc = {};
    $scope.gridOptions.data = [];
    refreshCalendarView($scope);
    renderByDateRangeQuery($scope, allStates);
  };
};

var app = angular.module('wa');
app.controller('statisCtrl', statisCtrl);
