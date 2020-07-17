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

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const getApiAndEmit = (socket: Socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit('FromAPI', response);
};

server.listen(4000, () => {
  console.log('listening on http://localhost:4000');
});
