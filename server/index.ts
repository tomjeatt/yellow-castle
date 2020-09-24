import express from 'express';
import http from 'http';
import io from 'socket.io';
import { CastleEachBatchPayload } from '@ovotech/castle';
import index from '../routes';
import kafkaConsumer from './kafkaConsumer';

const topicStore: CastleEachBatchPayload<any, any>[] = [];

// SETUP SERVER
const app = express();
const server = http.createServer(app);
const ws = io(server);

app.use(index);

ws.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  socket.on('replay', (offset: number = 0) => topicStore.slice(offset).forEach((ctx) => socket.emit('BatchReceived', ctx)));
});

kafkaConsumer(
  'he-loss_updated_v2',
  async (ctx: CastleEachBatchPayload<any, any>) => {
    topicStore.push(ctx);
    Object.keys(ws.sockets.sockets).forEach((x) => {
      console.log('Emitting to socket');
      ws.sockets.sockets[x].emit('BatchReceived', ctx);
    });
  },
);

server.listen(4001, () => {
  console.log('listening on http://localhost:4001');
});
