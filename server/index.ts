import express from 'express';
import http from 'http';
import io, { Socket } from 'socket.io';
import index from '../routes';

const app = express();
const server = http.createServer(app);
const ws = io(server);

app.use(index);

ws.on('connection', (socket) => {
  console.log('a user connected');
  getApiAndEmit(socket);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const getApiAndEmit = (socket: Socket) => {
  socket.emit('FromAPI', 'API response');
};

server.listen(4001, () => {
  console.log('listening on http://localhost:4001');
});
