'use strict';

var loginCtrl = function($scope, $location) {
  if (AV.User.current()) {
    $location.url('/main');
  } else {
    $scope.needLogin = true;
  }

  $scope.imagePath = 'images/fall.jpeg';

  $scope.login = function() {
    $scope.loging = true;
    AV.User.logIn($scope.uname, $scope.pwd, {
      success: function() {
        $scope.loginErr = false;
        $scope.loging = false;
        $location.url('/main');
      },
      error: function() {
        console.log('failed');
        $scope.loging = false;
        $scope.uname = '';
        $scope.pwd = '';
        $scope.loginErr = true;
      }
    });
  };
};

var app = angular.module('wa');
app.controller('loginCtrl', loginCtrl);
