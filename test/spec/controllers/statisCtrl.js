'use strict';

describe('Controller: statisCtrl', function () {

  // load the controller's module
  beforeEach(module('wa'));

  var statisCtrl, scope, compile, ele;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $compile) {
    scope = $rootScope.$new();
    compile = $compile;
    statisCtrl = $controller('statisCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    var html = '<div id="bar-placeholder"></div><div id="pie-placeholder"></div>';
    ele = angular.element(html);
    compile(ele)(scope);
    scope.$digest();
    expect(scope.gridOptions.paginationPageSize).toBe(25);
  });
});
