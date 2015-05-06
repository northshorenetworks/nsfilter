import prettyHrtime from 'pretty-hrtime';

angular.module('nsfilter.filters.time', [])
  .filter('hrtime', () => input => prettyHrtime(input));