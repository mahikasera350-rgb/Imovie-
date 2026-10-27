let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Join room for a specific show's live seat view
    socket.on('join_show', (showId) => {
      if (showId) {
        socket.join(`show_${showId}`);
      }
    });

    socket.on('leave_show', (showId) => {
      if (showId) {
        socket.leave(`show_${showId}`);
      }
    });

    // Join room for personal user notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });
};

const broadcastSeatsHeld = (showId, seatNumbers, holdExpiresAt) => {
  if (ioInstance) {
    ioInstance.to(`show_${showId}`).emit('seats_held', {
      showId,
      seatNumbers,
      holdExpiresAt,
    });
  }
};

const broadcastSeatsReleased = (showId, seatNumbers) => {
  if (ioInstance) {
    ioInstance.to(`show_${showId}`).emit('seats_released', {
      showId,
      seatNumbers,
    });
  }
};

const broadcastSeatsBooked = (showId, seatNumbers) => {
  if (ioInstance) {
    ioInstance.to(`show_${showId}`).emit('seats_booked', {
      showId,
      seatNumbers,
    });
  }
};

const emitNotificationToUser = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('new_notification', notification);
  }
};

module.exports = {
  initSocket,
  broadcastSeatsHeld,
  broadcastSeatsReleased,
  broadcastSeatsBooked,
  emitNotificationToUser,
};
