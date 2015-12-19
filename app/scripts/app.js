'use strict';

var avKey = 'ncucSqWquNS5qSBCNrqEhA8O';
var avSecret = 'd6cARxGcTwgyi0IGz7ss7LHp';

AV.initialize(avKey, avSecret);

var deps = [
  'ngMaterial',
  'ngRoute',
  'ui.grid',
  'ui.grid.exporter',
  'ui.grid.moveColumns',
  'ui.grid.pagination',
  'ui.grid.pinning',
  'ui.grid.resizeColumns'
];
var app = angular.module('wa', deps);

var resourcesRoute = function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'loginCtrl',
      templateUrl: 'views/login.html'
    })
    .when('/main', {
      templateUrl: 'views/main.html'
    });
};
app.config(['$routeProvider', resourcesRoute]);

app.constant('allStates', ['无', '判决', '调解', '和解', '不予受理', '咨询']);
