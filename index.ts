import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
