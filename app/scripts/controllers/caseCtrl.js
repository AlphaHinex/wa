'use strict';

var Case = AV.Object.extend('Case');

var showTitle = function($scope) {
  var rq = new AV.Query(AV.Role);
  rq.equalTo('users', AV.User.current());
  rq.find({
    success: function(results) {
      if (results.length === 1) {
        var role = results[0];
        $scope.role = role;
        $scope.roleName = role.getName();
        if ($scope.roleName === 'tx') {
          $scope.title = '铁西区交通法庭';
        } else {
          $scope.title = 'Wendy & Alpha';
        }
      } else if (results.length > 1) {
        $scope.role = results[0];
        $scope.roleName = results[0].getName();
        $scope.title = 'Wendy & Alpha';
      }
    },
    error: function(e) {
      console.debug(e);
    }
  });
};

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
  ctrl.queryString = '';
  $scope.case = {
    initDate: new Date(),
    amount: null,
    state: '无'
  };
};

var allStates = function() {
  return ['无', '判决', '调解', '和解', '不予受理', '咨询'];
};

var refreshList = function(ctrl, $scope) {
  ctrl.querying = true;
  ctrl.allCases = [];
  var scPart = $scope.case.plaintiff ? 'and plaintiff like \'%' + $scope.case.plaintiff + '%\' ' : '';
  scPart += ctrl.queryString ? 'and details like \'%' + ctrl.queryString + '%\'' : '';
  var cql = 'select * ' +
              'from Case ' +
             'where plaintiff > \'\' ' + scPart + ' ' +
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
          state: obj.attributes.state,
          tel: obj.attributes.tel,
          amount: obj.attributes.amount,
          amountFormula: obj.attributes.amountFormula
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

var getACL = function($scope) {
  var acl = new AV.ACL();
  acl.setRoleReadAccess($scope.role, true);
  acl.setRoleWriteAccess($scope.role, true);
  return acl;
};

var postSaveAndUpdate = function(ctrl, $scope, $mdToast) {
  resetCase(ctrl, $scope);
  refreshList(ctrl, $scope);
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
    success: function() {
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
        c.set('tel', $scope.case.tel);
        c.set('amount', $scope.case.amount);
        c.set('amountFormula', $scope.case.amountFormula);
        c.setACL(getACL($scope));
        c.save(null, saveOrUpdateCallbacks($log, ctrl, $scope, $mdToast));
      },
      error: function(c, error) {
        $log.debug('Update case failed cause: ' + error.message);
      }
    });
  } else {
    var c = Case.new($scope.case);
    c.setACL(getACL($scope));
    c.save(null, saveOrUpdateCallbacks($log, ctrl, $scope, $mdToast));
  }
};

var setColor = function(state) {
  var states = allStates();
  var result = 'font-weight: bold; color: ';
  switch (state) {
    case states[1]:
      result += 'red';
      break;
    case states[2]:
      result += 'purple';
      break;
    case states[3]:
      result += 'green';
      break;
    case states[4]:
      result += 'blue';
      break;
    case states[5]:
      result += 'brown';
      break;
  }
  return result;
};

var caseCtrl = function($scope, $mdToast, $log, $location) {
  $scope.logout = function() {
    AV.User.logOut();
    $location.url('/');
  };

  if (!AV.User.current()) {
    $scope.logout();
  } else {
    $scope.logged = true;
    $scope.username = AV.User.current().getUsername();
  }

  showTitle($scope);

  var self = this;
  self.states = allStates();
  self.allDefendants = allDefendants();

  resetCase(self, $scope);
  refreshList(self, $scope);

  self.querySearch = function(query) {
    return query ? self.allDefendants.filter(createFilterFor(query)) : self.allDefendants;
  };

  $scope.save = function() {
    saveOrUpdate($log, self, $scope, $mdToast);
  };

  $scope.cancel = function() {
    resetCase(self, $scope);
    refreshList(self, $scope);
  };

  self.selectCase = function(item) {
    $scope.case = item;
    self.searchText = $scope.case.defendants;
  };

  $scope.doQuery = function() {
    refreshList(self, $scope);
  };

  self.setColor = setColor;

  $scope.computeAmount = function() {
    var f = $scope.case.amountFormula.toString();
    f = f.replace(/[^\d+-\\*\/]*/g, '');
    /*jshint -W061 */
    $scope.case.amount = parseFloat(eval(f).toFixed(2));
  };
};

var app = angular.module('wa');
app.controller('caseCtrl', caseCtrl);
