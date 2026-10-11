import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/approved.user.model.js';
import Users from '../models/user.model.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../../env') });
}

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set in .env. Skipping local migration.');
  process.exit(0);
}

async function runMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');

    const now = new Date();
    const trialExpiry = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);

    const defaultSub = {
      plan: 'free_trial',
      status: 'trial',
      trialAvailed: true,
      startDate: now,
      expiresAt: trialExpiry,
      lastOrderId: null,
      lastPaymentId: null
    };

    // 1. Migrate `users` (approved.user.model.js)
    const approvedRes = await User.updateMany(
      { 'subscription.status': { $exists: false } },
      {
        $set: {
          subscription: defaultSub,
          isOnboarded: false
        }
      }
    );
    console.log(`Migrated ${approvedRes.modifiedCount} vendor(s) in approved User model.`);

    // 2. Migrate legacy `Users` (user.model.js) if any exist without subscription
    const usersRes = await Users.updateMany(
      { 'subscription.status': { $exists: false } },
      {
        $set: {
          subscription: defaultSub,
          isOnboarded: false
        }
      }
    );
    console.log(`Migrated ${usersRes.modifiedCount} user(s) in Users model.`);

    console.log('✅ Subscription migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

runMigration();
