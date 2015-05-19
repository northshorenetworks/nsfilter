exports = module.exports = function () {
  var cache  = {};
  this.get = function (domain, fn) {
    fn(null, cache[domain] || null);
  };

  this.set = function (certKeyData, fn) {
    cache[certKeyData.domain] = {
      cert: certKeyData.cert,
      key: certKeyData.key
    };
    fn();
  };
};