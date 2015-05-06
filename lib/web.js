import http from 'http';
import path from 'path';
import express from 'express';
import socketio from 'socket.io';

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.use(express.static(path.resolve(__dirname, '../client/dist')));

export default { server, io };