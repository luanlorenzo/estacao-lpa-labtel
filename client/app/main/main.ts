'use strict';

angular.module('siteCurApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        template: '<main></main>',
        //authenticate: true
      });
  });
