'use strict';

let app = require('koa')();
let serve = require('koa-static');
let path = require('path');

app.use(serve(path.resolve(__dirname, '../client/dist')));

let server = require('http').createServer(app.callback());
let io = require('socket.io')(server);

module.exports = {
  io: io,
  server: server
};