import dns from 'native-dns';
let debug = require('debug')('nsfilter:local');

export default opts => {
  return function *(next) {
    let self = this;
    debug('Checking if domain matches local domains..')

    if (self.type === 'dns') {
      let domain = self.req.question[0].name;
      let localDomains = opts.localdomains.split(',').filter(localDomain => {
        let regExp = new RegExp(localDomain + '$');
        return regExp.test(domain);
      });

      if (localDomains.length > 0) {
        let localDomain = localDomains[0];
        let question = dns.Question({
          name: domain,
          type: 'A'
        });

        // Should reconsider how local domains are configured. If there are
        // multiple local domains, there may be multiple DNS servers & ports
        let request = dns.Request({
          question: question,
          server: { address: opts.localserver, port: 53, type: 'udp' },
          timeout: 1000
        });

        request.on('timeout', () => {
          // Should we respond with NOTFOUND or just timeout here as well?
          self.res.header.rcode = dns.consts.NAME_TO_RCODE.NOTFOUND;
          self.res.send();          
        });

        request.on('message', (err, answer) => {
          answer.answer.forEach(a => self.res.answer.push(a));
        });

        request.on('end', () => {
          if (self.res.answer.length === 0) {
            self.res.header.rcode = dns.consts.NAME_TO_RCODE.NOTFOUND;
          }
          self.res.send();
        });

        request.send();
      } else {
        yield next;
      }
    }
  }
}
