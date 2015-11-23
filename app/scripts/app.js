'use strict';

AV.initialize('ncucSqWquNS5qSBCNrqEhA8O', 'd6cARxGcTwgyi0IGz7ss7LHp');
var Case = AV.Object.extend('Case');

var app = angular.module('wa', ['ngRoute', 'ngMaterial', 'md.data.table']);

var allDefendants = function() {
  var all = '人保财险, 平安保险, 天安保险, 中华联合, 人寿财险, ' +
            '浙商保险, 华泰保险, 民安保险, 永安保险, 大地保险, ' +
            '永诚保险, 都邦保险, 信达保险, 华安保险, 太平保险, ' +
            '太平洋保险, 安华农业, 紫金财险, 渤海保险, 中银保险';
  return all.split(/, +/g).map(function(item) {
    return item;
  });
};

var createFilterFor = function(query) {
  return function filterFn(item) {
    return item.indexOf(query) === 0;
  };
};

var newCase = function(ctrl) {
  ctrl.searchText = '';
  return {
    initDate: new Date()
  };
};

var allStates = function() {
  return ['判决', '调解', '和解', '不予受理'];
};

var appCtrl = function($scope, $mdToast) {
  var self = this;
  self.states = allStates();
  self.allDefendants = allDefendants();
  self.querySearch = function(query) {
    return query ? self.allDefendants.filter(createFilterFor(query)) : self.allDefendants;
  };

  $scope.case = newCase(self);

  $scope.save = function() {
    if (!$scope.case.defendants) {
      $scope.case.defendants = self.searchText;
    }
    console.log($scope.case);
    var c = Case.new($scope.case);
    c.save(null, {
      success: function(c) {
        console.log('Save case with objectId: ' + c.id);
        $scope.case = newCase(self);
        $mdToast.show(
          $mdToast.simple()
            .content('保存成功!')
            .position('right top')
            .hideDelay(1500)
        );
      },
      error: function(c, error) {
        console.log('Save case failed cause: ' + error.message);
      }
    });
  };

  $scope.cancel = function() {
    $scope.case = newCase(self);
  };

  self.allCases = [];
  AV.Query.doCloudQuery('select * from Case', {
    success: function(result) {
      var results = result.results;
      angular.forEach(results, function(obj){
        self.allCases.push({
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
    },
    error: function(error) {
      console.dir(error);
    }
  });
};

app.controller('appCtrl', appCtrl);

