import web from './web';
import DNS from './dns';
import HTTP from './http';
import filter from './filter';
import localDomain from './local-domain';
import blocker from './blocker';
import debug from 'debug';
import ProxyDNS from 'proxy-dns';
import ProxyHTTP from 'proxy-http';
import identification from './identification';
import Store from './store';

var config;
var log = debug('nsfilter');

export default configPath => {
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

  if (config.dns.enabled) {
    let dns = new ProxyDNS();
    dns.use(identification(config));
    dns.use(localDomain(config.dns));
    dns.use(filter(config));
    dns.listen(53);
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

  blocker.listen(80);
  web.server.listen(3000);
}


