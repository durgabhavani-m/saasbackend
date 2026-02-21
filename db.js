import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in environment');
  }

  try {
    await mongoose.connect(uri);
    console.log(`✅ Connected to MongoDB (db: ${mongoose.connection.name})`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}
