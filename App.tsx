import React, { useState, useEffect } from 'react';
import { CastleEachBatchPayload } from '@ovotech/castle';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:4001';

const App: React.FC = () => {
  const [response, setResponse] = useState('');

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on('BatchReceived', (data: CastleEachBatchPayload<any, any>) => {
      console.log(data);
      setResponse(JSON.stringify(data));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <p>{response}</p>;
};

export default App;
