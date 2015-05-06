import web from './web';
import DNS from './dns';
import HTTP from './http';
import filter from './filter';
import localDomain from './local-domain';
import blocker from './blocker';

var config;

export default configPath => {
  try {
    config = require(configPath || '../nsfilter');
  } catch (e) {
    console.error('Configuration file not found.');
    process.exit(1);
  }

  if (config.dns.enabled) {
    let dns = new DNS(config.dns);
    dns.use(localDomain(config.dns));
    dns.use(filter(config));
    dns.server.listen(config.dns.port);
  }

  if (config.http.enabled) {
    let http = new HTTP();
    http.use(filter(config));
    http.server.listen(config.http.port);
  }

  blocker.listen(80);
  web.server.listen(3000);
}