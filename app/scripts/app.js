'use strict';

var avKey = 'ncucSqWquNS5qSBCNrqEhA8O';
var avSecret = 'd6cARxGcTwgyi0IGz7ss7LHp';

AV.initialize(avKey, avSecret);

var deps = [
  'ngMaterial',
  'ui.grid',
  'ui.grid.exporter',
  'ui.grid.moveColumns',
  'ui.grid.pagination',
  'ui.grid.pinning',
  'ui.grid.resizeColumns'
];
angular.module('wa', deps);
