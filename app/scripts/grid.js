'use strict';

var app = angular.module('wa');

app.controller('gridCtrl', function($scope, i18nService){

  i18nService.setCurrentLang('zh-cn');

  $scope.gridOptions = {
    columnDefs: [
      { name: '立案日期', field: 'initDate', cellFilter: 'date:"yyyy-MM-dd"' },
      { name: '结案日期', field: 'finishDate', cellFilter: 'date:"yyyy-MM-dd"' },
      { name: '原告', field: 'plaintiff' },
      { name: '被告', field: 'defendants' },
      { name: '详细记录', field: 'details' },
      { name: '状态', field: 'state' }
    ],
    enableGridMenu: true,
    paginationPageSizes: [25, 50, 75, 100],
    paginationPageSize: 25,
    exporterCsvFilename: 'statistic.csv',
    exporterMenuPdf: false,
    data: []
  };

});
