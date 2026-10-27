const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const { ensureDatabaseSeeded } = require('./utils/seed');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION 💥]', err.name, err.message, err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Auto-seed initial demo data if database is empty
    await ensureDatabaseSeeded();

    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: [
          process.env.CLIENT_URL || 'http://localhost:5173',
          'http://127.0.0.1:5173',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    initSocket(io);

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🎬 IMovies Backend Server running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`⚡ Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===============================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('[UNHANDLED REJECTION 💥]', err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully.');
      server.close(() => {
        console.log('💥 Process terminated.');
      });
    });
  } catch (err) {
    console.error('[FATAL] Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
