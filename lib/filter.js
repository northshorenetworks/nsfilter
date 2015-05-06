import categorize, {ID_TO_NAMES} from './categorize';
import {find, intersection} from 'lodash';

export default opts => {
  return (req, res, next) => {
    if (req.type === 'dns') {
      let policy = find(opts.policies, {id: opts.dns.policy});

      categorize(req.question[0].name, categories => {
        let blocked = intersection(policy.blockedCategories, categories);
        if (blocked.length > 0) {
          res.redirect(opts.dns.response.ip, opts.dns.response.ttl);
        } else {
          next();
        }
      });

    } else if (req.type === 'http') {
      let policy = find(opts.policies, {id: opts.http.policy});
      let url = req.url;

      if (req.url[0] === '/') {
        url = req.headers.host + req.url;
      }

      categorize(url, categories => {
        let blocked = intersection(policy.blockedCategories, categories);

        if (blocked.length > 0) {
          let categoryNames = blocked.map(c => ID_TO_NAMES[c]).join(', ');
          // TODO: replace base64 encoded block pages with real template files.
          let blockPage = Buffer(opts.http.blockPage, 'base64').toString()
            .replace('<%= website %>', url)
            .replace('<%= reason %>', `Blocked category (${categoryNames})`);

          res.end(blockPage);
        } else {
          next();
        }
      });
    }
  }
}
