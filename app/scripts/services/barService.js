'use strict';

var barService = function() {

  /**
   * Compute the index of bar according to 'today' and guessed 'month' number
   * @param   {Date}   today      Date of the last bar column, current date usually
   * @param   {number} guessMonth Month number by guess
   * @returns {number}
   * Should return a number in [0, 5] range regularly,
   * and -1 when with some exceptions
   */
  this.computeIdx = function(today, guessMonth) {
    var idx = 5 - (today.getMonth() >= guessMonth ?
                    today.getMonth() - guessMonth :
                    (12 + today.getMonth() - guessMonth));
    return idx > -1 && idx < 6 ? idx : -1;
  };

};

var app = angular.module('wa');
app.service('barService', barService);
