import express from 'express';
import http from 'http';
import io, { Socket } from 'socket.io';
import index from '../routes';

const app = express();
const server = http.createServer(app);
const ws = io(server);

app.use(index);

let interval: NodeJS.Timeout;

ws.on('connection', (socket) => {
  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(() => getApiAndEmit(socket), 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

const getApiAndEmit = (socket: Socket) => {
  const response = new Date();
  socket.emit('FromAPI', response);
};

server.listen(4001, () => {
  console.log('listening on http://localhost:4001');
});
