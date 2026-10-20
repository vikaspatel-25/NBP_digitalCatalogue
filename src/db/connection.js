import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

export async function connectDB(url) {
  if (!url) {
    console.warn('WARNING: No MongoDB connection URL provided.');
    return false;
  }
  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('Connected to database');
    return true;
  } catch (error) {
    console.error('Error while connecting to database:', error.message || error);
    return false;
  }
}

/**
 * Ensures MongoDB connection is active, auto-reconnecting if dropped.
 * Returns true if connected, false if unavailable.
 */
export async function ensureConnected() {
  if (mongoose.connection.readyState === 1) return true;
  if (mongoose.connection.readyState === 2) {
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 200));
      if (mongoose.connection.readyState === 1) return true;
    }
  }
  const url = process.env.MONGO_URI;
  if (url) {
    try {
      console.log('Auto-reconnecting to MongoDB...');
      await mongoose.connect(url, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000
      });
      return mongoose.connection.readyState === 1;
    } catch (err) {
      console.error('Auto-reconnection to MongoDB failed:', err.message || err);
      return false;
    }
  }
  return false;
}
