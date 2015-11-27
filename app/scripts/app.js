'use strict';

AV.initialize('ncucSqWquNS5qSBCNrqEhA8O', 'd6cARxGcTwgyi0IGz7ss7LHp');
var Case = AV.Object.extend('Case');

var app = angular.module('wa', ['ngRoute', 'ngMaterial', 'md.data.table']);

var allDefendants = function() {
  var all = '人保财险, 平安保险, 天安保险, 中华联合, 人寿财险, ' +
            '浙商保险, 华泰保险, 民安保险, 永安保险, 大地保险, ' +
            '永诚保险, 都邦保险, 信达保险, 华安保险, 太平保险, ' +
            '太平洋保险, 安华农业, 紫金财险, 渤海保险, 中银保险, ' +
            '英大泰和保险';
  return all.split(/, +/g).map(function(item) {
    return item;
  });
};

var createFilterFor = function(query) {
  return function filterFn(item) {
    return item.indexOf(query) !== -1;
  };
};

var resetCase = function(ctrl, $scope) {
  ctrl.searchText = '';
  $scope.case = {
    initDate: new Date()
  };
};

var allStates = function() {
  return ['判决', '调解', '和解', '不予受理', '咨询'];
};

var refreshList = function(ctrl) {
  ctrl.querying = true;
  ctrl.allCases = [];
  var wherePart = ctrl.nameFilter ? 'where plaintiff like \'%' + ctrl.nameFilter + '%\' ' : '';
  var cql = 'select * ' +
    'from Case ' +
    wherePart +
    'order by updatedAt desc ' +
    'limit 20';

  AV.Query.doCloudQuery(cql, {
    success: function(result) {
      var results = result.results;
      angular.forEach(results, function(obj){
        ctrl.allCases.push({
          id: obj.id,
          createdAt: obj.createdAt,
          updatedAt: obj.updatedAt,
          initDate: obj.attributes.initDate,
          finishDate: obj.attributes.finishDate,
          plaintiff: obj.attributes.plaintiff,
          defendants: obj.attributes.defendants,
          details: obj.attributes.details,
          state: obj.attributes.state
        });
      });
      ctrl.querying = false;
    },
    error: function(error) {
      ctrl.querying = false;
      console.dir(error);
    }
  });
};

var postSaveAndUpdate = function(ctrl, $scope, $mdToast) {
  resetCase(ctrl, $scope);
  refreshList(ctrl);
  ctrl.submiting = false;
  $mdToast.show(
    $mdToast.simple()
      .content('保存成功!')
      .position('right top')
      .hideDelay(1500)
  );
};

var saveOrUpdateCallbacks = function($log, ctrl, $scope, $mdToast) {
  return {
    success: function(c) {
      $log.debug('Save case with objectId: ' + c.id);
      postSaveAndUpdate(ctrl, $scope, $mdToast);
    },
    error: function(c, error) {
      $log.debug('Save case failed cause: ' + error.message);
    }
  };
};

var saveOrUpdate = function($log, ctrl, $scope, $mdToast) {
  ctrl.submiting = true;
  if (!$scope.case.defendants) {
    $scope.case.defendants = ctrl.searchText;
  }
  $log.debug($scope.case);

  if ($scope.case.id) {
    var query = new AV.Query(Case);
    query.get($scope.case.id, {
      success: function(c) {
        c.set('initDate', $scope.case.initDate);
        c.set('finishDate', $scope.case.finishDate);
        c.set('plaintiff', $scope.case.plaintiff);
        c.set('defendants', $scope.case.defendants);
        c.set('details', $scope.case.details);
        c.set('state', $scope.case.state);
        c.save(null, saveOrUpdateCallbacks($log, ctrl, $scope, $mdToast));
      },
      error: function(c, error) {
        $log.debug('Update case failed cause: ' + error.message);
      }
    });
  } else {
    var c = Case.new($scope.case);
    c.save(null, saveOrUpdateCallbacks($log, ctrl, $scope, $mdToast));
  }
};

var setColor = function(state) {
  var states = allStates();
  var result = 'font-weight: bold; color: ';
  switch (state) {
    case states[0]:
      result += 'red';
      break;
    case states[1]:
      result += 'purple';
      break;
    case states[2]:
      result += 'green';
      break;
    case states[3]:
      result += 'blue';
      break;
    case states[4]:
      result += 'brown';
      break;
  }
  return result;
};

var dailyCount = function(max, dateStr) {
  var from = new Date(dateStr);
      from.setUTCHours(0, 0, 0, 0);
      from = from.toISOString();
  var to = new Date(dateStr);
      to.setUTCHours(23, 59, 59, 999);
      to = to.toISOString();
  var cql = 'select count(*) ' +
    'from Case ' +
      //'where plaintiff like \'%张%\' ' +
    'where plaintiff > \'\' ' +
    'and ((createdAt < date(\'' + to + '\') and createdAt > date(\'' + from + '\')) ' +
    'or (updatedAt > date(\'' + from + '\') and updatedAt < date(\'' + to + '\')))';
  AV.Query.doCloudQuery(cql, {
    success: function(result) {
      console.log(dateStr + ':' + (result.count / max));
    },
    error: function(error) {
      console.dir(error);
    }
  });
};

var appCtrl = function($scope, $mdToast, $log) {
  var self = this;
  self.states = allStates();
  self.allDefendants = allDefendants();

  resetCase(self, $scope);
  refreshList(self);

  self.querySearch = function(query) {
    return query ? self.allDefendants.filter(createFilterFor(query)) : self.allDefendants;
  };

  $scope.save = function() {
    saveOrUpdate($log, self, $scope, $mdToast);
  };

  $scope.cancel = function() {
    resetCase(self, $scope);
    refreshList(self);
  };

  self.selectCase = function(item) {
    $scope.case = item;
    self.searchText = $scope.case.defendants;
  };

  $scope.searchByName = function() {
    refreshList(self);
  };

  self.setColor = setColor;

  $scope.test = function() {
    dailyCount(10, '2015-11-22');
    dailyCount(10, '2015-11-23');
    dailyCount(10, '2015-11-24');
  };
};

app.controller('appCtrl', appCtrl);
