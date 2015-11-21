'use strict';

AV.initialize('ncucSqWquNS5qSBCNrqEhA8O', 'd6cARxGcTwgyi0IGz7ss7LHp');
var Case = AV.Object.extend('Case');

var app = angular.module('wa', ['ngRoute', 'ngMaterial', 'md.data.table']);

var allInsurances = function() {
  var all = '大地保险, 中华财险, 永安保险, ' +
            'PICC, 太平洋保险, 大都会, 人保财险';
  return all.split(/, +/g).map(function(ins) {
    return ins;
  });
};

var createFilterFor = function(query) {
  return function filterFn(ins) {
    return ins.indexOf(query) === 0;
  };
};

var newCase = function() {
  return {
    initDate: new Date()
  };
};

var appCtrl = function($scope, $mdToast) {
  var self = this;
  self.insurances = allInsurances();
  self.querySearch = function(query) {
    return query ? self.insurances.filter(createFilterFor(query)) : self.insurances;
  };

  $scope.case = newCase();

  $scope.save = function() {
    if (!$scope.case.insurance) {
      $scope.case.insurance = self.searchText;
    }
    console.log($scope.case);
    var c = Case.new($scope.case);
    c.save(null, {
      success: function(c) {
        console.log('Save case with objectId: ' + c.id);
        $scope.case = newCase();
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
    $scope.case = newCase();
  };
};

app.controller('appCtrl', appCtrl);

