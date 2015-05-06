import ndp from 'native-dns-packet';

angular.module('nsfilter.filters.dns', [])
  .filter('dnsTypeToName', () => input => ndp.consts.QTYPE_TO_NAME[input]);