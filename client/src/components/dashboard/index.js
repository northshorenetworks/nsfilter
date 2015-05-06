import '../../filters/dns';
import '../../filters/time';
import _ from 'lodash';
import prettyHrtime from 'pretty-hrtime';

angular.module('nsfilter.dashboard', [
    'nsfilter.io', 
    'nsfilter.filters.dns',
    'nsfilter.filters.time'
  ])
  .controller('DashboardController', [
    'io',
    DashboardController
  ]);

function DashboardController(io) {
  this.dnsQueries = [];
  this.httpQueries = [];

  io.on('dns:request', data => this.dnsQueries.push(data));
  io.on('http:request', data => this.httpQueries.push(data));
  io.on('dns:response', data => {
    let request = _.find(this.dnsQueries, {id: data.id});
    request = _.assign(request, data);
  });
  io.on('http:response', data => {
    let request = _.find(this.httpQueries, {id: data.id});
    request = _.assign(request, data);
  });

  this.avgDuration = function() {
    if (!this.queries.length) {
      return;
    }

    let durations = _.pluck(this.queries, 'duration')
                      .map(a => a ? a[1] : 0)
                      .reduce((a, b) => a + b);
    // let sum = _.sum(durations);
    return prettyHrtime([0, durations / this.queries.length]);
  };
}