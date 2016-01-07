'use strict';

describe('Controller: statisCtrl', function () {

  // load the controller's module
  beforeEach(module('wa'));

  var statisCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    statisCtrl = $controller('statisCtrl', {
      $scope: scope,
      echarts: {
        init: function() {
          console.log('echarts init function invoked');
        }
      }
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.gridOptions.paginationPageSize).toBe(25);
  });
});
