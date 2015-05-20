'use strict';

let koa = require('koa');
let categorize = require('./categorize');
const ID_TO_NAMES = categorize.ID_TO_NAMES;

let app = exports = module.exports = koa();

app.use(function *(next) {
  let self = this;
  let categories = yield categorize(req.headers.host);
  categories = categories.map(function (category) {
    return ID_TO_NAMES[category];
  }).join(', ');   
  this.body = `<h1>Page Blocked</h1><strong>Reason:</strong> ${categories}`;
});

