import http from 'http';
import uuid from 'uuid';
import EventEmitter from 'eventemitter3';
import url from 'url';
import debug from 'debug';

let log = debug('nsfilter:http');

export default class HTTP extends EventEmitter {
  constructor() {
    super();
    this.layers = [];
    this.server = http.createServer((req, res) => this._onRequest(req, res));
    this.listen = (port, cb) => {
      log(`HTTP proxy listening on port ${port}`);
      this.server.listen(port, cb);
    };
  }
  _onRequest(req, res) {

    let self = this;
    let start = process.hrtime();
    req.type = 'http';
    req.id = uuid.v4();

    let path = req.url;
    if (path.includes('http://')) {
      path = url.parse(req.url).pathname;
    }
    
    req.fullUrl = url.format({
      protocol: 'http',
      hostname: req.headers.host,
      pathname: path
    });

    let i = 0;
    function next() {
      if (i >= self.layers.length) {
        let reqOpts = {
          hostname: req.headers.host,
          path: path,
          method: req.method,
          headers: req.headers
        };
        let request = http.request(reqOpts, response => {
          res.writeHead(response.statusCode, response.headers);
          response.on('data', chunk => res.write(chunk));
          response.on('end', () => {
            let end = process.hrtime(start);
            self.emit('response', {
              id: req.id,
              duration: end
            }); 
            res.end()
          });
        });

        req.on('error', err => console.error(err));
        req.on('data', chunk => request.write(chunk));

        req.on('end', () => request.end());
        return;
      }
      i += 1;
      self.layers[i - 1] && self.layers[i - 1](req, res, next);
    }
    next();
  }

  use(fn) {
    this.layers.push(fn);
  }
}