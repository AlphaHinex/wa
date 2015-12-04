'use strict';

var loginCtrl = function($scope, $location, $document) {
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
        $scope.uname = '';
        $scope.pwd = '';
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

  $document.bind('keypress', function(event) {
    // key code 13 is 'enter'
    var code = event.keyCode || event.charCode;
    if (code === 13 && $scope.uname && $scope.pwd) {
      $scope.login();
    }
  });
};

var app = angular.module('wa');
app.controller('loginCtrl', loginCtrl);
