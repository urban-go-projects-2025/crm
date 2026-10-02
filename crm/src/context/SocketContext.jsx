import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const isHttps = window.location.protocol === 'https:';
    const envSocketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
    
    let socketUrl;
    if (envSocketUrl) {
      socketUrl = envSocketUrl;
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      socketUrl = 'http://localhost:5000';
    } else {
      // In production (e.g. Vercel) without VITE_SOCKET_URL or VITE_API_URL configured,
      // skip socket connection to prevent connection retry loops against the static frontend host.
      console.info('Socket.io disabled: VITE_SOCKET_URL is not configured in Vercel environment variables.');
      return;
    }

    let newSocket;
    try {
      newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        secure: isHttps,
        autoConnect: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
      });

      newSocket.on('connect_error', (err) => {
        console.warn('Socket connection note:', err.message);
      });

      setSocket(newSocket);
    } catch (err) {
      console.warn('Socket initialization error:', err);
    }

    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
