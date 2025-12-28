import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

export async function connectDB(url) {
  try {
    await mongoose.connect(url);
    console.log('Connected to database');
  } catch (error) {
    console.error('Error while connecting to database', error);
    process.exit(1);
  }
}