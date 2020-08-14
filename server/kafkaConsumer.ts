import createLogger from '@ovotech/orex-logger';
import { fromEnv } from '@ovotech/orex-castle';
import { CastleEachBatchPayload } from '@ovotech/castle';

const kafkaConsumer = (
  topic: string,
  callback: (ctx: CastleEachBatchPayload<any, any>) => Promise<void>,
) => {
  const logger = createLogger({ format: 'json' });

  const batchConsumer: (
    ctx: CastleEachBatchPayload<any, any>,
  ) => Promise<void> = async (ctx: CastleEachBatchPayload<any, any>) => {
    console.log(`Message received: ${ctx.producer.topicsAlias}`);
    await callback(ctx);
  };

  const castle = fromEnv.castle({
    logger,
    consumers: [
      {
        ...fromEnv.batchSizedConsumer(),
        topic,
        eachSizedBatch: batchConsumer,
        fromBeginning: true,
      },
    ],
  });

  castle.start().catch((e: any) => {
    logger.error(e);
    castle.stop();
  });

  return castle;
};

export default kafkaConsumer;
