'use strict';

describe('Service: barService', function () {

  // load the controller's module
  beforeEach(module('wa'));

  var service;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (barService) {
    service = barService;
  }));

  it('should compute the correct idx result', function () {
    expect(service.computeIdx(new Date('2016-02-10'), 8)).toBe(0);
    expect(service.computeIdx(new Date('2016-02-10'), 9)).toBe(1);
    expect(service.computeIdx(new Date('2016-02-10'), 10)).toBe(2);
    expect(service.computeIdx(new Date('2016-02-10'), 11)).toBe(3);
    expect(service.computeIdx(new Date('2016-02-10'), 0)).toBe(4);
    expect(service.computeIdx(new Date('2016-02-10'), 1)).toBe(5);

    expect(service.computeIdx(new Date('2016-01-10'), 7)).toBe(0);
    expect(service.computeIdx(new Date('2016-01-10'), 8)).toBe(1);
    expect(service.computeIdx(new Date('2016-01-10'), 9)).toBe(2);
    expect(service.computeIdx(new Date('2016-01-10'), 10)).toBe(3);
    expect(service.computeIdx(new Date('2016-01-10'), 11)).toBe(4);
    expect(service.computeIdx(new Date('2016-01-10'), 0)).toBe(5);

    expect(service.computeIdx(new Date('2015-12-10'), 6)).toBe(0);
    expect(service.computeIdx(new Date('2015-12-10'), 7)).toBe(1);
    expect(service.computeIdx(new Date('2015-12-10'), 8)).toBe(2);
    expect(service.computeIdx(new Date('2015-12-10'), 9)).toBe(3);
    expect(service.computeIdx(new Date('2015-12-10'), 10)).toBe(4);
    expect(service.computeIdx(new Date('2015-12-10'), 11)).toBe(5);

    expect(service.computeIdx(new Date('2015-12-10'), 5)).toBe(-1);
    expect(service.computeIdx(new Date('2015-12-10'), 12)).toBe(-1);
  });
});
