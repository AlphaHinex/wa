'use strict';

var app = angular.module('wa');

var route = function($routeProvider) {
  $routeProvider
    .when('/case', {
      controller: 'caseCtrl',
      templateUrl: 'case/case.html'
    });
};

app.config(['$routeProvider', route]);

var caseCtrl = function($scope, $http) {
  $scope.query = {
    order: 'name',
    limit: 10,
    page: 1,
    label: {
      text: '每页行数',
      of: '/'
    }
  };

  $scope.models = { };
  $http.get('/data/models.json').success(function(data) {
    $scope.models = data;
  });
};

app.controller('caseCtrl', caseCtrl);
