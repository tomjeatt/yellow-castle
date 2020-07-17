import express from 'express';
import http from 'http';
import io from 'socket.io';

const app = express();
const server = http.createServer(app);
const ws = io(server);

ws.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
