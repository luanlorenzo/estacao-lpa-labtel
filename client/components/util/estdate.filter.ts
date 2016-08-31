'use strict';

(function() {



angular.module('siteCurApp').filter('utc', [function() {
    return function(date) {
      if(angular.isNumber(date)) {
        date = new Date(date);
      }
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }   
  } ]);

})();
