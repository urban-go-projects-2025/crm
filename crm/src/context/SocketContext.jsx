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
      // In production (e.g. Vercel) without VITE_SOCKET_URL explicitly set,
      // default to current host over HTTPS/WSS to avoid Mixed Content errors
      const protocol = isHttps ? 'https://' : 'http://';
      socketUrl = `${protocol}${window.location.host}`;
    }

    let newSocket;
    try {
      newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        secure: isHttps,
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
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
