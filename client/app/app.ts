'use strict';

angular.module('siteCurApp', [
  'siteCurApp.auth',
  'siteCurApp.admin',
  'siteCurApp.constants',
  'siteCurApp.sensor',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match',
  'ui.bootstrap.datetimepicker',
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .run(function ($rootScope, Auth) {
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
      Auth.isLoggedIn(function (state) {
        $rootScope.userLoggedIn = state;
      });
    });
  })
  .directive('hcChart', function () {
    return {
        restrict: 'E',
        template: '<div></div>',
        replace: true,
        scope: {
            options: '=',
            highChart: '=model'
        },
        link: function (scope, element) {
            scope.highChart = Highcharts.chart(element[0], scope.options);
        }
    };
})
