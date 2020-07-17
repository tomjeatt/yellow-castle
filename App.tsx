import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:4001';

const App: React.FC = () => {
  const [response, setResponse] = useState('');

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on('FromAPI', (data: string) => {
      setResponse(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <p>{response}</p>;
};

export default App;
