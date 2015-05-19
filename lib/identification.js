let find = require('lodash').find;
let sortBy = require('lodash').sortBy;
let debug = require('debug')('nsfilter:ident');

export default config => {
  return function *(next) {
    debug('Identifying requester.');
    let self = this;
    let ip = self.req.ip;
    if (ip.includes('.') && ip.includes(':')) {
      ip = ip.split(':').slice(-1)[0];
    }
    let user = find(config.auth.users, {ip: ip});
    if (user) {
      let policies = [];

      // Find groups and group policies of user
      user.groups = user.groups.map(function (id) {
        let group = find(config.auth.groups, {id: id});
        if (group) {
          let policy = find(config.policies, {
            id: group.policy[self.type]
          });
          if (policy) {
            policies.push(policy);
          }
        }
        return group;
      });

      // Find policy specific to user
      let policy = find(config.policies, {id: user.policy[self.type]});
      policies.push(policy);

      self.req.user = user;
      self.policy = sortBy(policies, 'priority')[policies.length - 1];
    } else {
      self.policy = find(config.policies, {id: config[self.type].policy});
    }
    yield next;
  };
};