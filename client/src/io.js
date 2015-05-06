import 'angular-socket-io';

angular.module('nsfilter.io', ['btford.socket-io'])
  .factory('io', ['socketFactory', socketFactory => socketFactory()]);