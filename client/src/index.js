import 'angular';
import 'angular-new-router';
import 'angular-animate';
import 'angular-aria';

// import components / services / directives
import './io';
import './components/dashboard';

let app = angular.module('nsfilter', [
  // third party
  'ngNewRouter',
  'ngAnimate',
  'ngAria',

  // components / services / directives
  'nsfilter.io',
  'nsfilter.dashboard'
]);

app.controller('AppController', ['$router', AppController]);

function AppController($router) {
  $router.config([
    { path: '/', component: 'dashboard' }
  ]);
}

angular.bootstrap(document, ['nsfilter']);