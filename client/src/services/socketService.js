import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};

export const joinShowRoom = (showId) => {
  const s = getSocket();
  s.emit('join_show', showId);
};

export const leaveShowRoom = (showId) => {
  const s = getSocket();
  s.emit('leave_show', showId);
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  s.emit('join_user', userId);
};

export default {
  getSocket,
  joinShowRoom,
  leaveShowRoom,
  joinUserRoom,
};
