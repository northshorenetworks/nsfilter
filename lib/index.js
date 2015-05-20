'use strict';

let web = require('./web');
let filter = require('./filter');
let identification = require('./identification');
let localDomain = require('./local-domain');
let blocker = require('./blocker');
let log = require('debug')('nsfilter');
let ProxyDNS = require('proxy-dns');
let ProxyHTTP = require('proxy-http');
let Store = require('./store');

let config;

exports = module.exports = function (configPath) {
  try {
    config = require(configPath || '../nsfilter');
  } catch (e) {
    console.error('Configuration file not found.');
    process.exit(1);
  }
  
  log('Configuration loaded.');

  if (process.env.USER !== 'root') {
    console.error('NSFilter must be run as root.');
    process.exit(1);
  }

  web.server.listen(3000);

  if (config.dns.enabled) {
    let dns = new ProxyDNS();
    dns.use(identification(config));
    dns.use(localDomain(config.dns));
    dns.use(filter(config));
    dns.listen(53);
    blocker.listen(80);
  }

  if (config.http.enabled) {
    let sslConfig = {
      ca: {
        cert: Buffer(config.http.ssl.cert, 'base64').toString(),
        key: Buffer(config.http.ssl.key, 'base64').toString()
      },
      csr: {
        country: 'US',
        state: 'Texas',
        locality: 'Longview',
        organization: 'Northshore Network Solutions',
        organizationUnit: '',
        emailAddress: 'support@northshore.io'
      },
      ttl: 10000,
      store: new Store()
    };
    let http = new ProxyHTTP({
      ssl: sslConfig
    });
    http.use(identification(config));
    http.use(filter(config));
    http.listen(config.http.port);
  }
}


