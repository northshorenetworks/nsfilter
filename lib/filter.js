import categorize, {ID_TO_NAMES} from './categorize';
import {find, intersection} from 'lodash';
let debug = require('debug')('nsfilter:filter');

export default opts => {
  return function *(next) {
    let self = this;
    debug('Filtering request..');
    if (self.type === 'dns') {
      let categories = yield categorize(self.req.question[0].name);
      let blocked = intersection(self.policy.blockedCategories, categories);

      if (blocked.length > 0) {
        self.answer('A', {
          name: self.req.question[0].name,
          address: opts.dns.response.ip,
          ttl: opts.dns.response.ttl
        });
      } else {
        yield next;
      }

    } else if (self.type === 'http') {
      self.policy = find(opts.policies, {id: opts.http.policy});
      let url = self.req.url;

      if (self.req.url[0] === '/') {
        url = self.req.headers.host + self.req.url;
      }

      let categories = yield categorize(url);
      let blocked = intersection(self.policy.blockedCategories, categories);
      if (blocked.length > 0) {
        let categoryNames = blocked.map(c => ID_TO_NAMES[c]).join(', ');
        // TODO: replace base64 encoded block pages with real template files.
        let blockPage = Buffer(opts.http.blockPage, 'base64').toString()
          .replace('<%= website %>', url)
          .replace('<%= reason %>', `Blocked category (${categoryNames})`);

        self.res.end(blockPage);
      } else {
        yield next;
      }
    }
  }
}
