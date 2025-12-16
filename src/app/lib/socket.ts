import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(BACKEND_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
  });

  socket.on('disconnect', () => {
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId: string) => {
  socket?.emit('join:conversation', conversationId);
};

export const leaveConversation = (conversationId: string) => {
  socket?.emit('leave:conversation', conversationId);
};

export const emitTypingStart = (conversationId: string) => {
  socket?.emit('typing:start', { conversationId });
};

export const emitTypingStop = (conversationId: string) => {
  socket?.emit('typing:stop', { conversationId });
};
