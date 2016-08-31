'use strict';

(function() {



angular.module('siteCurApp.util')
  .factory('Util', function () {
    return function(date) {
      if(angular.isNumber(date)) {
        date = new Date(date);
      }
      console.log(date);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(),  date.getHours(), date.getMinutes(), date.getSeconds());
    }
  });

})();
