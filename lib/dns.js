import dns from 'native-dns';
import uuid from 'uuid';
import EventEmitter from 'eventemitter3';
import debug from 'debug';

let log = debug('nsfilter:dns');

export default class DNS extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.layers = [];
    this.server = dns.createServer();
    this.server.on('request', (req, res) => this._onRequest(req, res));
    this.listen = port => {
      log(`DNS server listening on port ${port}`);
      this.server.serve(port);
    };
  }

  _onRequest(req, res) {
    let self = this;
    let question1 = req.question[0];
    let start = process.hrtime();
    let config = this.config;

    req.type = 'dns';
    req.id = uuid.v4();

    self.emit('request', {
      question: req.question[0],
      address: req.address,
      id: req.id
    });

    res.redirect = function (ip, ttl) {
      res.answer.push(dns[dns.consts.QTYPE_TO_NAME[question1.type]]({
        name: question1.name,
        address: ip,
        ttl: ttl || 600
      }));
      res.send();
      let end = process.hrtime(start);
      self.emit('response', {
        id: req.id,
        duration: end,
        answers: res.answer.map(a => a.address)
      });
    };

    let i = 0;
    function next() {
      if (i >= self.layers.length) {
        let question2 = new dns.Question({
          name: question1.name,
          type: dns.consts.QTYPE_TO_NAME[question1.type]
        });

        let request = dns.Request({
          question: question2,
          server: { address: config.request.server, port: 53, type: 'udp' },
          timeout: config.request.timeout
        });

        request.on('timeout', function () {
          res.header.rcode = dns.consts.NAME_TO_RCODE.NOTFOUND;
          res.send();
        });

        request.on('message', function (err, answer) {
          answer.answer.forEach(function (a) {
            res.answer.push(a);
          });
        });

        request.on('end', function () {
          if (res.answer.length === 0) {
            res.header.rcode = dns.consts.NAME_TO_RCODE.NOTFOUND;
          }
          res.send();
          let end = process.hrtime(start);
          self.emit('response', {
            id: req.id,
            duration: end,
            answers: res.answer.map(a => a.address)
          });
        });

        return request.send();
      }
      i += 1;
      self.layers[i - 1] && self.layers[i - 1].bind(self)(req, res, next);
    }
    next();
  }

  use(fn) {
    this.layers.push(fn);
  }
}