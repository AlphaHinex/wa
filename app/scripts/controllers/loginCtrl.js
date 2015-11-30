'use strict';

var loginCtrl = function($scope, $location) {
  $scope.imagePath = 'images/fall.jpeg';

  $scope.login = function() {
    $location.url('/main');
  };
};

var app = angular.module('wa');
app.controller('loginCtrl', loginCtrl);
