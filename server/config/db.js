const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    // Attempt connecting to configured MONGODB_URI
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[DB] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[DB WARNING] Could not connect to primary MongoDB at ${uri}: ${err.message}`);
    
    // In development/test environments, gracefully fall back to mongodb-memory-server
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[DB] Launching standalone development in-memory MongoDB fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[DB] Connected to in-memory fallback MongoDB at ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[DB FATAL] In-memory MongoDB failed to start:', memErr.message);
        throw err;
      }
    } else {
      throw err;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
