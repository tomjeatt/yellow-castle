import express from 'express';
import http from 'http';
import io, { Socket } from 'socket.io';
import index from '../routes';
import createLogger from '@ovotech/orex-logger';
import { fromEnv } from '@ovotech/orex-castle';
import { CastleEachBatchPayload } from '@ovotech/castle';


// SETUP CASTLE
const consumeBatch: (ctx: CastleEachBatchPayload<any, any>) => Promise<void> = async (ctx: CastleEachBatchPayload<any, any>) => {
    console.log(`\n\n***\n${JSON.stringify(ctx)}***\n`);
}

const logger = createLogger({ format: 'json' });
const castle = fromEnv.castle({
  logger,
  consumers: [
    {
      ...fromEnv.batchSizedConsumer(),
      eachSizedBatch: consumeBatch,
      fromBeginning: true,
    },
  ],
});

castle.start().catch((e: any) => {
  logger.error(e);
  castle.stop();
});

// SETUP SERVER
const app = express();
const server = http.createServer(app);
const ws = io(server);

app.use(index);

let interval: NodeJS.Timeout;

const getApiAndEmit = (socket: Socket) => {
  const response = new Date();
  socket.emit('FromAPI', response);
};

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

server.listen(4001, () => {
  console.log('listening on http://localhost:4001');
});
