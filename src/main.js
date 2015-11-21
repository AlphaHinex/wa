'use strict';

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

var appCtrl = function($scope) {
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
  };

  $scope.cancel = function() {
    $scope.case = newCase();
  };
};

app.controller('appCtrl', appCtrl);

