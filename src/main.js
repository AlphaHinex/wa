'use strict';

var app = angular.module('wa', ['ngRoute', 'ngMaterial', 'md.data.table']);

var appCtrl = function($scope) {
  $scope.case = {
    date: new Date()
  };

  $scope.save = function() {
    console.log($scope.case);
  };

  $scope.cancel = function() {
    $scope.case = {
      date: new Date()
    };
  };
};

app.controller('appCtrl', appCtrl);

